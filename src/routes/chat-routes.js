const routes = require("express").Router();
const chatMethods = require("../controllers/chat-methods");

routes.post("/chat-generation", async (req, res) => {
  const { prompt, style, chatCase } = req.body;
  if (chatCase === "Chat") {
    chatMethods
      .chatPrompt(prompt, chatCase)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  if (chatCase === "Enhanced Prompt" || chatCase === "Enhance Prompt") {
    chatMethods
      .enhancedPrompt(prompt, style, chatCase)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  if (chatCase === "Randomize") {
    chatMethods
      .randomPrompt(prompt, style, chatCase)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

module.exports = routes;
