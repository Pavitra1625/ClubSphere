const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 3000 },
  category: { type: String, required: true, enum: ["Technology", "Cultural", "Sports", "Workshop", "Career", "Other"] },
  venue: { type: String, required: true, trim: true, maxlength: 160 },
  startDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  capacity: { type: Number, required: true, min: 1, max: 10000 },
  clubName: { type: String, required: true, trim: true, maxlength: 100 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

eventSchema.index({ status: 1, startDate: 1, category: 1 });
module.exports = mongoose.model("Event", eventSchema);
