const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is a requried field"],
    },

    deviceId: {
      type: String,
      required: true,
    },

    fcmToken: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      //required: true,
    },
  },
  { timestamps: true }
);

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
