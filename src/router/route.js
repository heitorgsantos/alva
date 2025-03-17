const { Router } = require("express");
const {
  integrationProductsController,
} = require("../controller/integrationProductsController");
const {
  integrationClientsController,
} = require("../controller/integrationClientsController");
const router = Router();

router.post("/create-products", integrationProductsController);
router.get("/get-clients", integrationClientsController);

module.exports = { router };
