const cloudinary = require('../config/cloudinary');

async function uploadBuffer(buffer, folder = 'profile_images') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

module.exports = uploadBuffer;