const Stripe = require('stripe');
const stripeJSON = require('./stripe.json');
const stripe = Stripe(stripeJSON.apiKey);

exports.getCustomer = async (user) => {
    const customer = await stripe.customers.retrieve(user) ;
    return customer;
}

exports.createCustomer = async (email,name,uid) => {
    const newCustomer = await stripe.customers.create({
        description: `Customer account created for ${uid}`,
        email: email,
        name: name,
    })
    return newCustomer;
}

exports.createPaymentIntent = async (amount, currency, customer, description) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        customer: customer,
        description: description
    });
    return paymentIntent;
}

exports.getPaymentIntent = async (client_secret) => {
    const paymentRetrieval = await stripe.paymentIntents.retrieve(
        client_secret
    );
    return paymentRetrieval;
}