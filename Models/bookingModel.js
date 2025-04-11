const mongoose = require("mongoose");
const Event = require("./eventModel");
const CustomError = require("../Utils/CustomError");

const bookingSchema = new mongoose.Schema(
  {
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    stripePaymentIntentId: {
      type: String,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "paid", "expired"],
        message:
          "please provide valid enum value for status e.g: 'pending', 'paid', 'expired'",
      },

      default: "pending",
    },
  },
  { timestamps: true }
);

bookingSchema.pre([/^find/, "save"], function (next) {
  this.populate({
    path: "bookedBy",
    select: "fullName avatar",
  });

  this.populate({
    path: "event",
  });

  next();
});

bookingSchema.pre("save", async function (next) {
  const event = await Event.findById(this.event);
  if (!event) {
    throw next(new CustomError("Event do no exist", 400));
  }
  if (event.totalAvailableTickets <= 0) {
    throw next(new CustomError("No available tickets for this event", 400));
  }

  next();
});

bookingSchema.post("save", async function (doc) {
  const isNewDocument = doc.createdAt.getTime() === doc.updatedAt.getTime();

  console.log("Is new document:", isNewDocument);

  if (isNewDocument) {
    const event = await Event.findById(this.event);
    if (!event) {
      throw new CustomError("Event with this ID does not exist", 400);
    }

    console.log("EVENT FOUND");
    event.totalAvailableTickets -= 1;
    await event.save();
  }
});
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
