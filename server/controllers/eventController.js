const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const crypto = require("crypto");
const Notification = require("../models/Notification");
const { notifyRegisteredStudents } = require("../utils/eventNotifications");

exports.listEvents = async (req, res) => {
  try {
    const { search = "", category = "All", sort = "soonest" } = req.query;
    const filter = { status: "approved" };
    if (category !== "All") filter.category = category;
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { clubName: { $regex: search.trim(), $options: "i" } },
        { venue: { $regex: search.trim(), $options: "i" } }
      ];
    }
    const sortBy = sort === "latest" ? { createdAt: -1 } : { startDate: 1 };
    const events = await Event.find(filter).sort(sortBy).lean();
    const counts = await Registration.aggregate([
      { $match: { event: { $in: events.map(e => e._id) }, status: "registered" } },
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [String(c._id), c.count]));
    res.json({ events: events.map(e => ({ ...e, registeredCount: countMap.get(String(e._id)) || 0 })) });
  } catch (error) {
    res.status(500).json({ message: "Could not load events." });
  }
};

exports.getEvent = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
  const event = await Event.findById(req.params.id);
  if (!event || (event.status !== "approved" && String(event.organizer) !== String(req.user?._id) && req.user?.role !== "admin")) {
    return res.status(404).json({ message: "Event not found." });
  }
  const registeredCount = await Registration.countDocuments({ event: event._id, status: "registered" });
  res.json({ event: { ...event.toObject(), registeredCount } });
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, venue, startDate, registrationDeadline, capacity, clubName } = req.body;
    if (!title?.trim() || !description?.trim() || !category || !venue?.trim() || !startDate || !registrationDeadline || !clubName?.trim()) {
      return res.status(400).json({ message: "Please fill in all event fields." });
    }
    const cap = Number(capacity);
    const start = new Date(startDate);
    const deadline = new Date(registrationDeadline);
    if (!Number.isInteger(cap) || cap < 1 || cap > 10000) return res.status(400).json({ message: "Capacity must be an integer between 1 and 10000." });
    if (Number.isNaN(start.getTime()) || Number.isNaN(deadline.getTime()) || deadline > start) {
      return res.status(400).json({ message: "Provide valid dates and ensure the registration deadline is no later than the event start." });
    }
    const event = await Event.create({
      title: title.trim(), description: description.trim(), category, venue: venue.trim(),
      startDate: start, registrationDeadline: deadline, capacity: cap,
      clubName: clubName.trim(), organizer: req.user._id,
      status: req.user.role === "admin" ? "approved" : "pending"
    });
    res.status(201).json({ event, message: "Event created. It may need admin approval before appearing publicly." });
  } catch (error) {
    res.status(500).json({ message: "Could not create event." });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (req.user.role !== "admin" && String(event.organizer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own events." });
    }
    const allowed = ["title", "description", "category", "venue", "startDate", "registrationDeadline", "capacity", "clubName"];
    for (const field of allowed) if (req.body[field] !== undefined) event[field] = req.body[field];
    if (event.registrationDeadline > event.startDate) return res.status(400).json({ message: "Registration deadline must be no later than event start." });
    await event.save();
    try { await notifyRegisteredStudents(event, "event-updated", "Event updated", `${event.title} has been updated. Please check the event details.`); } catch (notifyError) { console.error("Event update notification failed:", notifyError.message); }
    res.json({ event });
  } catch (error) {
    res.status(400).json({ message: "Could not update event. Check the supplied values." });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Status must be approved or rejected." });
    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (status === "rejected") { try { await notifyRegisteredStudents(event, "event-cancelled", "Event no longer available", `${event.title} is no longer available.`); } catch (notifyError) { console.error("Event notification failed:", notifyError.message); } }
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: "Could not update approval status." });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
    const event = await Event.findOne({ _id: req.params.id, status: "approved" });
    if (!event) return res.status(404).json({ message: "Event not found or not approved." });
    if (event.startDate <= new Date()) return res.status(400).json({ message: "This event has already started." });
    if (event.registrationDeadline < new Date()) return res.status(400).json({ message: "Registration deadline has passed." });
    const existing = await Registration.findOne({ event: event._id, student: req.user._id });
    if (existing?.status === "registered") return res.status(409).json({ message: "You are already registered for this event." });
    const count = await Registration.countDocuments({ event: event._id, status: "registered" });
    if (count >= event.capacity) return res.status(409).json({ message: "This event is full." });
    let registration;
    if (existing) {
      existing.status = "registered";
      existing.attendanceStatus = "not-marked";
      existing.attendanceMarkedAt = null;
      existing.checkInToken = crypto.randomBytes(24).toString("hex");
      await existing.save();
      registration = existing;
    } else {
      registration = await Registration.create({ event: event._id, student: req.user._id, checkInToken: crypto.randomBytes(24).toString("hex") });
    }
    try { await Notification.create({ user: req.user._id, event: event._id, type: "registration", title: "Registration successful", message: `You are registered for ${event.title}.` }); }
    catch (notifyError) { console.error("Registration notification failed:", notifyError.message); }
    res.status(201).json({ message: "Registration successful.", registration: { id: registration._id, checkInToken: registration.checkInToken } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You are already registered for this event." });
    res.status(500).json({ message: "Could not register. Please try again." });
  }
};

