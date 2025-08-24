const Offer = require("../Models/offerModel")
const Customer = require("../Models/customerModel")
const Product = require("../Models/productModel")
const Category = require("../Models/productCategory")

//LIST THE ALL OFFERS
const loadOffersPage = async (req, res) => {
    try {
        const a = "offer"
        let page = req.query.page
        const pageSize = 10
        page = parseInt(req.query.page) || 1;
        const currentPage = page
        let Offers
        let len

        let query = req.query.query || ""
        if (query !== "") {
            Offers = await Offer.find({ name: { $regex: query, $options: 'i' } }).sort({ is_deleted: -1 });
            len = await Offer.find({ name: { $regex: query, $options: 'i' } }).sort({ is_deleted: -1 });
            return res.render("admin/Offer/offer", { Offers, query, currentPage, len })
        } else {
            Offers = await Offer.find().sort({ is_deleted: -1 })
            len = await Offer.find().sort({ is_deleted: -1 })
            return res.render("admin/Offer/offer", { Offers, query, currentPage, len, a })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//RENDERE THE ADD OFFERE PAGE 
const loadAddOfferPage = async (req, res) => {
    try {
        return res.render("admin/Offer/addOffer", { error: req.flash('error'), a: "offer" })
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//CREATE THE OFFERE 
const createOffer = async (req, res) => {
    const { name, discount, startingDate, expiryDate, status } = req.body
    try {

        const existOffer = await Offer.findOne({ name })
        if (existOffer !== null && existOffer) {
            req.flash('error', 'Name already exists..')
            return res.redirect("/admin/offer/create/")
        }
        const newOffer = new Offer({
            name,
            discount,
            startingDate,
            expiryDate,
            status
        })
        await newOffer.save()
        return res.redirect("/admin/Offer/")
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE OFFER EDIT PAGE
const loadOfferEdit = async (req, res) => {
    try {
        const offerID = req.params.id
        const findOffer = await Offer.findById(offerID)
        if (findOffer) {
            findOffer.startingDateFormatted = findOffer.startingDate.toISOString().split('T')[0];
            findOffer.expDateFormatted = findOffer.expiryDate.toISOString().split('T')[0];
            return res.render("admin/Offer/editOffer", {
                findOffer,
                error: "",
            })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//SAVE THE EDIT OFFER
const saveEditOffer = async (req, res) => {
    const updateData = req.body;

    if (updateData) {
        try {
            // Find the offer by its ID
            const findOffer = await Offer.findOne({ _id: updateData.offerID });

            if (!findOffer) {
                return res.status(404).send('Offer not found');
            }

            // Update offer details
            findOffer.name = updateData.name;
            findOffer.discount = updateData.discount;
            findOffer.startingDate = updateData.startingDate;
            findOffer.expiryDate = updateData.expiryDate;
            findOffer.status = updateData.status;

            // Save the updated offer
            await findOffer.save();

            // Find related categories using the offer ID
            const categories = await Category.find({ offer: updateData.offerID }, { _id: 1 });

            // Update products with the new prices
            const products = await Product.find({ offer: updateData.offerID });

            for (let i = 0; i < products.length; i++) {
                const price = products[i].price;
                const newPrice = price - Math.floor((updateData.discount / 100) * price);
                products[i].offerPrice = newPrice;

                // Check if the product's category is in the related categories
                if (categories.some(category => category._id.equals(products[i].category))) {
                    products[i].categoryOfferPrice = newPrice;
                }

                // Save the updated product
                await products[i].save();
            }

            // Update category-related products
            for (let i = 0; i < categories.length; i++) {
                const categoryProducts = await Product.find({ category: categories[i] });

                for (let j = 0; j < categoryProducts.length; j++) {
                    const product = categoryProducts[j];
                    const newPrice = product.price - Math.floor((updateData.discount / 100) * product.price);
                    product.categoryOfferPrice = newPrice;

                    // Save the updated product
                    await product.save();
                }
            }

            // Save the offer once more
            await findOffer.save();

            // Redirect to the Offer page
            return res.redirect("/admin/Offer/");
        } catch (error) {
            console.error(error);
            res.render("User/404", { message: "An error occurred. Please try again later." });
        }
    }
};
//DELETE  THE OFFER
const deleteOffer = async (req, res) => {
    try {
        const offerId = req.params.id
        const findExpiredOffers = await Offer.findById(offerId);
        if (findExpiredOffers) {
            findExpiredOffers.is_deleted = true;
            const offerId = findExpiredOffers._id;
            await Product.updateMany({ offer: offerId }, {
                $unset: { offer: 1 },
                $set: { offerPrice: 0 }
            });
            let categoryIds = await Category.find({ offer: offerId });
            const OfferCategory = await Category.updateMany({ offer: offerId }, { $unset: { offer: 1 } });
            
            if (OfferCategory.modifiedCount > 0) {

                await Product.updateMany(
                    { category: { $in: categoryIds } },
                    { $set: { categoryOfferPrice: 0 } }
                );

            }
            await findExpiredOffers.save();
            return res.redirect("/admin/Offer/");
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//DELETED OFFER ACTIVE 
const activeOffer = async (req, res) => {
    try {
        const id = req.params.id
        const updateOffer = await Offer.findByIdAndUpdate(id, { is_deleted: false })
        if (updateOffer) {

            return res.redirect("/admin/Offer/")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}

module.exports = {
    createOffer, loadAddOfferPage, loadOffersPage, loadOfferEdit, saveEditOffer, deleteOffer, activeOffer
}