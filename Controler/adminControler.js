const express = require("express")
const bcrypt = require("bcrypt")
const Customer = require('../Models/customerModel')
const productCategry = require("../Models/productCategory")
const Product = require("../Models/productModel")
const Order = require("../Models/orderModel")
const Coupon = require("../Models/couponModel")
const sharp = require("sharp")

//ADMIN LOGIN
const loadAaminLogin = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            res.render("admin/adminLogin", { message: "" })
        } else {
            res.redirect("/admin/dashboard")
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loginValidation = async (req, res, next) => {
    try {

        const { email, password } = req.body

        if (email === "") { // Use '===' for equality comparison

            res.render("admin/adminLogin", { message: "Email is required" });

        } else if (password === "") { // Use '===' for equality comparison

            res.render("admin/adminLogin", { message: "Password is required" });

        } else {

            // Handle the case where both email and password are provided

            // You might want to continue processing the login here
            next()

        }
    } catch (error) {
        console.log(error.message);
    }
}
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
    }
}
const adminLogout = (req, res) => {
    try {
        if (req.session.admin) {
            req.session.destroy()
            return res.redirect("/admin/dashboard")

        }

    } catch (error) {
        console.log(error.message);
    }
}



//CUSTOMERS
const displayCustomers = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        const users = await Customer.find({
            is_varified: true,
            is_Admin: false,
        });
        const len = await Customer.find({
            is_admin: false,
            is_varified: true,
        })
        // .skip(skip)
        // .limit(pageSize);
        console.log(users, len);
        return res.render("admin/user", {
            users,
            len,
            currentPage: page,
        });

    } catch (error) {
        console.error(error.message);
    }
}
const UnblockTheUser = async (req, res) => {
    try {
        const { id } = req.query
        const userUpdated1 = await Customer.updateOne({ _id: id }, { $set: { is_block: false } });
        if (userUpdated1) {

            return res.redirect('/admin/Customers')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const blockTheUser = async (req, res) => {
    try {

        const { id } = req.query
        const userUpdated = await Customer.updateOne({ _id: id }, { $set: { is_block: true } })
        if (userUpdated) {
            return res.redirect('/admin/Customers')
        }
    } catch (error) {
        console.log(error.message);
    }
}



// CATEGORY
const addProductCategory = async (req, res) => {


    if (!req.body.Categoryname || !req.file) {
        return res.render("admin/addCategory", { message: "Fill all fields...." });
    }
    const exist = await productCategry.find({ categoryName: req.body.Categoryname })

    if (exist) {
        return res.render("admin/addCategory", { message: "Same category name not possible try another name please...." });
    }


    console.log("File uploaded successfully.");

    try {
        if (!exist) {
            const category = new productCategry({
                categoryName: req.body.Categoryname,
                // SubCategoryName: req.body.SubCategoryname,
                description: req.body.description,
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            });

            await category.save();
            // console.log("Category saved successfully.");
            res.redirect("/admin/product/Category-management")
        } else {
            res.render('admin/addCategory', { message: "this. category allready exist....." })
        }

    } catch (error) {
        console.error(error.message);
        // Handle any specific error handling or response here
    }
}
const loadCategory = async (req, res) => {
    let page = req.query.page
    const pageSize = 10

    try {
        page = parseInt(req.query.page) || 1;
        const skip = ((page - 1) * pageSize);
        const currentPage = page

        const len = await productCategry.find().sort({ _id: -1 })
        const Categores = await productCategry.find().sort({ _id: -1 }).skip(skip).limit(pageSize)

        res.render("admin/productCategory", { Categores, len, currentPage })

    } catch (error) {
        console.log(error.message);
    }
}
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        const deleteCategory = await productCategry.findByIdAndDelete({ _id: id })
        if (deleteCategory) {
            res.redirect("/admin/product/Category-management")
        }

    } catch (error) {
        console.log(error.message)
    }
}
const loadEditCategory = async (req, res) => {
    try {
        const { id } = req.params
        console.log(id + "HHHHHHHHHHHHHHHHHHHHHH")
        const EditCategory = await productCategry.findById({ _id: id })

        if (EditCategory) {
            return res.render("admin/editCategory", { EditCategory, message: "", id })
        }

    } catch (error) {

    }
}
const EditCategory = async (req, res) => {

    const id = req.query.id
    try {

        const editedCategory = await productCategry.findById(id);
        console.log(req.body)
        if (editedCategory) {
            // Update category data if provided
            editedCategory.categoryName = req.body.Categoryname
            editedCategory.description = req.body.description

            // Update image data if a new file is uploaded
            if (req.file) {
                editedCategory.image.data = req.file.buffer;
                editedCategory.image.contentType = req.file.mimetype;
            }

            await editedCategory.save();
            return res.redirect("/admin/product/Category-management");
        } else {
            return res.status(404).send("Category not found.");
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }
};
const loadAddCategory = (req, res) => {
    try {
        res.render('admin/addCategory', { message: '' })
    } catch (error) {
        console.log(error.message)
    }
}
const deleteCategoryImg = async (req, res) => {
    try {
        const categoryId = req.params.id
        const category = await productCategry.findByIdAndUpdate(categoryId, { $unset: { image: {} } })
        return res.redirect(`/admin/Category/${categoryId}/Edit-Category`)
    } catch (error) {
        console.log(error.message)
    }
}



// PRODUCT 
const loadProductCreate = async (req, res) => {
    try {
        const Categories = await productCategry.find()

        res.render("admin/addproduct", { message: "", Categories })
    } catch (error) {
        console.log(error.message);
    }
}
//add a product details into database
const createProduct = async (req, res) => {
    console.log("Product added successfully.");
    console.log(req.files);

    const { productName, manufacturerName, brandName, id_No, price, releaseDate, description, stockCount, category, inStock, outOfStock, images, tags, color, Metrial } = req.body;

    try {
        // Validate that required fields are provided
        if (!productName || !manufacturerName) {
            return res.render('admin/addproduct', { message: "All fields are required. Please fill in all fields." });
        }

        let stock = inStock ? true : false;

        // Create the product
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
            product_tags: tags,
            in_stock: stock,
            color: req.body.color,
            meterial: Metrial,
        });

        // Assuming req.files is an array of uploaded image files
        const croppedImages = await Promise.all(
            req.files.map(async (file, i) => {
                const filename = `-${Date.now()}test-${i + 1}.jpeg`;

                // Crop and process the image
                const croppedImageBuffer = await sharp(file.buffer)
                    .resize(540, 560) // Specify your desired dimensions here
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toBuffer();

                // Push the cropped image to the product's images array
                product.images.push({ data: croppedImageBuffer, contentType: 'image/jpeg' });

                return {
                    filename: filename,
                    buffer: croppedImageBuffer,
                };
            })
        );
        
        await product.save();

        if (product) {
            console.log("Product added successfully.");
            return res.redirect("/admin/product");
        }
    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, e.g., send an error response
        return res.status(500).send("Error creating the product.");
    }
};

