const mongoose = require("mongoose")


const AddressSchema = new mongoose.Schema({
    User:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Customer",
        require:true
    },
    Name:{
        type:String,
        require:true
    },
    Mobile:{
        type:String,
        require:true
    },
    Email:{
        type:String,
        require:true
    },
    HouseName:{
        type:String,
        require:true
    },
    RoadArea:{
        type:String,
        require:true
    },
    City:{
        type:String,
        require:true
    },Region:{
        type:String,
        require:true
    },
    PinCode:{
        type:Number,
        require:true
    },
    Country:{
        type:String,
        require:true    
    },
    in_use:{
        type:Boolean,
        default:false
    }
})


const Address = mongoose.model(
    'Address',
    AddressSchema

)

module.exports = Address