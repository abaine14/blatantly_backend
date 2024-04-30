const routes = require("express").Router();
const path = require("path");

routes.get("/:pageName", async (req, res) => {
  res.sendFile(path.join(__dirname, `../pages/${req.params.pageName}.html`));
});

module.exports = routes;
