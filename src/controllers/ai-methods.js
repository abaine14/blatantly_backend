const fetch = require("node-fetch");
const FormData = require("form-data");
const imageToBase64 = require("image-to-base64");
const sharp = require("sharp");

const fs = require("fs");
const os = require("os");
const { initializeApp } = require("firebase-admin/app");
const { getStorage, ref, uploadBytes } = require("firebase-admin/storage");

const admin = require("firebase-admin");

const serviceAccount = require("./aiart-376720-firebase-adminsdk-ee3ol-d01f0db637.json");
const { async, base64 } = require("@firebase/util");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://aiart-376720.appspot.com/",
});

// Bucket Logic

exports.localSetReference = async (id, imageType) => {
  const bucket = admin.storage().bucket("aiart-376720.appspot.com");
  const options = {
    destination: `${alterString(imageType)}/${id}.jpg`,
    preconditionOpts: { ifGenerationMatch: 0 },
  };
  bucket.upload(`controllers/${id}.jpg`, options);
};

exports.setReference = async (id, imageType) => {
  const bucket = admin.storage().bucket("aiart-376720.appspot.com");
  const options = {
    destination: `${alterString(imageType)}/${id}.jpg`,
    preconditionOpts: { ifGenerationMatch: 0 },
  };
  bucket.upload(os.tmpdir() + `/${id}.jpg`, options);
};

exports.getDownloadUrl = async (id, imageType) => {
  const bucket = admin.storage().bucket(`aiart-376720.appspot.com`);
  const file = bucket.file(`${alterString(imageType)}/${id}.jpg`);
  return file.getSignedUrl({
    action: "read",
    expires: "08-09-2499",
  });
};

exports.deleteImage = async (id, imageType) => {
  const bucket = admin.storage().bucket(`aiart-376720.appspot.com`);
  const file = bucket.file(`${alterString(imageType)}/${id}.jpg`);
  return file.delete();
};

const alterString = (original) => String(original).replace(" ", "_");

exports.text2Image = async (id, style, prompt, imageCount) => {
  const path =
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer sk-pR78H9Pp31Enra7exxkTtduD6I5VxNQMQ41SbV2Ux4ynTRf1",
  };

  const body = JSON.stringify({
    steps: 40,
    width: 1024,
    height: 1024,
    seed: 0,
    cfg_scale: 5,
    samples: imageCount,
    style_preset: style,
    text_prompts: [
      {
        text: prompt,
        weight: 1,
      },
    ],
  });

  const altBody = JSON.stringify({
    steps: 40,
    width: 1024,
    height: 1024,
    seed: 0,
    cfg_scale: 5,
    samples: 1,
    text_prompts: [
      {
        text: prompt,
        weight: 1,
      },
    ],
  });

  const response = await fetch(path, {
    headers,
    method: "POST",
    body: style === "auto" ? altBody : body,
  });

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  const responseJSON = await response.json();

  await responseJSON.artifacts.forEach((image, index) => {
    fs.writeFileSync(
      os.tmpdir() + `/${id}.jpg`,
      Buffer.from(image.base64, "base64")
    );
  });
};
exports.urlToBase64 = async (url) => {
  var parts = url.split(":");
  var encoded = btoa(parts[1]);
  return encoded;
};

exports.base64ToBinary = async (base64) => {
  var binary = "";
  var bytes = atob(base64);
  for (var i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
};

exports.makeId = (length) => {
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

exports.editImage = async (url, id, newId, style, imageCount, textPrompt) => {
  const path =
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image";

  await imageToBase64(url).then((urlResponse) => {
    const binaryString = atob(urlResponse);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = new Buffer.from(bytes.buffer, "base64");
    //write initial file with original id
    fs.writeFileSync(os.tmpdir() + `/${id}.jpg`, Buffer.from(buffer, "base64"));
  });

  const formData = new FormData();

  formData.append("init_image", fs.readFileSync(os.tmpdir() + `/${id}.jpg`), {
    contentType: "image/png",
  });
  formData.append("init_image_mode", "IMAGE_STRENGTH");
  formData.append("image_strength", 0.35);
  formData.append("text_prompts[0][text]", textPrompt);
  formData.append("cfg_scale", 7);
  formData.append("samples", imageCount);
  formData.append("steps", 40);
  formData.append("style_preset", style);

  const response = await fetch(path, {
    method: "POST",
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer sk-pR78H9Pp31Enra7exxkTtduD6I5VxNQMQ41SbV2Ux4ynTRf1`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  const responseJSON = await response.json();

  responseJSON.artifacts.forEach((image, index) => {
    fs.writeFileSync(
      os.tmpdir() + `/${newId}.jpg`,
      Buffer.from(image.base64, "base64")
    );
  });
};

exports.createWallpaper = async (id, newId, url, width, height) => {
  const path =
    "https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale";

  await imageToBase64(url).then((urlResponse) => {
    const binaryString = atob(urlResponse);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = new Buffer.from(bytes.buffer, "base64");
    //write initial file with original id
    fs.writeFileSync(os.tmpdir() + `/${id}.jpg`, Buffer.from(buffer, "base64"));
  });

  const formData = new FormData();
  formData.append("image", fs.readFileSync(os.tmpdir() + `/${id}.jpg`), {
    contentType: "image/png",
  });
  formData.append("width", width);

  const response = await fetch(path, {
    method: "POST",
    headers: {
      ...formData.getHeaders(),
      Accept: "image/png",
      Authorization: `Bearer sk-pR78H9Pp31Enra7exxkTtduD6I5VxNQMQ41SbV2Ux4ynTRf1`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  const image = await response.arrayBuffer();
  fs.writeFileSync(os.tmpdir() + `/${newId}.jpg`, Buffer.from(image));
};