// ...
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
                .limit(pageSize);
            len = await Product.find({ product_name: { $regex: query, $options: 'i' } });
        } else {
            // If no query, retrieve all products
            products = await Product.find().skip(skip).limit(pageSize);
            len = await Product.find();
        }

        if (products) {
            return res.render('admin/products', { products, len, currentPage, query });
        } else {
            console.log("Products not found");
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadProductEditPage = async (req, res) => {
    try {
        const id = req.params.id
        console.log("hai htre")
        const product = await Product.findOne({ _id: id })
        const Categories = await productCategry.find({ categoryName: { $ne: product.category } })

        res.render("admin/Edit", { message: "", product, id, Categories })



    } catch (error) {
        console.log(error.message);
    }
}
const editProduct = async (req, res) => {

    const { productName, manufacturerName, brandName, id_No, price, releaseDate, description, stockCount, category, inStock, outOfStock, images, tags, color, Metrial, id } = req.body;
    try {

        let stock
        if (inStock) {
            stock = true
        } else if (outOfStock) {
            stock = false
        } else {
            stock = true
        }

        // Assuming you have an existing product with its _id that you want to update
        const productId = id; // Replace with the actual product's _id

        // Define the fields you want to update
        const updateFields = {
            product_name: productName,
            manufacturer_name: manufacturerName,
            brand_name: brandName,
            idendification_no: id_No,
            price: req.body.price,
            relese_date: releaseDate,
            stock_count: stockCount,
            description: req.body.description,
            category: category,
            product_tags: tags,
            in_stock: stock,
            color: req.body.color,
            meterial: Metrial,
        };

        // Update only the specified fields using $set
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateFields },
            { new: true } // To get the updated document back
        );

        if (req.files) {
            req.files.forEach((file) => {
                updatedProduct.images.push({ data: file.buffer, contentType: file.mimetype });
            });
            await updatedProduct.save();
        }



        // const deleteprodct = await Product.deleteOne({ _id: id });
        if (updatedProduct) {
            console.log("Product edited successfully.");
            return res.redirect("/admin/product")
        }


    } catch (error) {
        console.log(error.message);
    }
}
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
}
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
}
const deleteImgDelete = async (req, res) => {
    const id = req.params.id
    const imageId = req.params.imageId
    console.log(id + "XXXX" + imageId);
    try {
        console.log("HADHI---------------------------------------------------------------------------- HASSAN")
        const deleteimg = await Product.findByIdAndUpdate(
            { _id: id },
            { $pull: { "images": { _id: imageId } } },
            { new: true }
        );

        // 650c7fbf086081c38a
        if (deleteimg) {

            // console.log(deleteimg)
            return res.redirect(`/admin/product/${req.params.id}/Edit`)
        }
    } catch (error) {
        console.log(error.message)
    }
}
const loadOrder = async (req, res) => {
    let page = req.query.page
    const pageSize = 10
    try {
        page = parseInt(req.query.page) || 1;
        const skip = ((page - 1) * pageSize);
        const currentPage = page

        const len = await Order.find()
        const orders = await Order.find()
            .skip(skip)
            .limit(pageSize)
            .populate("user")
            .populate("products.product")
            .populate("deliveryAddress")
            .exec();
        if (orders) {
            return res.render("admin/order", { orders, len, currentPage })

        }
        console.log("GOT ERROR")
    } catch (error) {
        consoel.log(error.message)
    }
}
const updateOrderStatus = async (req, res) => {
    const action = req.query.action;
    const orderId = req.query.orderId;
    try {
        const order = await Order.findByIdAndUpdate(
            { _id: orderId },
            { $set: { returnRequest: action } }
        );
        console.log(order);
        return res.redirect("/admin/orders");
    } catch (error) {
        console.error(error.message);
        // Handle the error appropriately (e.g., send an error response)
        res.status(500).send("Internal Server Error");
    }
};


