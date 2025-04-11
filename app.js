const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
//const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const CustomError = require("./Utils/CustomError");
const globalErrorHandler = require("./Controllers/errorController");

//ImportingRoutes
const authRoutes = require("./Routes/authRoutes");
const eventRoutes = require("./Routes/eventRoutes");

//Initializing Express App
let app = express();

//Initializing Security Middlewares
app.use(express.json());

app.use(cookieParser());

app.use(cors());
console.log("In App.jssss");
//app.options("*", cors());
console.log("In App.js");
if (process.env.NODE_ENV === "development") {
  app.use(morgan());
}

app.use(helmet());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

//Declaring Routes

app.use("/api/v1/users", authRoutes);
app.use("/api/v1/events", eventRoutes);

// app.all("*", (req, res, next) => {
//   const err = new CustomError(
//     `Cannot find the URL ${req.originalUrl} in the server`,
//     500
//   );
//   next(err);
// });
console.log("In App.jssss mongo");

app.use(globalErrorHandler);

module.exports = app;
