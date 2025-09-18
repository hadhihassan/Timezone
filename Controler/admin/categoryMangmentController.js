const productCategry = require("../../Models/productCategory")
const Product = require("../../Models/productModel")
const Offer = require("../../Models/offerModel")

//CREATE A CATEGORIES
const addProductCategory = async (req, res) => {
    const catename = req.body.Categoryname

    if (!req.body.Categoryname || !req.file) {

        req.flash('error', 'Fill all fields!.');
        return res.redirect("/admin/product/add-category")
    }

    const exist = await productCategry.find({ categoryName: catename })

    if (exist.length !== 0) {
    
        req.flash('error', 'This category allready exist.......');
        return res.redirect("/admin/product/add-category")
    }

    try {
        const category = new productCategry({
            categoryName: req.body.Categoryname,
            description: req.body.description,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        if (req.body.offer) {
            const offer = Offer.find(req.body.offer)
            if (offer.is_deleted === false) {
                category.offer = req.body.offer
            }
        }

        await category.save();
        res.redirect("/admin/product/Category-management")

    } catch (error) {
        req.flash('error', 'An error occurred while adding the category.');
        res.redirect("/admin/product/add-category");
    }
}
//LIST ALL THE CATEGORIES
const loadCategory = async (req, res) => {
    try {
        let a = "d"

        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        const currentPage = page;

        let search = req.query.search;

        let len;
        let Categores;
        let categoryName  

        len = await productCategry.countDocuments();

        if (search && search !== "") {
            // If a search query is provided, use it to filter categories
            categoryName = { $regex: new RegExp(search, 'i') };
            Categores = await productCategry.find({ categoryName: { $regex: search, $options: 'i' } })
                .sort({ _id: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate("offer");
            len = await productCategry.countDocuments({ categoryName: { $regex: search, $options: 'i' } });

        } else {
            // No search query, retrieve all categories
            Categores = await productCategry.find()
                .sort({ _id: -1 })
                .skip(skip)
                .limit(pageSize)
                .populate("offer");
        }

        res.render("admin/Category/index", { Categores, len, currentPage, search, a });

    } catch (error) {
        console.log(error.message);
    }
}
//SOFT DELETE
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params

        const deleteCategory = await productCategry.findByIdAndDelete({ _id: id })

        if (deleteCategory.offer) {
            await Product.updateMany({ category: id }, { $set: { categoryOfferPrice: 0 } })
        }

        if (deleteCategory) {
            res.redirect("/admin/product/Category-management")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//RENDER THE EDIT CATEGORY PAGE
const loadEditCategory = async (req, res) => {
    try {
        const { id } = req.params

        const offers = await Offer.find({ is_deleted: false })
        const EditCategory = await productCategry.findById({ _id: id }).populate("offer")

        if (EditCategory) {
            return res.render("admin/Category/edit", { EditCategory, message: "", id, offers, a: "" })
        }
    } catch (error) {

    }
}
// EDITING THE CATEGORY
const EditCategory = async (req, res) => {
    const id = req.query.id
    try {

        const editedCategory = await productCategry.findById(id);
        if (editedCategory) {

            editedCategory.categoryName = req.body.Categoryname
            editedCategory.description = req.body.description

            if (req.file) {
                editedCategory.image.data = req.file.buffer;
                editedCategory.image.contentType = req.file.mimetype;
            }

            if (req.body.offer === "Delete") {

                await Product.updateMany({ category: id }, { $set: { categoryOfferPrice: 0 } })
                await productCategry.findByIdAndUpdate(id, { $unset: { offer: {} } });
            } else if (req.body.offer !== undefined && req.body.offer.length > 10) {

                const offer = await Offer.findById(req.body.offer);

                if (offer.is_deleted === false) {

                    await productCategry.findByIdAndUpdate(id, { $set: { offer: req.body.offer } });
                    const products = await Product.find({ category: id });

                    for (let i = 0; i < products.length; i++) {
                        let discountPercentage = offer.discount;
                        let regularPrice = products[i].price;
                        let offerPrice = regularPrice - Math.floor((discountPercentage / 100) * regularPrice);
                        products[i].categoryOfferPrice = offerPrice;
                        await products[i].save();
                    }
                } else {

                    await productCategry.findByIdAndUpdate(id, { $unset: { offer: {} } });
                    const products = await Product.find({ category: id });

                    for (let i = 0; i < products.length; i++) {
                        products[i].categoryOfferPrice = 0;
                        await products[i].save();
                    }
                }
            }

            await editedCategory.save();
            return res.redirect("/admin/product/Category-management");
        } else {
            return res.status(404).send("Category not found.");
        }
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}
//RENDER THE ADD CATEGORY PAGE
const loadAddCategory = async (req, res) => {
    try {
        let a = "category"

        const offers = await Offer.find({ is_deleted: false })

        res.render('admin/Category/add', {
            message: '',
            offers: offers,
            a,
            error: req.flash("error"),
        });
    } catch (error) {
        console.log(error.message)
    }
}
//DELETE THE CATEGORY IMAGE
const deleteCategoryImg = async (req, res) => {
    try {
        const categoryId = req.params.id
        const category = await productCategry.findByIdAndUpdate(categoryId, { $unset: { image: {} } })

        return res.redirect(`/admin/Category/${categoryId}/Edit-Category`)
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    addProductCategory,
    loadCategory,
    deleteCategory,
    loadEditCategory,
    EditCategory,
    loadAddCategory,
    deleteCategoryImg
}