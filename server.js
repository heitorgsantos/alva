const express = require("express");
const cors = require("cors");
const { router } = require("./src/router/route");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(router);

app.listen(port, () => console.log(`Porta ${port}!`));
