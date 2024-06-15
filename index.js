    const express = require("express");
    const mongoose = require("mongoose");
    const session = require("express-session");
    const flash = require("connect-flash");
    const cookieParser = require("cookie-parser");
    const nocache = require("nocache");
    const path = require("path");
    const app = express();


    require("dotenv").config();



    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ limit: '100mb', extended: true }));
    app.use(cookieParser());
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    }));
    app.use(express.static("public"));

    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");

    app.use(flash());
    app.use(nocache());

    // Routes
    const customerRoute = require("./Route/customerRoute");
    const adminRoute = require("./Route/adminRoute");
    app.use("/", customerRoute);
    app.use("/admin", adminRoute);



    // Database connection
    const url = `mongodb+srv://timezone_admin:timezone_admin@cluster0.a2fqu5o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    let isConnected = false;

    async function connectToDatabase() {
        if (!isConnected) {
            try {
                await mongoose.connect(url, connectionParams);
                isConnected = true;
                console.log('Connected to database');
            } catch (err) {
                console.error(`Error connecting to the database. \n${err}`);
            }
        }
    }
    connectToDatabase()
    // Start the server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log("Server is running on port", PORT));

    app.use((req, res) => {
        res.status(404).render("User/404", { message: "" });
    });
