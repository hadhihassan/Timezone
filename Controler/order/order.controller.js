const Customer = require('../../Models/customerModel')
const Address = require('../../Models/userAddress')
const Order = require("../../Models/orderModel");

const loadChekout = async (req, res) => {
    const user_id = req.session.user
    const mess = req.query.message || "";

    try {

        const User = await Customer.findById(req.session.user).populate('cart.product');
        const cartItems = User.cart;

        if (cartItems.length !== 0) {
            cartItems.forEach((item) => {

                const lowoOfferPrice = Math.max(item.product.offerPrice, item.product.categoryOfferPrice)
                let regularPrice
                if (lowoOfferPrice !== 0) {
                    regularPrice = lowoOfferPrice
                } else {
                    regularPrice = item.product.price
                }

                const productPrice = regularPrice
                const quantity = item.quantity; 
                item.total = quantity * productPrice;
            });

            const userdCoupons = User.earnedCoupons.map(earnedCoupon => earnedCoupon.coupon);
            const notUserCoupons = await Coupon.find({
                _id: { $nin: userdCoupons },
                coupon_done: false
            });
            
            await User.save();
            const cart = User.cart

            const address = await Address.find({ User: user_id })
            const selectAddress = await Address.findOne({ in_use: true, User: user_id })

            res.render("User/checkout",
                {
                    User,
                    cart,
                    address,
                    user: req.session.user,
                    selectAddress,
                    message: mess,
                    notUserCoupons,
                    success: req.flash("success"),
                    error: req.flash("error"),
                })
        } else {
            return res.redirect("/user/cart")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}

//PLACING ORDER
const placeOrder = async (req, res) => {
    couponDiscount = parseInt(req.body.discountAmount) || 0;
    const couponId = req.body.codeID
    const paymentOption = req.body.PaymentOption;

    try {

        // Validate payment option
        if (!["COD", "wallet", "paypal"].includes(paymentOption)) {
            return res.redirect("/user/checkout?message=Invalid payment option")
        }

        const userId = req.session.user;
        const user = await Customer.findById(userId).populate('cart.product');

        if (!user) {
            return res.redirect("/user/checkout?message=User not found")
        }

        // Calculate the total cart amount correctly based on the user's cart
        let totalAmount = user.cart.reduce(
            (total, cartItem) => total + cartItem.total,
            0
        );
        totalAmount = totalAmount - couponDiscount

        const usedAddress = await Address.findOne({
            $and: [{ User: userId }, { in_use: true }],
        });

        if (!usedAddress) {
            return res.redirect("/user/checkout?message=Select any address or add address")
        }
        if (paymentOption === "COD") {
            const address = usedAddress._id;
            const order = new Order({
                user: userId,
                totalAmount,
                paymentOption: paymentOption,
                deliveryAddress: address,
                discountAmount: couponDiscount
            });

            // Update product stock counts and add products to the order
            for (const cartItem of user.cart) {
                const productItem = await Product.findById(cartItem.product);
                if (!productItem) {
                    return res.redirect("/user/checkout?message=Product not found")

                }
                if (cartItem.quantity > productItem.stock_count) {
                    return res.redirect("/user/checkout?message=Not enough stock for some products")
                }
                // Update stock count and save the product
                productItem.stock_count -= cartItem.quantity;
                await productItem.save();
                // Add product to the order
                order.products.push({
                    product: cartItem.product,
                    quantity: cartItem.quantity,
                    total: cartItem.total,
                });
            }

            if (couponDiscount > 0) {
                await Customer.findByIdAndUpdate(req.session.user, {
                    $push: { "earnedCoupons": { coupon: couponId } }
                });
            }

            // Save the order and remove cart items
            const orderSave = await order.save();
            if (orderSave) {
                // Remove cart items from the user's cart
                const removeCart = await Customer.findByIdAndUpdate(req.session.user, { $unset: { cart: {} } });
                if (removeCart) {
                    return res.redirect('/user/show-order-details/');
                }
            }
        } else if (paymentOption === "wallet") {
            if (user.wallet < totalAmount) {
                return res.redirect("/user/checkout?message=Not enough amount in your wallet")
            }

            // Implement wallet payment logic here
            const address = usedAddress._id;
            const order = new Order({
                user: userId,
                totalAmount, // Assign the correct total amount here
                paymentOption: paymentOption,
                deliveryAddress: address,
                discountAmount: couponDiscount
            });
            
            // Update product stock counts and add products to the order
            for (const cartItem of user.cart) {
                const productItem = await Product.findById(cartItem.product);
                if (!productItem) {
                    return res.redirect("/user/checkout?message=Product not found")
                }
                if (cartItem.quantity > productItem.stock_count) {
                    return res.redirect("/user/checkout?message=Not enough stock for some products")
                }
                // Update stock count and save the product
                productItem.stock_count -= cartItem.quantity;
                await productItem.save();
                // Add product to the order
                order.products.push({
                    product: cartItem.product,
                    quantity: cartItem.quantity,
                    total: cartItem.total,
                });
            }
            if (couponDiscount > 0) {
                await Customer.findByIdAndUpdate(req.session.user, {
                    $push: { "earnedCoupons": { coupon: couponId } }
                })
                const customerId = req.session.user;

                // Create a new wallet history entry
                const walletHistoryEntry = {
                    date: Date.now(),
                    amount: couponDiscount,
                    message: 'Products purchased using wallet amount'
                };

                Customer.findByIdAndUpdate(customerId, {
                    $push: { walletHistory: walletHistoryEntry }
                })
                    .then((customer) => {
                        if (!customer) {
                            // Customer not found, handle this case as needed
                            return res.status(404).send('Customer not found');
                        }
                    })
                    .catch((err) => {
                        console.error('Error updating walletHistory:', err);
                        return res.status(500).send('Error updating walletHistory');
                    });
            }
            // Save the order and remove cart items
            const orderSave = await order.save();
            if (orderSave) {
                // Remove cart items from the user's cart
                const removeCart = await Customer.findByIdAndUpdate(req.session.user, { $unset: { cart: {} } });

                if (removeCart) {
                    return res.redirect('/user/show-order-details/');
                }
            }
        } else if (paymentOption === "paypal") {
            return res.redirect(`/user/product/online-payment?discount=${couponDiscount}&id=${couponId}`);
        }

    } catch (error) {
        console.error(error.message);
        return res.render("User/404", { message: "An error occurred while placing the order" })
    }
}

//RENDER THE ORDER PAGE
const loadOrder = async (req, res) => {
    try {
        const userId = req.session.user
        const userOrder = await Order.find({ user: userId })
            .populate("user")
            .populate("products.product")
            .populate("deliveryAddress")
            .sort({ createdAt: -1 })
            .exec();
        
        return res.render("User/profile/showOrders", {
            userOrder, user: userId, success: req.flash("success"),
            error: req.flash("error"),
        })

    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}


//RENDER THE ORDERD PRODUCT DETAILS PAGE
const loadOrderProductDetails = async (req, res) => {
    const orderId = req.body.Products; 
    try {
        const order = await Order.findById(orderId).populate({ path: "products.product", populate: { path: "category" } });
        if (!order) {
            return res.status(404).send("Order not found"); 
        }
        
        return res.render("User/profile/showProductDetails", {
            user: req.session.user, order, success: req.flash("success"),
            error: req.flash("error"),
        });
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//ORDER CANCELL
const cancelOrder = async (req, res) => {
    const orderId = req.body.orderId

    try {
        let reason = `Main reason: ${req.body.cancellReason}, Additional Comments: ${req.body.additionalComments}`;
        const cancel = await Order.findByIdAndUpdate(orderId, { $set: { orderCanceled: true, orderCancelReason: reason } })

        if (cancel.paymentOption == "razorpay") {
            const updateResult = await Customer.findByIdAndUpdate(
                cancel.user,
                {
                    $inc: { wallet: cancel.totalAmount },
                    $push: {
                        walletHistory: {
                            date: Date.now(),
                            amount: cancel.totalAmount,
                            message: "Order canceled and amount credited",
                        },
                    },
                },
                { new: true } 
            );
        }
        cancel.products.forEach(async (pro) => {
            const proUpdateQuantity = await product.findById(pro.product)
            proUpdateQuantity.stock_count += pro.quantity
            proUpdateQuantity.save()
        })

        return res.redirect("/user/show-order-details/")
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//PRODUCT RETURN REASON
const returnProductAction = async (req, res) => {
    try {
        let reason = `Main reason: ${req.body.returnReason}, Additional Comments: ${req.body.additionalComments}`;
        const returnOrder = await Order.findByIdAndUpdate(req.body.orderId, {
            $set: { is_returned: true, return_reason: reason }
        });
        
        if (returnOrder) {
            return res.redirect("/user/show-order-details/")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}

module.exports = {
    loadChekout,
    placeOrder,
    loadOrder,
    returnProductAction,
    cancelOrder,
    loadOrderProductDetails
}