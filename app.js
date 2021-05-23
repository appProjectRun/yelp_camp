require("dotenv").config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    seedDB = require("./seeds");

app.locals.moment = require("moment");

var commentRoute = require("./routes/comments"),
    campgroundRoute = require("./routes/campgrounds"),
    indexRoute = require("./routes/index");

mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

app.use(require("express-session")({
    secret: "Pungpon is the cutest dog of our family.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function (req, res, next) {
    res.locals.currentUser = req.user;
    if (req.user) {
        try {
            let user = await User.findById(req.user._id).populate("notifications", null, { isRead: false }).exec();
            res.locals.notifications = user.notifications.reverse();
        } catch (err) {
            console.log("error message= " + err.message);
        }
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoute);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/comments", commentRoute);

app.listen(3000, function () {
    console.log("*********************Server Yelpcamp v13 nodemon has started*****************************");
});