const cron = require('node-cron')
const Product = require("../Models/productModel")
const Offer = require("../Models/offerModel")
const Category = require("../Models/productCategory")

const OfferCheckAndDeleteOffer = async (req, res) => {
    try {
        const currentDate = new Date();
        const findExpiredOffers = await Offer.find({ is_deleted: false, expiryDate: { $lte: currentDate } });
        if (findExpiredOffers.length > 0) {
            for (const offer of findExpiredOffers) {
                offer.is_deleted = true;
                const offerId = offer._id;
                await Product.updateMany({ offer: offerId }, {
                    $unset: { offer: 1 },
                    $set: { offerPrice: 0 }
                });
                console.log(offerId);
                const OfferCategory = await Category.updateMany({ offer: offerId }, { $unset: { offer: 1 } });
                console.log(OfferCategory);
                if (OfferCategory.nModified > 0) {
                    for (const cate of OfferCategory) {
                        const categoryId = cate._id;
                        console.log(categoryId);
                        await Product.updateMany({ category: categoryId }, { $set: { categoryOfferPrice: 0 } });
                        console.log("Updated category offer prices");
                    }
                }
                await offer.save();
            }
        }
    } catch (error) {
        console.error("Error in OfferCheckAndDeleteOffer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    OfferCheckAndDeleteOffer
}
