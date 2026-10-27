require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const startEventReminderJob = require("./jobs/eventReminderJob");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    startEventReminderJob();
    app.listen(PORT, () => console.log(`ClubSphere API listening on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();
