const asyncHandler = require("../Utils/AsyncHandler");
const CustomError = require("../Utils/CustomError");
const User = require("../Models/userModel");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    statusCode: 200,
    data: {
      users,
    },
  });
});
