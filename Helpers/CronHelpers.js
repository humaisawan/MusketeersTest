const Event = require("../Models/eventModel");
const Booking = require("../Models/bookingModel");

const moment = require("moment");

const archiveEvents = async () => {
  const events = await Event.updateMany(
    {
      status: "upcoming",
      date: { $lt: new Date() },
    },
    { status: "archived" }
  );
};

exports.expirePendingBookings = async () => {
  const oneHourAgo = moment().subtract(1, "hour").toDate();

  const bookings = await Booking.updateMany(
    {
      status: "pending",
      createdAt: { $lt: oneHourAgo },
    },
    {
      status: "expired",
    }
  );
};

module.exports = { archiveEvents, expirePendingBookings };
