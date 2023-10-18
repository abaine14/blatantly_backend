const express = require("express");
const dotenv = require("dotenv").config();
const deepai = require("deepai");
const Jimp = require("jimp");
const fetch = require('node-fetch');

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

deepai.setApiKey(process.env.DEEP_AI_API_KEY);

// Image Logic

exports.deepAiImage = async (data, type) => {
  let imageResult;
  const result = await deepai.callStandardApi(type, {
    text: data.prompt,
    width: "768",
    height: "768",
    grid_size: "1",
  });

  const date = new Date().toISOString();

  try {
    return imageResult = {
      id: result.id,
      url: result.output_url,
      creation_date: date,
    }
  } catch (error) {
    console.log(error);
  }

  return imageResult;
};

exports.deepAiText = async (data, isEnhancement) => {
  const result = await deepai.callStandardApi("text-generator", {
    text: data,
  });

  const date = new Date().toISOString();

  return {
    id: result.id,
    response: await result.output,
    creation_date: date,
    type: isEnhancement === "true" ? "Enhance Prompt" : "Chat Prompt",
  };
};

// Bucket Logic

exports.loaclSetReference = async (id, imageType) => {
  const bucket = admin.storage().bucket('aiart-376720.appspot.com');
  const options = {
    destination: `${alterString(imageType)}/${id}.jpg`,
    preconditionOpts:{ifGenerationMatch: 0}
  }
  bucket.upload(`controllers/images/${id}.jpg`, options);
};

exports.setReference = async (id, imageType) => {
  const bucket = admin.storage().bucket('aiart-376720.appspot.com');
  const options = {
    destination: `${alterString(imageType)}/${id}.jpg`,
    preconditionOpts:{ifGenerationMatch: 0}
  }
  bucket.upload(os.tmpdir() + `/${id}.jpg`, options);
};

exports.getDownloadUrl = async (id, imageType) => {
  const bucket = admin.storage().bucket(`aiart-376720.appspot.com`);
  const file = bucket.file(`${alterString(imageType)}/${id}.jpg`,);
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

const alterString = (original) => String(original).replace(' ', '_'); 

exports.text2Image = async (id, style, imageNumber ,prompt) => {

  const path =
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`
  };
  
  const body = JSON.stringify({
    "steps": 40,
    "width": 1024,
    "height": 1024,
    "seed": 0,
    "cfg_scale": 5,
    "samples": 1,
    "style_preset": style,
    "text_prompts": [
      {
        "text": prompt,
        "weight": 1
      }
    ]
  });

  const altBody = JSON.stringify({
    "steps": 40,
    "width": 1024,
    "height": 1024,
    "seed": 0,
    "cfg_scale": 5,
    "samples": 1,
    "text_prompts": [
      {
        "text": prompt,
        "weight": 1
      }
    ]
  });

  const response = await fetch(
    path,
    {
      headers,
      method: "POST",
      body: style === 'auto'? altBody: body,
    }
  );

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`)
  }

  const responseJSON = await response.json();

  await responseJSON.artifacts.forEach((image, index) => {
    fs.writeFileSync(
      os.tmpdir() + `/${id}.jpg`,
      Buffer.from(image.base64, 'base64')
    )
  })

}