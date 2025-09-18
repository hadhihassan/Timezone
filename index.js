const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const nocache = require("nocache");
const path = require("path");
const morgan = require("morgan");
const app = express();

const customerRoute = require("./Route/customerRoute");
const adminRoute = require("./Route/adminRoute");
const env = require("./config/env.config");
const connectDatabase = require('./config/db.config')

require("dotenv").config();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static("public"));


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use(flash());
app.use(nocache());
app.use(morgan('tiny'));



// Routes
app.use("/", customerRoute);
app.use("/admin", adminRoute);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('User/error', { error: err });
});

app.use((req, res) => {
    res.status(404).render("User/404", { message: "" });
});


// Start the server
app.listen(env.PORT, () => {
    connectDatabase()
    console.log(`Server is running on port => ${'http://localhost:' + env.PORT}`)
})
