const express = require("express")
const multer = require("multer")
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const storage = multer.memoryStorage()
const upload = multer({storage:storage})



const resizeProductImages = async (req, res, next) => {
  try {
    console.log(req.files);
    if (!req.files) {
      console.log("not working KKKKKKKKKKKKKKKKKKKKKKKKKK ");
    }
    const resizeOptions = {
      width: 140,
      height: 960,
      fit: 'inside',
    };
    await Promise.all(
      req.files.map(async (file) => {
        const resizedImageBuffer = await sharp(file.buffer)
          .resize(resizeOptions)
          .toBuffer();
          console.log("HAI __________ HAi")
        file.buffer = resizedImageBuffer;
      })
    );
    

    next();
  } catch (error) {
    console.error(error.message);
    next(error); // Pass the error to the next middleware
  }
};


module.exports = { resizeProductImages }
