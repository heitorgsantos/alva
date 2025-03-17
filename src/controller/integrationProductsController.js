const {
  integrationProductsService,
} = require("../service/integrationProductsService");

const integrationProductsController = async (req, res) => {
  try {
    const response = await integrationProductsService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.status).json(error.message);
  }
};

module.exports = { integrationProductsController };
