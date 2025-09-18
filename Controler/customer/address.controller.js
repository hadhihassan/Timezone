const Address = require('../../Models/userAddress')

//RENDER THE ADD NEW ADDRESS PAGE
const loadAddAddressPage = (req, res) => {
    const id = req.body.id
    const back = req.body.back

    try {
        res.render("User/profile/addAddress", {
            id, back, success: req.flash("success"),
            error: req.flash("error"),
            user: req.session.user
        })
    } catch (error) {

    }
}
//ADD NEW ADDRESS
const addUserAddress = async (req, res) => {
    const back = req.body.back

    try {
        const saveaddress = new Address({
            User: req.body.id,
            Name: req.body.name,
            Mobile: req.body.mbn,
            Email: req.body.email,
            HouseName: req.body.houseno,
            RoadArea: req.body.area,
            City: req.body.city,
            PinCode: req.body.pincode,
            Country: req.body.country
        })

        await saveaddress.save()

        if (saveaddress) {
            if (back == "true") {

                return res.redirect("/user/Checkout")
            }
            return res.redirect("/user/profile")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//RENDER THE EDIT ADDRESS PAGE
const editAddress = async (req, res) => {
    try {

        const address = await Address.findById(req.body.id)
        const bc = req.body.back
        if (address) {
            return res.render("User/profile/editAddress", { address, bc, user: req.session.user })
        }
    } catch (error) {

        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//EDITED ADDRESS UPDATING 
const updateAddress = async (req, res) => {
    try {

        const findAddress = await Address.findById(req.body.id)
        const back = req.body.back

        if (findAddress) {

            const updatedAddress = await Address.findByIdAndUpdate(req.body.id, {
                Name: req.body.name,
                Mobile: req.body.mbn,
                Email: req.body.email,
                HouseName: req.body.houseno,
                RoadArea: req.body.area,
                City: req.body.city,
                PinCode: req.body.pincode,
                Country: req.body.country
            });
            if (updatedAddress) {
                if (back != undefined) {
                    return res.redirect("/user/Checkout")
                }
                return res.redirect("/user/profile")
            }
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//DELETE USER ADDRESS
const deleteAddress = async (req, res) => {
    try {
        const deleteAddress = await Address.findByIdAndDelete(req.body.id)
        if (deleteAddress) {
            return res.redirect("/user/profile")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//SELECT ORDER ADDRESS
const selectAddress = async (req, res) => {
    const Id = req.session.user
    const addressId = req.body.addressId

    try {

        const existSelectAdd = await Address.updateMany({ User: Id }, { $unset: { in_use: '' } });
        const selectaddress = await Address.findByIdAndUpdate(addressId, { $set: { in_use: true } });
        
        if (selectaddress && existSelectAdd) {
            req.flash('success', 'Address selected successfully....');
            return res.redirect("/user/Checkout")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
module.exports = {
    loadAddAddressPage,
    deleteAddress,
    addUserAddress,
    editAddress,
    updateAddress,
    selectAddress
}