const signToken = require("./GenerateToken");
// const Notification = require("../Models/notificationModel");
// const {
//   sendNotification,
//   sendMulticastNotification,
// } = require("./Notifications");
const Token = require("../Models/tokenModel");

sendTokenResponse = async (
  user,
  statusCode,
  message,
  deviceId,
  fcmToken,
  res
) => {
  try {
   
    const { accessToken, refreshToken } = await signToken(user._id);

    const optionsForAccessToken = {
      secure: true,
      httpOnly: true,
      maxAge: process.env.ACCESS_TOKEN_EXPIRE,
    };
    const optionsForRefreshToken = {
      secure: true,
      httpOnly: true,
      // maxAge: process.env.REFRESH_TOKEN_EXPIRE,
    };

    const existingDevice = await Token.findOne({
      user: user._id,
      deviceId,
      fcmToken,
    });

    if (!existingDevice) {
      console.log("EXISTING DEVICE NOT FOUND...CREATING NEW DEVICE.....");
      // await Notification.create({
      //   notificationType: "security-alert",
      //   receiverId: user._id,
      //   title: "New Device Login",
      //   body: "Your account was logged in from a new device recently. If this wasn't you, consider changing your password.",
      //   data: user,
      // });

      const userTokens = await Token.find({
        user: user._id,
      });

      const userFcmTokens = userTokens.map((token) => token.fcmToken);

      console.log("-------------------------------------------");

      console.log("USER TOKENS FOR FCM ARE:", userFcmTokens);

      // if (userFcmTokens.length > 0) {
      //   await sendMulticastNotification({
      //     fcmTokens: userFcmTokens,
      //     title: "New Device Login",
      //     body: "Your account was logged in from a new device recently. If this wasn't you, consider changing your password.",
      //     notificationData: JSON.stringify(user),
      //   });
      // }

      const newDevice = await Token.create({
        user: user._id,
        deviceId: deviceId,
        fcmToken: fcmToken,
        refreshToken: refreshToken,
      });
    } else {
      console.log("EXISTING DEVICE FOUND...UPDATING REFRESH TOKEN");
      existingDevice.refreshToken = refreshToken;
      await existingDevice.save();
    }
    await user.save();
    res
      .status(statusCode)
      .cookie("accessToken", accessToken, optionsForAccessToken)
      .cookie("refreshToken", refreshToken, optionsForRefreshToken)
      .json({
        status: "success",
        statusCode: statusCode,
        token: accessToken,
        refreshToken: refreshToken,
        message,
        data: {
          user,
        },
      });
  } catch (err) {
    console.error("Error sending token response:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

module.exports = sendTokenResponse;
