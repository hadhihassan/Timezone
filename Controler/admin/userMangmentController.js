const Customer = require('../../Models/customerModel')

//DSIPLAY ALL COUSTOMERS
const displayCustomers = async (req, res) => {
    try {
        // Show a loading alert while fetching data
        let a = "Customers"

        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        let users;
        let len;

        const query = req.query.query; // Get the search query from the request

        if (query) {
            // When there's a search query, use it to filter users
            // Use a regular expression to perform a case-insensitive search
            const nameRegex = new RegExp(query, 'i');
            users = await Customer.find({
                is_Admin: false,
                name: nameRegex,
            })
                .skip(skip)
                .limit(pageSize);

            // Get the count of filtered users
            len = await Customer.countDocuments({
                is_admin: false,
                name: nameRegex,
            });
        } else {
            // When there's no search query, retrieve all users
            users = await Customer.find({
                is_Admin: false,
            })
                .skip(skip)
                .limit(pageSize);

            // Get the count of all users
            len = await Customer.countDocuments({
                is_admin: false,
            });
        }

        // Close the loading alert once the data is fetched


        res.render("admin/user", {
            users,
            len,
            currentPage: page,
            query, // Pass the query back to the view for rendering
            a,
            userId: req.session.admin
        });
    } catch (error) {
        console.error(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." })
    }
}
//CUSTOMER UNBLOCKING
const UnblockTheUser = async (req, res) => {
    try {
        const { id } = req.query
        const userUpdated1 = await Customer.updateOne({ _id: id }, { $set: { is_block: false } });
        if (userUpdated1) {

            return res.redirect('/admin/Customers')
        }
    } catch (error) {
        console.log(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//CUSTOMER BLOCKING 
const blockTheUser = async (req, res) => {
    try {

        const { id } = req.query
        const userUpdated = await Customer.updateOne({ _id: id }, { $set: { is_block: true } })
        if (userUpdated) {
            return res.redirect('/admin/Customers')
        }
    } catch (error) {
        console.log(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}

module.exports =  {
    displayCustomers,
    UnblockTheUser,
    blockTheUser
}