exports.cancelRegistration = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
  const registration = await Registration.findOne({ event: req.params.id, student: req.user._id, status: "registered" });
  if (!registration) return res.status(404).json({ message: "Active registration not found." });
  registration.status = "cancelled";
  await registration.save();
  res.json({ message: "Registration cancelled." });
};

exports.myRegistrations = async (req, res) => {
  const registrations = await Registration.find({ student: req.user._id, status: "registered" }).select("+checkInToken")
    .populate("event").sort({ createdAt: -1 });
  res.json({ registrations: registrations.filter(r => r.event && r.event.status === "approved") });
};

exports.eventRegistrations = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found." });
  if (req.user.role !== "admin" && String(event.organizer) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only view participants for your own events." });
  }
  const registrations = await Registration.find({ event: event._id, status: "registered" })
    .populate("student", "name email").sort({ createdAt: -1 });
  res.json({ registrations });
};

exports.manageEvents = async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { organizer: req.user._id };
  const events = await Event.find(filter).sort({ createdAt: -1 });
  const counts = await Registration.aggregate([
    { $match: { event: { $in: events.map(e => e._id) }, status: "registered" } },
    { $group: { _id: "$event", count: { $sum: 1 } } }
  ]);
  const map = new Map(counts.map(c => [String(c._id), c.count]));
  res.json({ events: events.map(e => ({ ...e.toObject(), registeredCount: map.get(String(e._id)) || 0 })) });
};


exports.checkInParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    if (!mongoose.isValidObjectId(id) || typeof token !== "string" || !token.trim()) return res.status(400).json({ message: "A valid event and QR token are required." });
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (req.user.role !== "admin" && String(event.organizer) !== String(req.user._id)) return res.status(403).json({ message: "You can only scan QR codes for your own events." });
    const registration = await Registration.findOne({ event: event._id, checkInToken: token.trim(), status: "registered" }).populate("student", "name email");
    if (!registration) return res.status(404).json({ message: "QR code is invalid or the registration is no longer active." });
    if (registration.attendanceStatus === "attended") return res.status(409).json({ message: `${registration.student?.name || "This student"} has already been checked in.` });
    registration.attendanceStatus = "attended";
    registration.attendanceMarkedAt = new Date();
    await registration.save();
    try { await Notification.create({ user: registration.student._id, event: event._id, type: "attendance", title: "Attendance confirmed", message: `Your attendance for ${event.title} has been recorded.` }); } catch (e) { console.error("Attendance notification failed:", e.message); }
    res.json({ message: "Attendance marked successfully.", student: { name: registration.student?.name, email: registration.student?.email }, attendanceStatus: registration.attendanceStatus, attendanceMarkedAt: registration.attendanceMarkedAt });
  } catch (error) { console.error("QR check-in failed:", error.message); res.status(500).json({ message: "Could not verify QR code." }); }
};
