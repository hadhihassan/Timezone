const mongoose = require('mongoose')

const CustomerSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    mobile:{
        type:String,
        require:true
    },
    gender:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    conformpassword:{
        type:String,
        require:true
    },
    is_Admin:{
        type:Boolean,
        default:false
    },
    image:{
        data:Buffer,
        contentType:String
    },
    is_varified:{
        type:Boolean,
        default:false
    },
    is_block:{
        type:Boolean,
        default:false
    },
    cart:[{
           product:{
               type: mongoose.Schema.Types.ObjectId,
               ref: 'product',
           },
           quantity:{
               type : Number,
               default: 1
           },
           total:{
              type:Number,
              default:0
           }
        
        }],
    totalCartAmount:{
        type:Number,
        default:0
    },
})
 
const Customer = mongoose.model(
    'Customer',
    CustomerSchema)

module.exports =  Customer;
