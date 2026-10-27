const mongoose = require("mongoose");
const Notification = require("../models/Notification");

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).populate("event", "title startDate venue").sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (error) { res.status(500).json({ message: "Could not load notifications." }); }
};
exports.markAsRead = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid notification ID." });
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    res.json({ message: "Notification marked as read.", notification });
  } catch (error) { res.status(500).json({ message: "Could not update notification." }); }
};
exports.markAllAsRead = async (req, res) => {
  try { await Notification.updateMany({ user: req.user._id, read: false }, { read: true }); res.json({ message: "All notifications marked as read." }); }
  catch (error) { res.status(500).json({ message: "Could not update notifications." }); }
};
