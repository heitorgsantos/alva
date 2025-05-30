const { Router } = require("express");
const {
  webHookCreateFieldsController,
} = require("../controller/webHookCreateFieldsController");

const router = Router();

router.post("/create-files", webHookCreateFieldsController);

module.exports = { router };
