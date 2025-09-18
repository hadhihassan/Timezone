const Customer = require('../../Models/customerModel')
const Product = require('../../Models/productModel')

//RENDER THE CART
const loadCart = async (req, res) => {
    try {
        const userId = req.session.user;
        let totalCart = 0

        const userWithCart = await Customer.findById(userId).populate('cart.product');
        if (!userWithCart) {
            return res.status(404).send('User not found');
        }

        const cartItems = userWithCart.cart;

        cartItems.forEach(async (item) => {
            if (item.product) {

                let regularPrice
                const offerPrice = item.product.offerPrice;
                const price = item.product.price;
                const categoryOfferPrice = item.product.categoryOfferPrice;

                if (offerPrice > 0 && (offerPrice <= price || price <= 0) && (offerPrice <= categoryOfferPrice || categoryOfferPrice <= 0)) {
                    regularPrice = offerPrice;
                } else if (price > 0 && (price <= offerPrice || offerPrice <= 0) && (price <= categoryOfferPrice || categoryOfferPrice <= 0)) {
                    regularPrice = price;
                } else if (categoryOfferPrice > 0 && (categoryOfferPrice <= offerPrice || offerPrice <= 0) && (categoryOfferPrice <= price || price <= 0)) {
                    regularPrice = categoryOfferPrice;
                }

                const productPrice = regularPrice;
                const quantity = item.quantity;

                item.total = quantity * productPrice;
                totalCart += item.total

                await Customer.updateOne(
                    { _id: userId, "cart._id": item._id },
                    { $set: { "cart.$.total": item.total } }
                );
            }
        });

        userWithCart.totalCartAmount = totalCart
        const udpdateCart = await userWithCart.save();

        if (udpdateCart) {
            return res.render('User/cart', {
                currentUser: userWithCart,
                user: userId,
                Products: cartItems,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        }
    } catch (error) {
        res.render("User/404", { message: "Error loading cart" });
    }
}
//PRODUCT ADD TO CART
const productAddToCart = async (req, res) => {
    try {
        const quantity = 1
        
        const user = await Customer.findById(req.session.user)
        const product = await Product.findById(req.query.productId)

        const lowoOfferPrice = Math.max(product.offerPrice, product.categoryOfferPrice)
        const checkthestock = product.stock_count

        let regularPrice
        if (lowoOfferPrice !== 0) {
            regularPrice = lowoOfferPrice
        } else {
            regularPrice = product.price
        }

        const total = quantity * regularPrice
        let totalCartAmount = 0;

        user.cart.forEach(item => {
            totalCartAmount += item.total;
        })

        const existingCartItemIndex = await user.cart.find(item => item.product.equals(product._id))

        const referer = req.headers.referer;
        const originalPage = referer || '/';

        if (existingCartItemIndex && existingCartItemIndex.quantity + 1 <= checkthestock) {

            existingCartItemIndex.quantity += quantity
            existingCartItemIndex.total += total
            user.totalCartAmount = (totalCartAmount + total)

            await user.save()
            req.flash('success', 'product added to cart successfully')
            res.redirect(originalPage)
        }
        else if (!existingCartItemIndex) {

            user.cart.push({ product: product._id, quantity, total })
            user.totalCartAmount = (totalCartAmount + total);

            await user.save()
            req.flash('success', 'product added to cart successfully')
            res.redirect(originalPage)
        } else {
            req.flash('success', 'stock was exeeded...')
            res.redirect(originalPage)
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//UPDATING THE CART PRODUCT QUANTITY
const updateCartQuantity = async (req, res) => {
    try {
        const cartProductId = req.body.cartItemId
        const newQuantity = req.body.quantity

        const user = await Customer.findById(req.session.user)
        
        const cartProduct = user.cart.find(item => item.product._id.equals(cartProductId));
        if (!cartProduct) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        const product = await Product.findById(cartProduct.product);

        if (newQuantity > product.stock_count - 1) {

            return res.json({ stock: product.stock_count, error: "Stock limit exceeded..!" })
        }
        
        let regularPrice
        const offerPrice = product.offerPrice;
        const price = product.price;
        const categoryOfferPrice = product.categoryOfferPrice;

        if (offerPrice > 0 && (offerPrice < price || price <= 0) && (offerPrice < categoryOfferPrice || categoryOfferPrice <= 0)) {
            regularPrice = offerPrice;
        } else if (price > 0 && (price < offerPrice || offerPrice <= 0) && (price < categoryOfferPrice || categoryOfferPrice <= 0)) {
            regularPrice = price;
        } else if (categoryOfferPrice > 0 && (categoryOfferPrice < offerPrice || offerPrice <= 0) && (categoryOfferPrice < price || price <= 0)) {
            regularPrice = categoryOfferPrice;
        } else {
            regularPrice = price;
        }

        // Calculate the new total for the cart product that is being updated.
        const newTotal = newQuantity * regularPrice;
        cartProduct.quantity = newQuantity;
        cartProduct.total = newTotal;
        let totalCartAmount = 0

        user.cart.forEach((item) => {
            totalCartAmount += item.total;
        });

        user.totalCartAmount = totalCartAmount;
        await user.save();
        
        res.json({ message: 'Cart item quantity updated successfully', totalCartAmount, total: newTotal });
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//DELETE PRODUCT FROM THE CART
const deleteProductCart = async (req, res) => {
    try {
        const cartItemId = req.query.id

        const user = await Customer.findById(req.session.user)
        const cartIndex = user.cart.findIndex((item) => item._id.equals(cartItemId))

        if (cartIndex !== -1) {
            user.totalCartAmount = user.totalCartAmount - user.cart[cartIndex].total
            user.cart.splice(cartIndex, 1)

            await user.save()
            req.flash("success", "Item removed from the cart success fully....")
            return res.redirect('/user/cart')
        } else {
            req.flash("success", "Item not found in the cart... ")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}

module.exports = {
    productAddToCart, loadCart, updateCartQuantity, deleteProductCart
}