const express = require("express");
const aiRoutes = require("./routes/routes");
const dotenv = require("dotenv").config();
const functions = require("firebase-functions");

const cors = require("cors");

const app = express();

// Allow for body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api", aiRoutes);

// app.listen(8080, () => {
//   console.log(`Server listening on port ${8080}`);
// });

exports.blatantly_api = functions.https.onRequest(app);