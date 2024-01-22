const routes = require("express").Router();
const aiMethods = require("../controllers/ai-methods");
const imageToBase64 = require("image-to-base64");
const fetch = require("node-fetch");
const FormData = require("form-data");
const sharp = require("sharp");
const fs = require("fs");
const os = require("os");
const _ = require("lodash");

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
        aiMethods
          .getDownloadUrl(req.params.id, imageType)
          .then((downloadUrl) => {
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
    res
      .status(200)
      .json({ msg: `${id}_${imageType}.jpg has been removed from storage` });
  });
});

routes.post("/text2Image", async (req, res) => {
  const { prompt, id, imageCount, style } = req.body;
  const date = new Date().toISOString();
  await aiMethods.text2Image(id, style, prompt, imageCount).then(async (_) => {
    await aiMethods.setReference(id, style).then(async (_) => {
      setTimeout(async () => {
        await aiMethods.getDownloadUrl(id, style).then(async (downloadUrl) => {
          fs.unlink(os.tmpdir() + `/${id}.jpg`, (err) => {});
          setTimeout(async () => {
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
      }, 1500);
    });
  });
});

routes.post("/editImage", async (req, res) => {
  const { url, id, style, imageCount, textPrompt, originalPrompt } = req.body;
  const style_preset = String(style).replace(" ", "-").toLocaleLowerCase();
  const newId = `${id}_${aiMethods.makeId(5)}`;
  const date = new Date().toISOString();
  await aiMethods
    .editImage(url, id, newId, style_preset, imageCount, textPrompt)
    .then(async (_) => {
      await aiMethods
        .setReference(newId, style_preset)
        .then(async (_) => {
          setTimeout(async () => {
            await aiMethods
              .getDownloadUrl(newId, style_preset)
              .then((downloadUrl) => {
                fs.unlink(os.tmpdir() + `/${id}.jpg`, (err) => {});
                fs.unlink(os.tmpdir() + `/${newId}.jpg`, (err) => {});
                setTimeout(() => {
                  res.status(200).json({
                    image_info: {
                      id: newId,
                      url: downloadUrl[0],
                      creation_date: date,
                      filter: style,
                    },
                    original_prompt: originalPrompt,
                    prompt: textPrompt,
                  });
                }, 2000);
              });
          }, 1500);
        })
        .catch((err) => {
          console.log(err.message);
        });
    })
    .catch((err) => {
      console.log(err.message);
    });
});

routes.post("/create_wallpaper", async (req, res) => {
  const { id, url, width, height, style, textPrompt } = req.body;
  const newId = `${id}_${aiMethods.makeId(5)}`;
  const style_preset = String(style).replace(" ", "-").toLocaleLowerCase();
  const date = new Date().toISOString();

  await aiMethods.createWallpaper(id, newId, url, width, height).then((_) => {
    aiMethods.setReference(newId, style_preset).then((_) => {
      setTimeout(async () => {
        await aiMethods
          .getDownloadUrl(newId, style_preset)
          .then((downloadUrl) => {
            fs.unlink(os.tmpdir() + `/${id}.jpg`, (err) => {
              console.debug(err);
            });
            fs.unlink(os.tmpdir() + `/${newId}.jpg`, (err) => {
              console.debug(err);
            });
            setTimeout(() => {
              res.status(200).json({
                image_info: {
                  id: newId,
                  url: downloadUrl[0],
                  creation_date: date,
                  filter: style,
                },
                wallPaper_info: {
                  width: width,
                  height: height,
                  originalId: id,
                },
                prompt: textPrompt,
              });
            }, 2000);
          }, 1500);
      });
    });
  });
});

module.exports = routes;
