const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const stripeController = require("./controllers/stripeController");
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const subscriptionRouter = require("./routes/subscriptionRoute");

const app = express();

// app.enable("trust proxy");

// 1) GLOBAL MIDDLEWARES

// Implement CORS
app.use(cors());

app.options("*", cors());

// Set Security Http Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  stripeController.webhookCheckout
);

// Body Parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

// Data sanitization againt NOSQL query injection
app.use(mongoSanitize());

// Data sanitizaiton againts XSS
app.use(xss());

app.use(compression());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/subscription", subscriptionRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
