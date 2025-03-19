const { createFilesService } = require("../service/createFilesService");

const createFilesController = async (req, res) => {
  try {
    const response = await createFilesService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.status).json(error.message);
  }
};

module.exports = { createFilesController };
