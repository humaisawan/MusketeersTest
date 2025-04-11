const express = require("express");
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");

const router = express.Router();

router.post("/register", authController.signup);
router.post("/login", authController.login);
router.post(
  "/refresh-token/:refreshToken",
  authController.protect,
  authController.refreshAccessToken
);

router.post("/logout", authController.protect, authController.logout);

module.exports = router;
