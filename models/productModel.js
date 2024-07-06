const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your product name"],
    unique: true,
  },
  stripeProductId: {
    type: String,
    required: [true, "Please provide your stripe product id"],
    unique: true,
  },
  stripePriceId: {
    type: String,
    required: [true, "Please provide your stripe price id"],
    unique: true,
  },
  description: String,
  metadata: {
    messages: Number,
    analytics: String,
    support: String,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
