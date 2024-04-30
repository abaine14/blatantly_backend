const geminiConfig = require("./gemini.json");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const enhancmentDriver =
  "Using 175 characters or less, provide an image prompt for";

exports.chatPrompt = async (prompt, chatCase) => {
  const result = await model.generateContent(prompt);
  const response = result.response;
  const chatResponse = {
    chat_data: {
      id: makeId(16),
      originalChat: prompt,
      response: response.text(),
      creation_date: new Date().toISOString(),
      type: chatCase,
    },
  };
  return chatResponse;
};
exports.enhancedPrompt = async (prompt, style, chatCase) => {
  const result = await model.generateContent(
    `${enhancmentDriver}, ${prompt}, in an ${style} style.`
  );
  const response = result.response;
  const chatResponse = {
    chat_data: {
      id: makeId(16),
      originalChat: prompt,
      response: response.text(),
      creation_date: new Date().toISOString(),
      type: chatCase,
    },
  };
  return chatResponse;
};
exports.randomPrompt = async (prompt, style, chatCase) => {
  const randomPrompt = String(randomizerText(style))
    .replace("(", "")
    .replace(")", "")
    .replace("*", "")
    .replace("Image Prompt", "");
  const result = await model.generateContent(
    `${enhancmentDriver} ${randomPrompt}`
  );
  const response = result.response;
  const chatResponse = {
    chat_data: {
      id: makeId(16),
      originalChat: prompt,
      response: response.text(),
      creation_date: new Date().toISOString(),
      type: chatCase,
    },
  };
  return chatResponse;
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
