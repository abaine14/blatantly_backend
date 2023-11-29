const routes = require("express").Router();
const path = require('path');

routes.get('/success-page', async(req,res)=>{
    res.sendFile(path.join(__dirname, '../pages/success_page.html'));
});

module.exports = routes;