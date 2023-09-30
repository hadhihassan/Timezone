const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    product_name : {
        type:String,
        required:true
    },
    manufacturer_name : {
        type:String,
        required:true
    },
    brand_name : {
        type:String,
        required:true
    },
    idendification_no : {
        type:String,
        required:true,   
    },
    price:{
        type:Number,
        required:true
    },
    relese_date : {
        type:Date,
        require:true
    },
    stock_count : {
        type:Number,
        required:true
    },
    description : {
        type:String,
        require:true
    },
    category : {
        type:String,
        required:true
    },
    product_tags : {
        type:String,
        required:true
    },
    in_stock : {
        type:Boolean,
        required:true
    },
    images : [{
        data:Buffer,
        contentType:String
    }],
    color : {
        type:String,
        required:true
    },
    meterial : {
        type:String,
        required:true
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