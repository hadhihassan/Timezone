const Offer = require("../Models/offerModel")
const Customer = require("../Models/customerModel")
const Product = require("../Models/productModel")
const Category = require("../Models/productCategory")



//**OFFER MANAGEMNT**//

//LIST THE ALL OFFERS
const loadOffersPage = async (req,res) => {
    try {
        const Offers = await Offer.find().sort({is_deleted:-1})
        return res.render("admin/Offer/offer",{ Offers })
        
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDERE THE ADD OFFERE PAGE 
const loadAddOfferPage = async (req,res) => {
    try {
        return res.render("admin/Offer/addOffer",{error:req.flash('error')})
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//CREATE THE OFFERE 
const createOffer = async  (req,res) =>{
    const {name, discount, startingDate, expiryDate, status } = req.body
    try {

        const  existOffer = await Offer.findOne({name})
        if(existOffer !== null && existOffer){
            req.flash('error','Name already exists..')
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
        return res.redirect("/admin/offer/create/") 
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
    try {
        console.log(req.body);
        const updateData = req.body;

        if (updateData) {
            const findOffer = await Offer.findOne({ _id: req.body.offerID });

            if (!findOffer) {
                return res.status(404).send('Offer not found');
            }

            findOffer.name = updateData.name;
            findOffer.discount = updateData.discount;
            findOffer.startingDate = updateData.startingDate;
            findOffer.expiryDate = updateData.expiryDate;
            findOffer.status = updateData.status;
            await findOffer.save();
            return res.redirect("/admin/Offer/");
        }
    } catch (error) {
        res.render("User/404", { message: " Server Error" });
    }
};//DELETE  THE OFFER
const deleteOffer = async (req,res) => {
    try{
        const offerId = req.params.id
        const findExpiredOffers = await Offer.findById(offerId);
        if (findExpiredOffers) {
                findExpiredOffers.is_deleted = true;
                const offerId = findExpiredOffers._id;
                await Product.updateMany({ offer: offerId }, {
                    $unset: { offer: 1 },
                    $set: { offerPrice: 0 }
                });
                const OfferCategory = await Category.updateMany({ offer: offerId }, { $unset: { offer: 1 } });

                if (OfferCategory.nModified > 0) {
                    for (const cate of OfferCategory) {
                        const categoryId = cate._id;
                        console.log(categoryId);
                        await Product.updateMany({ category: categoryId }, { $set: { categoryOfferPrice: 0 } });
                    }
                }
                await findExpiredOffers.save();
                return res.redirect("/admin/Offer/");   
        }
    } catch (error){
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//DELETED OFFER ACTIVE 
const activeOffer = async(req,res) => {
    try{
        const id = req.params.id
       const updateOffer =  await Offer.findByIdAndUpdate(id,{is_deleted : false})
        if(updateOffer){

            return res.redirect("/admin/Offer/")
        }
    } catch(error){
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}



module.exports = {
    createOffer, loadAddOfferPage, loadOffersPage, loadOfferEdit, saveEditOffer, deleteOffer, activeOffer
}