const mongoose = require("mongoose")


const productCategrySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    image:{
        data:Buffer,
        contentType:String
    }
})
const productCategry = mongoose.model(
    "productCategry",
    productCategrySchema
)
module.exports = productCategry