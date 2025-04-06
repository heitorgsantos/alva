const {
  associationsProductsWithDealsService,
} = require("../service/associationsProductsWithDealsService");

const associationsProductsWithDealsController = async (req, res) => {
  try {
    const response = await associationsProductsWithDealsService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.status).json(error.message);
  }
};

module.exports = { associationsProductsWithDealsController };
