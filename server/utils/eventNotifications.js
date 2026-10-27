const Registration = require("../models/Registration");
const Notification = require("../models/Notification");
async function notifyRegisteredStudents(event, type, title, message) {
  const registrations = await Registration.find({ event: event._id, status: "registered" }).select("student");
  if (!registrations.length) return;
  await Notification.insertMany(registrations.map(r => ({ user: r.student, event: event._id, type, title, message })), { ordered: false });
}
module.exports = { notifyRegisteredStudents };
