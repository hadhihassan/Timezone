const productCategry = require("../../Models/productCategory")
const Product = require("../../Models/productModel")
const Offer = require("../../Models/offerModel")
const sharp = require("sharp")



//**PRODUCT MANAGEMENT**//


// RENDER THE PRODUCT CREATE PAGE
const loadProductCreate = async (req, res) => {
    try {
        const Categories = await productCategry.find()
        const offers = await Offer.find({ is_deleted: false })


        res.render("admin/Product/addproduct", { message: "", Categories, offers, error: req.flash("error"), a: "" });

    } catch (error) {
        console.log(error.message);
    }
}//ADD THE NEW PRODUCT INTO THE DATABASE
const createProduct = async (req, res) => {



    const { productName, manufacturerName, brandName, id_No, price,
        offer, releaseDate, stockCount, description, category, tags,
        inStock, outOfStock, images, color, Metrial } = req.body;
    try {
        if (!productName || !manufacturerName) {
            req.flash('error', 'All fields are required. Please fill in all fields....');
            return res.redirect("/admin/product/create")
        }
        let stock
        if (req.body.inStock == "inStock") {
            stock = true
        } else if (req.body.inStock == "outOfStock") {
            stock = false
        }
        const product = new Product({
            product_name: productName,
            manufacturer_name: manufacturerName,
            brand_name: brandName,
            idendification_no: id_No,
            price: req.body.price,
            relese_date: releaseDate,
            stock_count: stockCount,
            description: req.body.description,
            category: category,
            in_stock: stock,
            color: req.body.color,
            meterial: Metrial,
        });
        const croppedImages = await Promise.all(
            req.files.map(async (file, i) => {
                const filename = `-${Date.now()}test-${i + 1}.jpeg`;
                const croppedImageBuffer = await sharp(file.buffer)
                    .resize(540, 560)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toBuffer();
                product.images.push({ data: croppedImageBuffer, contentType: 'image/jpeg' });
                return {
                    filename: filename,
                    buffer: croppedImageBuffer,
                };
            })
        );
        if (req.body.offer) {
            product.offer = req.body.offer
            const offerm = await Offer.findById(req.body.offer)
            if (offerm.is_deleted === false) {
                const regularPrice = req.body.price
                const newprice = regularPrice - Math.floor((offerm.discount / 100) * regularPrice)
                product.offerPrice = newprice
            } else {
                product.offerPrice = 0
            }


        }


        const CategoryOffer = await productCategry.findById(category)

        if (CategoryOffer.offer) {
            const offerm = await Offer.findById(CategoryOffer.offer)
            if (offerm.is_deleted === false) {
                const dicountPercenatge = offerm.discount
                const regularPrice = req.body.price
                const newprice = regularPrice - Math.floor((dicountPercenatge / 100) * regularPrice)
                product.categoryOfferPrice = newprice
            } else {
                product.categoryOfferPrice = 0
            }
        }

        await product.save();
        return res.redirect("/admin/product");
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Error creating the product.");
    }
}//LIST THE ALL PRODUCT 
const loadProductPage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const skip = ((page - 1) * pageSize);
    const currentPage = page;
    const query = req.query.query || ''; // Get the search query from the request

    try {
        let products;
        let len;

        if (query) {
            // If there's a query, filter products by name using regex
            products = await Product.find({ product_name: { $regex: query, $options: 'i' } })
                .skip(skip)
                .limit(pageSize)
                .populate("offer")
                .populate("category")
            len = await Product.find({ product_name: { $regex: query, $options: 'i' } });
        } else {
            // If no query, retrieve all products
            products = await Product.find()
                .skip(skip)
                .limit(pageSize)
                .populate("offer")
                .populate("category")
            len = await Product.find();
        }

        if (products) {
            return res.render('admin/Product/products', { products, len, currentPage, query, a: "" });
        } else {
            console.log("Products not found");
        }
    } catch (error) {
        console.log(error.message);
    }
}//RENDER THE PRODUCT EDIT PAGE
const loadProductEditPage = async (req, res) => {
    try {
        const id = req.params.id
        const pro = await Product.findOne({ _id: id })
        let product
        if (pro.offer) {
            product = await Product.findOne({ _id: id }).populate("offer").populate("category")
        } else {
            product = await Product.findOne({ _id: id }).populate("category")
        }

        const Categories = await productCategry.find({ categoryName: { $ne: pro.category } }).populate("offer")
        const offers = await Offer.find({ is_deleted: false })
        res.render("admin/Product/Edit", { message: "", product, id, Categories, offers, a: "" })

    } catch (error) {
        console.log(error.message);
    }
}//EDITING THE PRODUCT DETAILS
const editProduct = async (req, res) => {

    const { productName, manufacturerName, brandName, id_No,
        price, releaseDate, description, stockCount, category
        , outOfStock, images, tags, color, Metrial, id, offer } = req.body;
    try {
        console.log(req.body);
        let stock
        if (req.body.inStock == "inStock") {
            stock = true
        } else if (req.body.inStock == "outOfStock") {
            stock = false
        }

        const productId = id;
        const updateFields = {
            product_name: productName,
            manufacturer_name: manufacturerName,
            brand_name: brandName,
            idendification_no: id_No,
            price: req.body.price,
            relese_date: releaseDate,
            stock_count: stockCount,
            description: req.body.description,
            product_tags: tags,
            in_stock: stock,
            color: req.body.color,
            meterial: Metrial,
        };
        if (req.body.category && req.body.category !== "" && req.body.category.length > 10) {
            const CategoresOffer = await productCategry.findById(req.body.category)
            if (CategoresOffer.offer) {
                const caOffer = await Offer.findById(CategoresOffer.offer)
                if (caOffer.is_deleted === false) {
                    updateFields.category = req.body.category
                    updateFields.categoryOfferPrice = req.body.price - Math.floor((caOffer.discount / 100) * req.body.price);
                }
            } else {
                updateFields.categoryOfferPrice = 0
                updateFields.category = req.body.category
            }
        }
        if (req.body.offer && req.body.offer.length > 10) {
            updateFields.offer = req.body.offer
            const proOffer = await Offer.findById(req.body.offer)
            if (proOffer.is_deleted === false) {
                updateFields.offerPrice = req.body.price - Math.floor((proOffer.discount / 100) * req.body.price)
            }
        }
        if (req.body.offer === "Delete") {
            await Product.findByIdAndUpdate(productId, {
                $unset: { offer: 1 }, // Unset the 'offer' field
                $set: { offerPrice: 0 } // Set the 'offerPrice' field to 0
            });
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateFields },
            { new: true } // To get the updated document back
        );
        if (req.files) {
            const croppedImages = await Promise.all(
                req.files.map(async (file, i) => {
                    const filename = `-${Date.now()}test-${i + 1}.jpeg`;
                    const croppedImageBuffer = await sharp(file.buffer)
                        .resize(540, 560)
                        .toFormat('jpeg')
                        .jpeg({ quality: 90 })
                        .toBuffer();
                    updatedProduct.images.push({ data: croppedImageBuffer, contentType: 'image/jpeg' });
                    return {
                        filename: filename,
                        buffer: croppedImageBuffer,
                    };
                })
            );
            await updatedProduct.save();
        }

        if (updatedProduct) {
            console.log("Product edited successfully.");
            return res.redirect("/admin/product")
        }
    } catch (error) {
        console.log(error.message);
    }
}//PRODUCT SOFT DELETING 
const productDeactivate = async (req, res) => {
    try {

        const id = req.params.id
        const change = await Product.updateOne({ _id: id }, { $set: { is_delete: true } })

        if (change) {

            return res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message);
    }
}//ACTIVE THE PRODUCT
const productActivate = async (req, res) => {
    try {
        const id = req.params.id
        const change = await Product.updateOne({ _id: id }, { $set: { is_delete: false } })
        if (change) {
            return res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message);
    }
}//DELETE PREVEIW IMAGES 
const deleteImgDelete = async (req, res) => {
    const id = req.params.id
    const imageId = req.params.imageId
    try {
        const deleteimg = await Product.findByIdAndUpdate(
            { _id: id },
            { $pull: { "images": { _id: imageId } } },
            { new: true }
        );

        if (deleteimg) {

            return res.redirect(`/admin/product/${req.params.id}/Edit`)
        }
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    loadProductCreate,
    createProduct, loadProductPage, editProduct, loadProductEditPage, productDeactivate, productActivate, deleteImgDelete,
}
