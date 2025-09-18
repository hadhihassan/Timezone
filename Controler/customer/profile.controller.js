const Customer = require('../../Models/customerModel')
const Address = require('../../Models/userAddress')
const sharp = require('sharp')
const upload = require('../../config/cloudinary')

//RENDER THE USER PROFILE 
const loadProfile = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
        const address = await Address.find({ User: req.session.user })

        if (user) {
            res.render('User/profile/userprofile', {
                user, address, success: req.flash("success"),
                error: req.flash("error"),
            })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//RENDER THE USER DETAILS PAGE
const loadEditPage = async (req, res) => {
    try {
        const id = req.body.id
        const user = await Customer.findById({ _id: id })
        if (user) {
            res.render("User/profile/editProfile", {
                user, success: req.flash("success"),
                error: req.flash("error"),
            })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//EDITED DATA UPDATING
const updateUser = async (req, res) => {
    const { name, mbn, email, gender, id } = req.body

    try {
        if (name || mbn || email || gender || id) {

            const user = await Customer.findById({ _id: id })

            if (user) {
                const updated = await Customer.findByIdAndUpdate({ _id: id }, { $set: { name: name, mobile: mbn, email: email, gender: gender } })

                if (updated) {
                    return res.redirect("/user/profile")
                }
            }
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//ADD USER PROFILE IMAGE  
const addImageProfile = async (req, res) => {

    const imageBuffer = req.file.buffer;

    try {
        const customer = await Customer.findById(req.session.user);

        if (customer) {

            const croppedImageBuffer = await sharp(imageBuffer)
                .resize(210, 330)  
                .toBuffer();

            customer.images = await upload(croppedImageBuffer);

            await customer.save();
        }
        res.redirect('/user/profile');
    } catch (error) {
        console.error(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
};
//DELETE THE USER PROFILE IMAGE
const deleteUserProfile = async (req, res) => {
    try {
        const id = req.query.id

        if (id) {
            await Customer.findByIdAndUpdate(id, { $unset: { images: {} } })
            return res.redirect("/user/profile")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//UPDATE USER PASSWORD
const userUpdatePassword = async (req, res) => {
    const { newpassword, oldpassword, confirmpassword, id } = req.body

    const user = await Customer.findById(id)

    try {
        if (newpassword || oldpassword || confirmpassword) {

            const validpassword = await bcrypt.compare(oldpassword, user.password)
            if (validpassword) {
                if (newpassword === confirmpassword) {
                    
                    const hashedPassword = await secrePassword(newpassword)
                    if (hashedPassword) {

                        const passwordupdated = await Customer.findByIdAndUpdate(id, { $set: { password: hashedPassword } })
                        res.redirect("/user/profile")
                    }
                } else {
                    return res.render('User/profile/editProfile', { user, messgae: "try again the confirm password is not matching ...." })
                }
            } else {
                return res.render("User/profile/editProfile", { user, message: "Enterd old password is miss match try again..." })
            }
        } else {
            return res.render("User/profile/editProfile", { user, message: "Fill the all field please.." })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}

module.exports = {
    loadProfile,
    loadEditPage,
    updateUser,
    deleteUserProfile,
    addImageProfile,
    userUpdatePassword
}