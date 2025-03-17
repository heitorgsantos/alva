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
const router = Router();

router.post("/create-products", integrationProductsController);
router.get("/get-clients", integrationClientsController);
router.post("include-fields", associationController);

module.exports = { router };
