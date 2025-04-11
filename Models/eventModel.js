const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is a required field"],
    },
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    description: {
      type: String,
      trime: true,
      required: true,
    },
    banner: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalAvailableTickets: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["upcoming", "archived"],
        message:
          "pleaes choose valid status value for event e.g: 'upcoming', 'archived'",
      },
      default: "upcoming",
    },
  },
  { timestamps: true }
);

eventSchema.pre([/^find/, "save"], function (next) {
  this.populate({
    path: "createdBy",
    select: "fullName avatar",
  });

  next();
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
