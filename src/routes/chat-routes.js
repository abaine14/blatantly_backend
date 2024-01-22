const routes = require("express").Router();
const chatMethods = require("../controllers/chat-methods");

routes.post("/chat-generation", async (req, res) => {
  const { prompt, style, chatCase } = req.body;
  chatMethods.chatPrompt(prompt, style, chatCase).then((response) => {
    res.json(response);
  });
});

module.exports = routes;
