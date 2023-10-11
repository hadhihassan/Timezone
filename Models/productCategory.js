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
    },
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
})
const productCategry = mongoose.model(
    "productCategry",
    productCategrySchema
)
module.exports = productCategry