const Customer = require('../Models/customerModel')

//RENDER THE WALLET PAGE
const loadWallet = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
            .sort({ "walletHistory.date": -1 });

        return res.render("User/profile/wallet", {
            user, sessionUser: req.session.user, success: req.flash("success"),
            error: req.flash("error"),
        });

    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}

//WISHLIST 
const loadWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
            .populate({ path: 'wishlist', populate: { path: 'category', }, })
            .exec();

        const wishlistItems = user.wishlist; 
        const cart = []

        for (let id of user.cart) {
            cart.push(id.product)
        }
        
        if (wishlistItems) {
            return res.render("User/wishlist", {
                items: wishlistItems,
                user: req.session.user,
                cart,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
};
//ADD PRODUCT TO WISHLIST
const addProductInWishlist = async (req, res) => {
    const productId = req.query.id;
    try {

        const productExist = await Customer.findOne({
            _id: req.session.user,
            wishlist: productId
        });

        const referer = req.headers.referer;
        const originalPage = referer || '/';

        if (!productExist) {
            await Customer.findByIdAndUpdate(req.session.user, { $push: { wishlist: productId } });
            req.flash('success', 'Product added to your wishlist.');
            return res.redirect(originalPage)
        } else {
            req.flash('success', 'Product is already in your wishlist.');
            return res.redirect(originalPage)
        }
    } catch (error) {

        res.render("User/404", { message: "An error occurred while adding the product to your wishlist." });
    }
};
//DELETE THE WISHLIST ITEM
const deleteItemInWishlist = async (req, res) => {
    try {
        const id = req.query.id;
        const userId = req.session.user;

        const deleteItem = await Customer.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: id } }
        );

        const referer = req.headers.referer;
        const originalPage = referer || '/';

        if (deleteItem) {
            req.flash("success", "Product removed successfully");
        } else {
            req.flash("error", "Product not found");
        }

        return res.redirect(originalPage);
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
};


module.exports = {
    loadWallet,
    loadWishlist,
    addProductInWishlist,
    deleteItemInWishlist
}