//Coupon
const loadCouponPage = async (req, res) => {
    try {
        const allCoupon = await Coupon.find()
        return res.render("admin/coupon",{allCoupon})

    } catch (error) {
        console.log(error.message)
    }
}
const createCoupon = async (req, res) => {
    console.log(req.body)
    const { couponName, type, MinimumpurchaseAmount, amountOrPercentage, Description } = req.body;
    try {

        // Create a function to generate a unique coupon code
        function generateCouponCode() {
            const length = 6;
            const characters = '0123456789';
            let couponCode = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                couponCode += characters.charAt(randomIndex);
            }

            return couponCode;
        }

      
            const code = generateCouponCode();
            const CouponCode = new Coupon({
                coupon_name: couponName,
                description: Description,
                discount_type: type,
                minimumPurchaseAmount: MinimumpurchaseAmount,
                discount_amount_or_percentage: amountOrPercentage,
                code: code, // Assign the generated code to the 'code' property
            });

            if (CouponCode) {
                await CouponCode.save();
                console.log("coupon saved");
                return res.redirect("/admin/product/coupon-management");
            } else {
                console.log("not working");
            }
     
            return res.render("admin/addCoupon", { message: "Please fill in all fields...." });
        

    } catch (error) {
        // Handle the error appropriately
        console.error(error);
        // Return an error response if necessary
        return res.status(500).send("Error creating the coupon.");
    }
};

module.exports = {
    loadAaminLogin, loginValidation, adminValid, adminLogout, displayCustomers,
    UnblockTheUser, blockTheUser, addProductCategory, loadCategory, deleteCategory, loadAddCategory, loadProductCreate,
    createProduct, loadProductPage, editProduct, loadProductEditPage, productDeactivate, productActivate, deleteImgDelete,
    loadOrder, updateOrderStatus, loadEditCategory, EditCategory, deleteCategoryImg, loadCouponPage, createCoupon,
}