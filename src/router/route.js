const { Router } = require("express");
const {
  integrationProductsController,
} = require("../controller/integrationProductsController");
const {
  integrationClientsController,
} = require("../controller/integrationClientsController");
const {
  associationController,
} = require("../controller/associationController");
const {
  createFilesController,
} = require("../controller/createFilesController");
const router = Router();

router.post("/create-products", integrationProductsController);
router.get("/get-clients", integrationClientsController);
router.post("/include-fields", associationController);
router.post("/create-files", createFilesController);

module.exports = { router };
