const bcrypt = require("bcrypt");

const generateOTP = () => `${Math.floor(1000 + Math.random() * 9000)}`;

const   hashOTP = async (otp) => {
  const saltRounds = 10;
  return await bcrypt.hash(otp, saltRounds);
};

module.exports = { generateOTP, hashOTP };
