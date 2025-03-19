const createFilesService = (data) => {
  console.log(data);

  return { status: 200, message: data };
};

module.exports = { createFilesService };
