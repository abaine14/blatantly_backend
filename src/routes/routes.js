const routes = require("express").Router();
const aiMethods = require("../controllers/aiMethods");
const imageToBase64 = require("image-to-base64");
const fs = require("fs");
const { blob } = require("stream/consumers");
const { async } = require("@firebase/util");
const os = require("os");
const _ = require("lodash");
const sharp = require('sharp');

routes.post("/generateImage/:imageType", async (req, res) => {
  const data = req.body;
  const type = req.params.imageType;
  const deepAi = await aiMethods.deepAiImage(data, type);
  res.status(200).json({ image_info: await deepAi, prompt: data.prompt });
});

routes.post("/generateChat/:forImageGeneration", async (req, res) => {
  let data = req.body.prompt;
  let originalChat = req.body.originalPrompt;
  const isForImage = req.params.forImageGeneration;
  const characterLimit = isForImage === "true" ? true : false;
  let deepAi;

  res.status(200).json({
    chat_data: characterLimit
      ? await aiMethods.deepAiText(
          "Using 175 characters or less, provide a prompt" + data,
          characterLimit
        )
      : await aiMethods.deepAiText(data, characterLimit),
    originalChat: originalChat,
  });
});

routes.post("/convertImage/:id", async (req, res) => {
  const url = req.body.url;
  const imageType = req.body.imageType;
  await imageToBase64(url)
    .then((response) => {
      const binaryString = atob(response);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
      for (var i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = new Buffer.from(bytes.buffer, "base64");
      fs.writeFileSync(os.tmpdir() + `/${req.params.id}.jpg`, buffer);
      setTimeout(() => {
        fs.unlink(os.tmpdir() + `/${req.params.id}.jpg`, (err) => {
          if (err) throw err;
        });
      }, 3000);

      aiMethods.setReference(req.params.id, imageType).then((_) => {
        aiMethods.getDownloadUrl(req.params.id, imageType).then((downloadUrl) => {
          res.status(200).json({ downloadUrl: downloadUrl[0] });
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

routes.post("/removeStoredImage", async (req, res) => {
  const id = req.body.id;
  const imageType = req.body.imageType;
  aiMethods.deleteImage(id, imageType).then(() => {
    res.status(200).json({ msg: `${id}_${imageType}.jpg has been removed from storage` });
  });
});

routes.post("/text2Image", async (req, res) => {
  const prompt = req.body.prompt;
  const id = req.body.id;
  const style = req.body.style;

  const date = new Date().toISOString();

  await aiMethods.text2Image(id, style, 1, prompt).then( async (_)=>{
    await aiMethods.setReference(id, style).then(async (_)=>{
      setTimeout(async ()=>{
        await aiMethods.getDownloadUrl(id, style).then(async (downloadUrl)=>{
          setTimeout(async ()=>{
            res.status(200).json({ 
              image_info: {
                id: id,
                url: await downloadUrl[0],
                creation_date: date,
                filter: style,
              },
              prompt: prompt,
             });
          }, 2000);
        });
      },1500);
    });
  });

});



module.exports = routes;
