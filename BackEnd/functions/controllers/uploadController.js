const { uploadFileToGCS } = require('../services/gcs_service');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return req.response.error('No se ha proporcionado un archivo para subir');
    }

    const url = await uploadFileToGCS(req.file, req.body.type);
    return req.response.success({ url });
  } catch (error) {
    return req.response.error(`Error al subir la imagen: ${error.message}`);
  }
};

module.exports = { uploadImage };