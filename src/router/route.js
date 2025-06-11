const { Router } = require("express");
const {
  webHookCreateFieldsController,
} = require("../controller/webHookCreateFieldsController");

const router = Router();

router.post("/create-files/sandbox", webHookCreateFieldsController);

module.exports = { router };