const express = require("express");
const aiRoutes = require("./routes/image-routes");
const pageRoutes = require("./routes/page-routes");
const chatRoutes = require("./routes/chat-routes");
const functions = require("firebase-functions");

const cors = require("cors");

const app = express();

// Allow for body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", aiRoutes);
app.use("/pages", pageRoutes);
app.use("/chats", chatRoutes);

// Uncomment this section to test locally
//Comment again when deploying
// Always set the node version in the console to v21 and adjust the timeout for requests to 180 seconds

// app.listen(8080, () => {
//   console.log(`Server listening on port ${8080}`);
// });

exports.blatantly_api = functions.https.onRequest(app);
