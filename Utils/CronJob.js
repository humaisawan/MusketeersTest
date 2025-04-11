const cron = require("node-cron");
const {
  expirePendingBookings,
  archiveEvents,
} = require("../Helpers/CronHelpers");

module.exports = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("CRON JOB STARTED!!!");
    await archiveEvents();
    await expirePendingBookings();
  });
};
