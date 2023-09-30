const express = require("express")
const multer = require("multer")
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const resizeProductImages = async (req, res, next) => {
  try {
    if (!req.files) return next();
    req.body.images = [];

    await Promise.all(
      req.files.map(async (file) => {
        const filename = `products-${uuidv4()}.jpeg`;
        const resizedBuffer = await sharp(file.buffer)
          .resize(540, 560) // Resize dimensions
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toBuffer(); // Convert to buffer instead of writing to a file

        req.body.images.push({ filename, buffer: resizedBuffer });
      })
    );

    // Set the content type to 'image/jpeg' for the response
    res.contentType('image/jpeg');
    next();
  } catch (error) {
    console.log(error.message); // Corrected 'conosle' to 'console'
    next(error);
  }
};



module.exports = {resizeProductImages}
