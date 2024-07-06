const express = require("express");
const subscriptionController = require("../controllers/subscriptionController");
const authController = require("../controllers/authController");
const stripeController = require("../controllers/stripeController");

const router = express.Router();

router
  .route("/update-messages/:email")
  .patch(subscriptionController.messageUsed);
router.route("/checkout-session").post(stripeController.checkoutSession);

module.exports = router;