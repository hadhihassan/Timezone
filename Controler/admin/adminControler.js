const bcrypt = require("bcrypt")
const Customer = require('../../Models/customerModel')

//RENDER ADMIN LOGIN
const loadAaminLogin = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            res.render("admin/adminLogin", { message: "" })
        } else {
            res.redirect("/admin/dashboard")
        }
    } catch (error) {
        console.log(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//lOGIN VALIDATION
const loginValidation = async (req, res, next) => {
    try {

        const { email, password } = req.body

        if (email === "") { // Use '===' for equality comparison

            res.render("admin/adminLogin", { message: "Email is required" });

        } else if (password === "") { // Use '===' for equality comparison

            res.render("admin/adminLogin", { message: "Password is required" });

        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//IF CHECK THE ADMIN IS VALID THEN GIVE ACCCESS  
const adminValid = async (req, res) => {
    try {
        const { email, password } = req.body
        const validEmail = await Customer.findOne({ email })

        if (!validEmail || validEmail === "undefined" || validEmail === null || validEmail === "") {

            return res.render("admin/adminLogin", { message: "email is not valid" })

        } else if (!/^\S+@\S+\.\S+$/.test(email) || email === "") {
            res.render("admin/adminLogin", { message: "Invalid Email " })
        } else {

            const dpassword = validEmail.password
            const matchPassword = await bcrypt.compare(password, dpassword)


            if (!matchPassword) {
                res.render("admin/adminLogin", { message: "passowrd is miss match" })
            } else {
                if (validEmail.is_Admin === true) {
                    req.session.admin = validEmail._id
                    res.redirect("/admin/dashboard")
                } else {
                    res.render("admin/adminLogin", { message: "Your are not the admin" })
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//ADMIN LOGOUT
const adminLogout = (req, res) => {
    try {
        if (req.session.admin) {
            req.session.destroy()
            return res.redirect("/admin/dashboard")

        }

    } catch (error) {
        console.log(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });

    }
}

module.exports = {
    loadAaminLogin, loginValidation, adminValid, adminLogout, 
 
}