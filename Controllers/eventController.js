const Event = require("../Models/eventModel");
const asyncHandler = require("../Utils/AsyncHandler");
const CustomError = require("../Utils/CustomError");
const User = require("../Models/userModel");
const {
  createStripeCustomer,
  createPaymentIntent,
  retrievePaymentIntent,
  confirmPaymentIntent,
} = require("../Utils/Stripe");
const Booking = require("../Models/bookingModel");

exports.setEventCreator = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user?._id;
  next();
});

exports.createEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.create(req.body);

  if (!event) {
    return next(new CustomError("Error while creating new Event", 400));
  }

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: "Event created Successfully",
    event,
  });
});

exports.updateEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(
      new CustomError(
        "Please provide the id of the event you want to update",
        400
      )
    );
  }

  const event = await Event.findById(id);
  if (!event) {
    return next(new CustomError("Event with this ID no longer exists", 400));
  }

  if (event.createdBy?._id?.toString() !== req.user?._id?.toString()) {
    return next(new CustomError("You can only edit events owned by you.", 400));
  }

  const updatedEvent = await Event.findByIdAndUpdate(event?._id, req.body, {
    runValidators: true,
  });

  if (!updatedEvent) {
    return next(new CustomError("Error while updating Event. Try Again!", 400));
  }

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Event updated Successfully",
    event: updatedEvent,
  });
});

exports.getAllEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find({
    $and: [{ status: "upcoming" }, { date: { $gt: new Date() } }],
  });

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Events fetched successfully",
    length: events.length,
    events,
  });
});

exports.eventAnalytics = asyncHandler(async (req, res, next) => {
  //implement later after booking module
});

exports.bookEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(
      new CustomError("Please provide the event id which you want to book", 400)
    );
  }

  const event = await Event.findById(id);
  if (!event) {
    return next(new CustomError("Event with this ID do not exist", 404));
  }

  let customerId;

  if (!req.user.customerId) {
    customerId = await createStripeCustomer(req.user);
  } else {
    customerId = req.user.customerId;
  }

  if (!customerId) {
    return next(
      new CustomError("Could not find stripe custoemr id for this user", 400)
    );
  }
  req.user.customerId = customerId;
  await req.user.save();

  const booking = await Booking.create({
    bookedBy: req.user._id,
    event: event._id,
  });

  if (!booking) {
    return next(new CustomError("Error while creating booking", 400));
  }

  const metaData = {
    bookingId: booking?._id?.toString(),
  };
  const paymentIntent = await createPaymentIntent(
    event.price,
    customerId,
    metaData
  );

  if (!paymentIntent) {
    return next(new CustomError("Error while creating payment Intent", 400));
  }

  booking.stripePaymentIntentId = paymentIntent.id;
  await booking.save();

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Booking initiated Successfully",
    booking,
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  });
});

exports.verifyPaymentIntent = asyncHandler(async (req, res, next) => {
  const { paymentIntentId } = req.params;
  const paymentIntent = await retrievePaymentIntent(paymentIntentId);

  if (!paymentIntent) {
    return next(new CustomError("could not retrieve payment intent", 400));
  }

  const booking = await Booking.findById(paymentIntent.metatData.bookingId);
  if (!booking) {
    return next(new CustomError("Booking with this id do no exist", 400));
  }

  if (paymentIntent.status === "succeeded") {
    booking.status = "paid";
    await booking.save();

    return res.status(200).json({
      status: "success",
      statusCode: "200",
      message: "Your booking has been paid successfully",
      booking,
    });
  } else {
    booking.status = "expired";
    await booking.save();
    return res.status(200).json({
      status: "success",
      statusCode: "200",
      message:
        "Error while verifying your payment. Your booking status is expired now.",
      booking,
    });
  }
});
