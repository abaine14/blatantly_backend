const express = require("express");
const aiRoutes = require("./routes/image-routes");
const stripeRoutes = require('./routes/stripe-routes');
const pageRoutes = require('./routes/page-routes');
const functions = require("firebase-functions");

const cors = require("cors");

const app = express();

// Allow for body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api", aiRoutes);
app.use("/stripe", stripeRoutes);
app.use("/pages", pageRoutes);

// app.listen(8080, () => {
//   console.log(`Server listening on port ${8080}`);
// });

exports.blatantly_api = functions.https.onRequest(app);