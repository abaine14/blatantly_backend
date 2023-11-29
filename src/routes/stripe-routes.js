const routes = require("express").Router();
const stripe_methods = require('../controllers/stripe-methods');

routes.post('/create-customer', async (req, res) => {
    const { email, name, uid } = req.body;
    stripe_methods.createCustomer(email, name, uid).then((customer) => {
        res.status(200).json(customer);
    }).catch((err) => {
        res.status(400).json(err.message)
    });
});

routes.post('/create-payment-intent', async(req, res) => {
    const { amount, currency, customer, description } = req.body;
    stripe_methods.createPaymentIntent(amount, currency, customer, description).then((intent) => {
        res.status(201).json(intent);
    }).catch((err) => {
        res.status(400).json(err.message);
    });
});

routes.get('/get-payment-intent/:client_secret', async(req, res) => {
    stripe_methods.getPaymentIntent(req.params.client_secret).then((intent) => {
        res.status(200).json(intent);
    }).catch((err) => {
        res.status(400).json(err.message);
    })
});


module.exports = routes;