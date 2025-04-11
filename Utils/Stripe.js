const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createStripeCustomer = async (user) => {
  try {
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      name: user.fullName,
    });
    return stripeCustomer.id;
  } catch (err) {
    console.log("ERROR WHILE CREATING STRIPE CUSTOMER:", err);
  }
};

const createPaymentIntent = async (total, customerId, metaData) => {
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100,
      currency: "usd",
      customer: customerId,
      metadata: metaData,
      // payment_method: "pm_card_bypassPending",
      // confirm: true,
      automatic_payment_methods: {
        enabled: true,
        //allow_redirects: "never",
      },
    });

    return paymentIntent;
  } catch (error) {
    console.log("ERROR WHILE CREATING INTENT:", error);
    return false;
  }
};

const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: "pm_card_bypassPending",
    });

    return paymentIntent;
  } catch (error) {
    console.log("ERROR WHILE CONFIRMING PAYMENT INTENT:::", error);
    return false;
  }
};

const retrievePaymentIntent = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!paymentIntent) {
    return false;
  }
  return paymentIntent;
};

module.exports = {
  createStripeCustomer,
  createPaymentIntent,
  retrievePaymentIntent,
  confirmPaymentIntent,
};
