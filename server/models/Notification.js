const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
  type: { type: String, enum: ["registration", "event-updated", "event-cancelled", "event-reminder", "attendance"], required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  read: { type: Boolean, default: false },
  reminderKey: { type: String, default: null }
}, { timestamps: true });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, reminderKey: 1 }, { unique: true, partialFilterExpression: { reminderKey: { $type: "string" } } });
module.exports = mongoose.model("Notification", notificationSchema);
