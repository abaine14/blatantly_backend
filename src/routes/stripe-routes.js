const routes = require("express").Router();
const stripe_methods = require('../controllers/stripe-methods');

// routes.get('/get-customer/:customerId', async(req, res) => {
//     stripe_methods.getCustomer(req.params.customerId).then((customer) => {
//         res.json(customer);
//     }).catch((err)=>{
//        res.status(404).json(err.message);  
//     });
// });

routes.get('/create-customer/:uid', async (req, res) => {
    stripe_methods.createCustomer(req.params.uid).then((customer) => {
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



module.exports = routes;