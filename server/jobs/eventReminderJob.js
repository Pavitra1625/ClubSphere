const cron = require("node-cron");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Notification = require("../models/Notification");
function startEventReminderJob() {
  cron.schedule("*/10 * * * *", async () => {
    try {
      const now = new Date();
      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 10 * 60 * 1000);
      const events = await Event.find({ status: "approved", startDate: { $gt: start, $lte: end } }).select("_id title startDate venue");
      for (const event of events) {
        const registrations = await Registration.find({ event: event._id, status: "registered" }).select("student");
        for (const r of registrations) {
          const reminderKey = `${event._id}:${r.student}:24h`;
          try { await Notification.create({ user: r.student, event: event._id, type: "event-reminder", title: "Event reminder", message: `${event.title} starts in about 24 hours at ${event.venue}.`, reminderKey }); }
          catch (error) { if (error.code !== 11000) console.error("Could not create event reminder:", error.message); }
        }
      }
    } catch (error) { console.error("Event reminder job failed:", error.message); }
  });
  console.log("Event reminder job scheduled (every 10 minutes).");
}
module.exports = startEventReminderJob;
