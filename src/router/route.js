const { Router } = require("express");
const {
  integrationProductsController,
} = require("../controller/integrationProductsController");
const { createDealController } = require("../controller/createDealController");
const {
  associationController,
} = require("../controller/associationController");
const {
  webHookCreateFieldsController,
} = require("../controller/webHookCreateFieldsController");
const {
  associationsProductsWithDealsController,
} = require("../controller/associationsProductsWithDealsController");
const router = Router();

router.post("/create-products", integrationProductsController);
router.post("/get-clients", createDealController);
router.post("/include-fields", associationController);
router.post("/create-files", webHookCreateFieldsController);
router.post("/associations-products", associationsProductsWithDealsController);

module.exports = { router };
