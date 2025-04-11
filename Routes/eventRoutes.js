const express = require("express");
const authController = require("../Controllers/authController");
const eventController = require("../Controllers/eventController");

const router = express.Router();

router.post(
  "/",
  authController.protect,
  authController.restrict("organizer"),
  eventController.setEventCreator,
  eventController.createEvent
);

router.post(
  "/:id/book",
  authController.protect,
  authController.restrict("user"),
  eventController.bookEvent
);

router.patch(
  "/:id",
  authController.protect,
  authController.restrict("organizer"),
  eventController.updateEvent
);

router.get(
  "/",
  authController.protect,
  authController.restrict("user"),
  eventController.getAllEvents
);

router.post(
  "/verify-payment/:paymentIntentId",
  eventController.verifyPaymentIntent
);

module.exports = router;
