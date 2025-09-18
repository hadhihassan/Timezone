const mongoose = require("mongoose");
const env = require("./env.config");

const connectDatabase = () => {
    mongoose
        .connect(env.MONGODB_URL)
        .then(() => {
            console.info("Database Status: \tConnected");
        })
        .catch((err) => console.error(err));
};

module.exports = connectDatabase