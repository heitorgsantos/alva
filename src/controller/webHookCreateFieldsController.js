const { webHookCreateFieldsService } = require("../service/webHookCreateFieldsService");


const webHookCreateFieldsController = async (req, res) => {
  try {
    const response = await webHookCreateFieldsService(req.body);
    return res.status(200).json(response.message);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = { webHookCreateFieldsController };
