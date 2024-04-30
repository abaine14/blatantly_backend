const routes = require("express").Router();
const aiMethods = require("../controllers/ai-methods");
const fs = require("fs");
const os = require("os");
const accountCheck = require("../caching/account_request");

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
  await aiMethods
    .text2Image(id, style, prompt, imageCount)
    .then(async (_) => {
      await aiMethods
        .setReference(id, style)
        .then(async (_) => {
          setTimeout(async () => {
            await aiMethods
              .getDownloadUrl(id, style)
              .then(async (downloadUrl) => {
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
              })
              .catch((err) => {
                console.log(err);
                res.status(400).json(err);
              });
          }, 1500);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

routes.post("/editImage", async (req, res) => {
  const { url, id, style, imageCount, textPrompt, originalPrompt, allEdits } =
    req.body;
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
                    prompt: originalPrompt,
                    edits: allEdits,
                  });
                }, 2000);
              })
              .catch((err) => {
                console.log(err);
                res.status(400).json(err);
              });
          }, 1500);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

routes.post("/altImage", async (req, res) => {
  const { id, prompt, style } = req.body;
  const date = new Date().toISOString();
  const style_preset =
    style.toLocaleLowerCase().replace(" ", "-") + "-generator";
  await aiMethods
    .deepAiImage(id, prompt, style_preset)
    .then(async (_) => {
      await aiMethods
        .setReference(id, style)
        .then(async (_) => {
          setTimeout(async () => {
            await aiMethods
              .getDownloadUrl(id, style)
              .then(async (downloadUrl) => {
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
              })
              .catch((err) => {
                console.log(err);
                res.status(400).json(err);
              });
          }, 1500);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

routes.post("/altImageEdit", async (req, res) => {
  const { id, url, prompt, style, originalPrompt, allEdits } = req.body;
  const date = new Date().toISOString();
  const newId = `${id}_${aiMethods.makeId(5)}`;
  aiMethods
    .deepAiImageEdit(newId, url, prompt)
    .then(async (_) => {
      // await aiMethods
      //   .setReference(newId, style)
      //   .then(async (_) => {
      //     setTimeout(async () => {
      //       await aiMethods
      //         .getDownloadUrl(newId, style)
      //         .then(async (downloadUrl) => {
      //           fs.unlink(os.tmpdir() + `/${newId}.jpg`, (err) => {});
      //           setTimeout(async () => {
      //             res.status(200).json({
      //               image_info: {
      //                 id: newId,
      //                 url: await downloadUrl[0],
      //                 creation_date: date,
      //                 filter: style,
      //               },
      //               prompt: originalPrompt,
      //               edits: allEdits,
      //             });
      //           }, 2000);
      //         })
      //         .catch((err) => {
      //           console.log(err);
      //           res.status(400).json(err);
      //         });
      //     }, 1500);
      //})
      // .catch((err) => {
      //   console.log(err);
      //   res.status(400).json(err);
      // });
    })
    .catch((err) => {
      res.status(400).json(err);
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

routes.post("/accountCheck", async (req, res) => {
  const { uid } = req.body;
  const isLoading = accountCheck.checkIfAccountIsLoading(uid);
  if (isLoading) {
    res.status(400).json({ processRequest: false });
  } else {
    accountCheck.setAccountLoading(uid);
    res.status(200).json({ processRequest: true });
  }
});

routes.post("/removeAccountRemotely", async (req, res) => {
  const { uid } = req.body;
  accountCheck.removeLoadedAccount(uid);
  res.status(200).json({ message: "removed request" });
});

module.exports = routes;
