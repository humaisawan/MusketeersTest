const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const CustomError = require("./CustomError");


exports.generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });
};

exports.generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    //expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};

signToken = async (id) => {
  try {

    const user = await User.findById(id);
   
     if (!user) {
       throw new CustomError("User not found",404)
     }
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    
    
    //await user.save({ validateBeforeSave: false });
    
  
    return { accessToken, refreshToken };
  } catch (err) {
    console.log(err.message);
    throw new CustomError("Could not generate access and refresh tokens", 500);
  }
};

module.exports = signToken;