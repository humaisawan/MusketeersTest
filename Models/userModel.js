const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: [true, "Please provide your fullName"],
    },
    email: {
      type: String,
      required: [true, "Email is a required Field"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please choose a valid Email address"],
    },

    password: {
      type: String,
      required: [true, "Password is a required field"],
      minLength: [8, "Password must be of atleast 8 Characters"],
      select: false,
    },

    role: {
      type: String,
      required: [true, "Please select your role"],
      enum: ["user", "organizer"],
      default: "user",
    },

    avatar: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

    customerId: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    isNotifications: {
      type: Boolean,
      default: true,
    },

    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  console.log("passwordChangedAt set to:", this.passwordChangedAt);
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ isActive: true });
  next();
});

userSchema.methods.comparePasswordInDb = async function (pswd, pswdDb) {
  return await bcrypt.compare(pswd, pswdDb);
};

userSchema.methods.isPasswordChanged = async function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    console.log("PASSWORD CHANGED");
    const passwordChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTtimestamp < passwordChangedTimestamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
