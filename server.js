require("./src/workers/webhookWorker"); // This will start the worker
const express = require("express");
const cors = require("cors");
const { router } = require("./src/router/route"); // Ensure this path is correct
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(router); // Assuming your router prefix is '/' or defined within route.js
app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}!`);
  console.log(
    `Webhooks will be accepted at /create-files (or your defined route).`
  );
});
