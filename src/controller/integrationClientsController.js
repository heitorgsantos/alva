const {
  integrationClientsService,
} = require("../service/integrationClientsService");

const integrationClientsController = async (req, res) => {
  try {
    const response = await integrationClientsService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.status).json(error.message);
  }
};

module.exports = { integrationClientsController };
