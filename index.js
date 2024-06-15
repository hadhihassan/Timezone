const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const nocache = require("nocache");
const morgan = require("morgan");
const path = require("path");
const Customer = require('./Models/customerModel')
require("dotenv").config();
const app = express();

app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(flash());
app.use(nocache());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.set("view engine", "ejs");
app.use(express.static("public"));

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

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    console.log('Connecting to database...');
    try {
        const db = await mongoose.connect(url, connectionParams);
        cachedDb = db;
        console.log('Connected to database');
        return db;
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}

connectToDatabase()
// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server is running on port", PORT));

app.use((req, res) => {
    res.status(404).render("User/404", { message: "" });
});
