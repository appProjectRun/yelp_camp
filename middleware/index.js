var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};
middlewareObj.checkCampgroundOwnerShip = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "do not found campground.");
                res.redirect("back");
            }
            else {
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    return next();
                }
                else {
                    req.flash("error", "you need permission to do that, from checkCampgroundOwnerShip function.");
                    res.redirect("back");
                }

            }
        });
    }
    else {
        req.flash("error", "you need to be logged in to do that from checkCamgroundOwnerShip function.");
        res.redirect("back");
    }

}

middlewareObj.checkCommentOwnerShip = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                console.log("can't find comment for check owner ship.");
                res.redirect("back");
            }
            else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    return next();
                } else {
                    req.flash("error", "you need permission to do that, from checkCommentOwnerShip function.");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error", "you need to be logged in to do that from checkCommentOwnerShip function.");
        res.redirect("back");
    }

}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "you should login first, from isLoggedIn function");
    res.redirect("/login");
}

module.exports = middlewareObj;