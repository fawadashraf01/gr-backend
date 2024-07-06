const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");
const stripeController = require("./controllers/stripeController");
const Product = require("./models/productModel");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(async () => {
  console.log("DB connection successful!");

  const products = await Product.find();
  if (products.length === 0) {
    stripeController.createProducts();
  }
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const initializeSocketServer = require("./socketServer");
initializeSocketServer(server);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
