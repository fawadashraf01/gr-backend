const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  subscriptionName: {
    type: String,
    required: [true, "Please provide your subscription name"],
  },
  subscriptionId: {
    type: String,
    required: [true, "Please provide your subscription id"],
    unique: true,
  },
  createdAt: Number,
  customer: String,
  collectionMethod: String,
  billingCycleAnchor: Number,
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
