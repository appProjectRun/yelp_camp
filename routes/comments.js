var express = require("express"),
    router = express.Router({ mergeParams: true }),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");


router.get("/new", middleware.isLoggedIn, function (req, res) {
    var campground_id = req.params.id;
    Campground.findById(campground_id, function (err, campground) {
        if (err)
            console.log("something went wrong, can't findById");
        else {
            res.render("comment/new", { campground: campground });
        }
    });
});

router.post("/", middleware.isLoggedIn, function (req, res) {
    var comment_text = req.body.comment.text;
    var camground_id = req.params.id;
    var comment_user = { id: req.user, username: req.user.username };
    Comment.create({
        text: comment_text,
        author: comment_user
    },
        function (err, comment) {
            if (err)
                console.log("create comment err");
            else {
                Campground.findById(camground_id, function (err, campground) {
                    if (err)
                        console.log("input comment problem");
                    else {
                        campground.comments.push(comment);
                        campground.save();
                        req.flash("success", "create comment success.");
                        res.redirect("/campgrounds/" + camground_id);
                    }
                });
            }
        }
    );
});

router.get("/:comment_id/edit", middleware.checkCommentOwnerShip, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            console.log("edit comment error");
            res.redirect("back");
        }
        else
            res.render("comment/edit", { comment: foundComment, campground_id: req.params.id });
    });
});

router.put("/:comment_id", middleware.checkCommentOwnerShip, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, foundComment) {
        if (err) {
            console.log("update comment error.");
            res.redirect("back");
        }
        else {
            req.flash("success", "edit comment success.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

router.delete("/:comment_id", middleware.checkCommentOwnerShip, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            console.log("can't remove comment.");
            res.redirect("back");
        } else {
            req.flash("success", "delete comment success.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;