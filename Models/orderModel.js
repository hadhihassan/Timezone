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
            type: Number
        }
    }],
    paymentOption: {
        type: String,
        require:true
    },
    deliveryDate: {
        type: Date,
    },
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required:true
    },
    transactionId:{
        type:String,
        unique:true
    },
    isRefunded: {
        type:Boolean,
        default:false
    },
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
