const { associationService } = require("../service/associationService");

const associationController = async (req, res) => {
  try {
    const response = await associationService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.status).json(error.message);
  }
};

module.exports = { associationController };
