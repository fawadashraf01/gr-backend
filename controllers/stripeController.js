const Stripe = require("stripe");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Subscription = require("../models/subscriptionModel");
const stripe = Stripe(process.env.STRIPE_SECRET);

exports.createProducts = async function () {
  const plans = [
    {
      name: "Basic Plan",
      description:
        "Includes essential features for small teams with basic features.",
      price: 10000,
      metadata: {
        messages: 10,
        analytics: "Basic analytics",
        support: "Email support",
      },
    },
    {
      name: "Standard Plan",
      description: "Perfect for growing businesses with additional features.",
      price: 50000,
      metadata: {
        messages: 50,
        analytics: "Advanced analytics",
        support: "Phone support",
      },
    },
    {
      name: "Premium Plan",
      description:
        "Unlock all features including premium support along with first priority.",
      price: 100000,
      metadata: {
        messages: 100,
        analytics: "Premium analytics",
        support: "24/7 support",
      },
    },
  ];

  plans.forEach(async (plan) => {
    try {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata,
      });

      const price = await stripe.prices.create({
        unit_amount: plan.price,
        currency: "pkr",
        recurring: { interval: "month", usage_type: "metered" },
        product: product.id,
      });

      const doc = await Product.create({
        name: plan.name,
        stripeProductId: product.id,
        stripePriceId: price.id,
        description: product.description,
        metadata: {
          messages: plan.metadata.messages,
          analytics: plan.metadata.analytics,
          support: plan.metadata.support,
        },
      });
    } catch (err) {
      console.error("Error while creating products: " + err);
    }
  });
  console.log(`Products Created Successfully`);
};

exports.deleteProduct = async (productId, priceId) => {
  try {
    // Delete the price
    const deletedPrice = await stripe.prices.update(priceId, { active: false });

    if (deletedPrice.active == false) {
      // Delete the product
      const deletedProduct = await stripe.products.update(productId, {
        active: false,
      });

      return true;
    }
  } catch (err) {
    console.log(`Failed to delete the product: ${err}`);
    return false;
  }
};

exports.checkoutSession = async (req, res) => {
  try {
    const { priceId, email } = req.body;

    const price = await stripe.prices.retrieve(priceId);

    if (!price) {
      return res.status(400).json({
        status: "failed",
        message: "Price not found",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${req.protocol}://localhost:5173/`,
      cancel_url: `${req.protocol}://localhost:5173/#subscriptions`,
      customer_email: email,
      line_items: [
        {
          price: priceId,
        },
      ],
      mode: "subscription",
    });

    res.status(200).json({
      status: "success",
      message: "Checkout session created successfully",
      data: {
        session,
      },
    });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(400).json({
      status: "failed",
      message: "Failed to create checkout session",
    });
  }
};

exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const subscriptionId = event.data.object.subscription;
    const email = event.data.object.customer_email;

    let subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const user = await User.findOne({ email });
    const product = await Product.findOne({
      stripeProductId: subscription.plan.product,
      stripePriceId: subscription.plan.id,
    });

    const body = {
      subscription: product.name,
      messagesLimit: product.metadata.messages,
    };

    const updatedUser = await User.findByIdAndUpdate(user.id, body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({ received: true });
};
