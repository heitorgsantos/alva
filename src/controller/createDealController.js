const {
  createDealService,
} = require("../service/createDealService");

const createDealController = async (req, res) => {
  try {
    const response = await createDealService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.status).json(error.message);
  }
};

module.exports = { createDealController };
