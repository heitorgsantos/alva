const { createFilesService } = require("../service/createFilesService");

const createFilesController = async (req, res) => {
  try {
    const response = await createFilesService(req.body);
    return res.status(response.status).json(response.message);
  } catch (error) {
    return res.status(error.status).json(error.message);
  }
};

module.exports = { createFilesController };
