const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderCanceled: {
        type: Boolean,
        default: false
    },
    orderCancelReason:{
        type:String,  
    },
    returnRequest: {
        type: String,
        enum: ["Pending", "Approved","Shipped" ,"Reject", "Completed"],
        default: "Pending"
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    }],
    paymentOption: {
        type: String,
        required:true
    },
    deliveryDate: Date,
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required:true
    },
    is_returned:{
        type:Boolean,
        default : false
    },
    return_reason:{
        type:String,
    },
    return_Status:{
        type: String,
        enum: ["Pending", "Reject","Approved","Completed"],
        default: "Pending"
    },
    payment_id:{
        type: String,
    }

});

orderSchema.pre("save", function (next) {
    const orderDate = this.orderDate;
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    this.deliveryDate = deliveryDate;
    next();
});

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
