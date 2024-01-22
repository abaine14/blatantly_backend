const { random } = require("lodash");
const geminiConfig = require("./gemini.json");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { response } = require("express");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);

exports.chatPrompt = async (prompt, style, chatCase) => {
  let adjustedPrompt;
  let originalPrompt;
  const randomTextYield = randomizerText(style);
  const enhancemnetDriver =
    "Using 175 characters or less, provide an image prompt for";
  switch (chatCase) {
    case "Chat":
      adjustedPrompt = prompt;
      originalPrompt = prompt;
      break;
    case "Enhance Prompt":
      adjustedPrompt = enhancemnetDriver + prompt;
      originalPrompt = prompt;
      break;
    case "Randomize":
      adjustedPrompt = enhancemnetDriver + randomTextYield;
      originalPrompt = String(randomTextYield)
        .replace("(", "")
        .replace(")", "");
      break;

    default:
      break;
  }
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(adjustedPrompt);
  const response = await result.response;

  const chatRespose = {
    chat_data: {
      id: makeId(16),
      originalChat: originalPrompt,
      response: response.text(),
      creation_date: new Date().toISOString(),
      type: chatCase,
    },
  };

  return chatRespose;
};

const randomizerText = (style) => {
  const object =
    geminiConfig.animateorInanitmate[Math.floor(Math.random() * 329)];
  const adjective = geminiConfig.adjectives[Math.floor(Math.random() * 170)];
  const adjective2 = geminiConfig.adjectives[Math.floor(Math.random() * 170)];
  const location = geminiConfig.locations[Math.floor(Math.random() * 100)];

  return `${adjective} ${object} with a setting of ${adjective2} ${location} in a ${style} style`;
};

const makeId = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
