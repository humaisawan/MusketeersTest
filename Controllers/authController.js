const User = require("../Models/userModel");
const Token = require("../Models/tokenModel");
const CustomError = require("../Utils/CustomError");
const asyncHandler = require("../Utils/AsyncHandler");
const sendTokenResponse = require("../Utils/sendTokenResponse");
const util = require("util");
const jwt = require("jsonwebtoken");

exports.signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, role, fcmToken, deviceId } = req.body;

  const alreadyExists = await User.findOne({ email });
  if (alreadyExists) {
    return next(new CustomError("User with this Email already exists", 400));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role,
    isActive: true,
  });

  if (!user) {
    return next(new CustomError("Error while signing up", 400));
  }

  const token = await Token.create({
    user: user._id,
    deviceId,
    fcmToken,
  });

  res.status(201).json({
    status: "success",
    statusCode: 201,
    message: "User created successfully",
    user,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  console.log("API HIT");
  const { email, password, deviceId, fcmToken } = req.body;

  const userExists = await User.findOne({ email }).select("+password");

  if (!userExists) {
    return next(new CustomError("User with this email do no exist", 404));
  }

  console.log("COMPARING PASSWORD");

  const isPasswordMatched = await userExists.comparePasswordInDb(
    password,
    userExists.password
  );

  if (!isPasswordMatched) {
    return next(new CustomError("Incorrect Password", 400));
  }

  console.log("SENDING RESPONSE");

  sendTokenResponse(
    userExists,
    200,
    "Logged In Successfully",
    deviceId,
    fcmToken,
    res
  );
});

exports.refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.params;
  const { deviceId, fcmToken } = req.body;

  if (!refreshToken) {
    return next(new CustomError("Please provide refresh Token", 400));
  }

  const isTokenValid = await Token.findOne({
    user: req.user._id,
    refreshToken,
  });

  if (!isTokenValid) {
    return next(new CustomError("Your refresh token is invalid", 400));
  }

  const user = await User.findById(isTokenValid.user);
  if (!user) {
    return next(new CustomError("User with this ID no longer exists", 404));
  }

  sendTokenResponse(user, 200, "Tokens Refreshed", deviceId, fcmToken, res);
});

exports.logout = asyncHandler(async (req, res, next) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return next(new CustomError("Device Id is required", 400));
  }

  const existingDevice = await Token.findOne({
    $and: [{ user: req.user._id }, { deviceId }],
  });

  if (!existingDevice) {
    return next(new CustomError("Device doesn't exist", 400));
  }

  await Token.findByIdAndDelete(existingDevice._id);

  res.clearCookie("accessToken").status(200).json({
    status: "success",
    statusCode: 200,
    message: "Logged Out Successfully",
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  const testToken = req.cookies?.accessToken || req.headers?.authorization;

  if (!testToken) {
    return next(new CustomError("You are not logged in.", 401));
  }

  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  } else {
    token = testToken;
  }

  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!decodedToken) {
    return next(new CustomError("Invalid request", 401));
  }

  const user = await User.findById(decodedToken.id);

  if (!user) {
    return next(new CustomError("User no longer exists", 404));
  }

  req.user = user;
  next();
});

exports.restrict = (...role) => {
  return (req, res, next) => {
    if (role.includes(req.user.role)) {
      next();
    } else {
      return next(
        new CustomError("You are not authorized to perform this action", 401)
      );
    }
  };
};
