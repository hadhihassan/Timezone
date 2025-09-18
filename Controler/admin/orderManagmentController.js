const Customer = require('../../Models/customerModel')
const Order = require("../../Models/orderModel")

//LIST ALL ORDERS
const loadOrder = async (req, res) => {
    let page = req.query.page
    const pageSize = 10
    try {
        page = parseInt(req.query.page) || 1;
        const skip = ((page - 1) * pageSize);
        const currentPage = page
        let orders
        let len
        const status = req.body.status
        if (req.query.status === "Pending") {
            orders = await Order.find({ returnRequest: "Pending", orderCanceled: false })
                .skip(skip)
                .limit(pageSize)
                .populate("user")
                .populate("products.product")
                .populate("deliveryAddress")
                .exec();
            len = await Order.find({ returnRequest: "Pending", orderCanceled: false })
        } else if (req.query.status === "Completed") {
            orders = await Order.find({ returnRequest: "Completed", orderCanceled: false, is_returned: false })
                .skip(skip)
                .limit(pageSize)
                .populate("user")
                .populate("products.product")
                .populate("deliveryAddress")
                .exec();
            len = await Order.find({ returnRequest: "Completed", orderCanceled: false })
        } else if (req.query.status === "return") {
            orders = await Order.find({ return_Status: "Pending", is_returned: true })
                .skip(skip)
                .limit(pageSize)
                .populate("user")
                .populate("products.product")
                .populate("deliveryAddress")
                .exec();
            len = await Order.find({ return_Status: "Pending", is_returned: true })
        } else {
            orders = await Order.find()
                .skip(skip)
                .limit(pageSize)
                .populate("user")
                .populate("products.product")
                .populate("deliveryAddress")
                .exec();
            len = await Order.find()
        }

        let a = true
        if (orders) {
            return res.render("admin/order", { orders, len, currentPage, a })

        }
        console.log("GOT ERROR")
    } catch (error) {

    }
}//UPDATIN ORDER STATUS
const updateOrderStatus = async (req, res) => {
    const action = req.query.action;
    const orderId = req.query.orderId;
    try {
        const order = await Order.findByIdAndUpdate(
            { _id: orderId },
            { $set: { returnRequest: action } }
        );
        console.log(order);
        return res.redirect("/admin/orders")
    } catch (error) {
        console.error(error.message);
        // Handle the error appropriately (e.g., send an error response)
        res.status(500).send("Internal Server Error");
    }
};// UPDATING PRODUCT RETURN STATUS 
const updateReturnRequest = async (req, res) => {
    try {
        console.log(req.query);
        const action = req.query.action;
        const orderId = req.query.orderId;
        const order = await Order.findByIdAndUpdate(
            { _id: orderId },
            { $set: { return_Status: action } }
        );
        const referer = req.headers.referer;
        const originalPage = referer || '/';
        res.redirect(originalPage)
        if (action === "Completed") {
            const updateResult = await Customer.findByIdAndUpdate(
                order.user,
                {
                    $inc: { wallet: order.totalAmount },
                    $push: {
                        walletHistory: {
                            date: Date.now(),
                            amount: order.totalAmount,
                            message: `Product returned amount credited into wallet ${order.totalAmount}`,
                        },
                    },
                },
                { new: true } // To get the updated customer document
            )
            if (updateResult) {
                const referer = req.headers.referer;
                const originalPage = referer || '/';
                res.redirect(originalPage)
            }
        }


    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadOrder,
    updateOrderStatus,
    updateReturnRequest
}