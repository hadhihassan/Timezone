const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const nocache = require("nocache");
const morgan = require("morgan");
const path = require("path")

require("dotenv").config();

const app = express();
app.set("views", path.join(__dirname,"views"));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(morgan("dev"));
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
mongoose
    .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("DATABASE CONNECTED"))
    .catch(error => console.error("Error connecting to the database:", error));

// Start the server
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log("Server is running on port", PORT));


app.use((req, res) => {
    res.status(404).render("User/404",{message:""});
});
