const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    product_name : {
        type:String,
        require:true
    },
    manufacturer_name : {
        type:String,
        require:true
    },
    brand_name : {
        type:String,
        require:true
    },
    idendification_no : {
        type:String,
        require:true,   
    },
    price:{
        type:Number,
        require:true
    },
    relese_date : {
        type:Date,
        require:true
    },
    stock_count : {
        type:Number,
        require:true
    },
    description : {
        type:String,
        require:true
    },
    category : {
        type:String,
        require:true
    },
    product_tags : {
        type:String,
        require:true
    },
    in_stock : {
        type:Boolean,
        require:true
    },
    images : [{
        data:Buffer,
        contentType:String
    }],
    color : {
        type:String,
        require:true
    },
    meterial : {
        type:String,
        require:true
    },
    is_delete : {
        type:Boolean,
        default:false
    }
})

const product = mongoose.model(
    "product",
    productSchema
)

module.exports = product