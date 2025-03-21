const { createFilesService } = require("../service/createFilesService");

const createFilesController = async (req, res) => {
  try {
    const response = await createFilesService(req.body);
    return res.status(200).json(response.message);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = { createFilesController };
