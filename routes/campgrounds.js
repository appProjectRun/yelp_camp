const { response } = require("express");

var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    User = require("../models/user"),
    Notification = require("../models/notification"),
    middleware = require("../middleware"),
    NodeGeocoder = require('node-geocoder'),
    multer = require("multer"),
    storage = multer.diskStorage({
        filename: function (req, file, callback) {
            callback(null, Date.now() + file.originalname);
        }
    }),
    imageFilter = function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
    },
    upload = multer({ storage: storage, fileFilter: imageFilter }),
    cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "yelpcamp-wish",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

router.get("/", function (req, res) {
    // show fuzzy search campground.
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ name: regex }, function (err, foundCampground) {
            if (err)
                console.log("something went wrong")
            else {
                //can't find campgrounds tell something that informs user.                
                if (foundCampground.length < 1)
                    noMatch = "Can't find any Campgrounds.";
                //found campgrounds                 
                res.render("campground/index", { campgrounds: foundCampground, noMatch: noMatch });
            }
        });
    }
    else {
        //just see all campground
        // show allcampgrounds from dB
        Campground.find({}, function (err, allCampgrounds) {
            if (err)
                console.log("something went wrong");
            else
                res.render("campground/index", { campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch });
        });
    }


});

// router.post("/", middleware.isLoggedIn, function (req, res) {
//     // get data from the form and put into campgrounds dbs.
//     var name = req.body.name;
//     var price = req.body.price;
//     var image = req.body.image;
//     var desc = req.body.description;
//     var newCampground = { name: name, price: price, image: image, description: desc };
//     newCampground.author = { id: req.user, username: req.user.username };
//     Campground.create(newCampground, function (err, campgrounds) {
//         if (err)
//             console.log("Something went wrong.")
//         else {
//             req.flash("success", "create campground success.");
//             res.redirect("/campgrounds");
//         }
//     });
// })

// CREATE - add new campground to DB
// router.post("/", middleware.isLoggedIn, function (req, res) {
//     // get data from form and add to campgrounds array
//     // var name = req.body.name;
//     // var price = req.body.price;
//     // var image = req.body.image;
//     // var desc = req.body.description;
//     var campground = req.body.campground;
//     var authors = {
//         id: req.user._id,
//         username: req.user.username
//     }
//     campground.author=authors;
//     geocoder.geocode(req.body.campground.location, function (err, data) {
//         if (err || !data.length) {
//             req.flash('error', 'Invalid address');
//             return res.redirect('back');
//         }
//         campground.lat = data[0].latitude;
//         campground.lng = data[0].longitude;
//         campground.location = data[0].formattedAddress;
//         // var newCampground = { name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng };
//         // Create a new campground and save to DB

//         Campground.create(campground, function (err, newlyCreated) {
//             if (err) {
//                 console.log("Something went wrong.")
//             } else {
//                 //redirect back to campgrounds page
//                 req.flash("success", "create campground success.");
//                 res.redirect("/campgrounds");
//             }
//         });
//     });
// });

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), async function (req, res) {

    try {
        let result = await cloudinary.uploader.upload(req.file.path);
        req.body.campground.image = result.secure_url;
        req.body.campground.imageID = result.public_id;
        req.body.campground.author =
        {
            id: req.user._id,
            username: req.user.username
        }
        data = await geocoder.geocode(req.body.campground.location);
        if(!data.length) {
            // if invalid address will return undefied.
            req.flash("error", "Invalid address location.");
            return res.redirect("back");
        } else {
            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng = data[0].longitude;
            req.body.campground.location = data[0].formattedAddress;
            req.flash("success", "location found");            
        }
        let campground = await Campground.create(req.body.campground);
        let newNotification = {username: req.user.username, campgroundId:campground._id};
        let user = await User.findById(req.user._id).populate("followers").exec(); 
        //user for instead of forEach          
        for (const eachFollower of user.followers) {
           eachFollower.notifications.push(await Notification.create(newNotification));
           eachFollower.save();
        }
        req.flash("success", "create campground success.");
        res.redirect("/campgrounds/"+campground._id);
        
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("back");
    }

             
                    // Notification.create({ username: req.user.username, campgroundId: campground._id }, function (err, newNotification) {
                        
                    //         req.user.followers.forEach(function (eachFollower) {
                    //             // console.log("eachFollower id = "+eachFollower);
                    //             User.findById(eachFollower, function (err, foundUser) {
                    //                 if (err) {
                    //                     req.flash("error", err.message);
                    //                     return res.redirect("back");
                    //                 } else {
                    //                     foundUser.notifications.push(newNotification);
                    //                     foundUser.save();
                    //                     // console.log("save notification for user= " + foundUser)
                    //                 }
                    //             });
                    //         });
                    //         res.redirect('/campgrounds/' + campground.id);
                    //     }
                    // });
               
});

router.get("/new", middleware.isLoggedIn, function (req, res) {
    // create form for the new campgrounds.
    res.render("campground/new");
})

router.get("/:id", function (req, res) {
    var campground_id = req.params.id;
    Campground.findById(campground_id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else
            res.render("campground/show", { campground: foundCampground });
    });
});

router.get("/:id/edit", middleware.checkCampgroundOwnerShip, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render("campground/edit", { campground: foundCampground });
    });
});


// router.put("/:id", middleware.checkCampgroundOwnerShip, function (req, res) {
//     Campground.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updateCamground) {
//         if (err) {
//             console.log("updateCampground err");
//             res.redirect("/campgrounds");
//         }

//         else {
//             req.flash("success", " edit campground success.");
//             res.redirect("/campgrounds/" + req.params.id);
//         }
//     });
// });

// // UPDATE CAMPGROUND ROUTE
// router.put("/:id", middleware.checkCampgroundOwnerShip, function (req, res) {
//     geocoder.geocode(req.body.location, function (err, data) {
//         if (err || !data.length) {
//             req.flash('error', 'Invalid address');
//             return res.redirect('back');
//         }
//         req.body.blog.lat = data[0].latitude;
//         req.body.blog.lng = data[0].longitude;
//         req.body.blog.location = data[0].formattedAddress;

//         Campground.findByIdAndUpdate(req.params.id, req.body.blog, function (err, campground) {
//             if (err) {
//                 req.flash("error", err.message);
//                 res.redirect("back");
//             } else {
//                 req.flash("success", "Successfully Updated!");
//                 res.redirect("/campgrounds/" + req.params.id);
//             }
//         });
//     });
// });


// // UPDATE CAMPGROUND BY Clodinary
// router.put("/:id", middleware.checkCampgroundOwnerShip, upload.single("image"), function (req, res) {
//     Campground.findById(req.params.id, function (err, foundCampground) {
//         if (err) {
//             req.flash("error", "Can't find campground to update.");
//             return res.redirect("back");
//         } else {
//             if (req.file) {
//                 cloudinary.uploader.destroy(foundCampground.imageID, function (err, resultDestroy) {
//                     if (err) {
//                         req.flash("error", "Can't remove image");
//                         return res.redirect("back");
//                     } else {
//                         cloudinary.uploader.upload(req.file.path, function (err, result) {
//                             if (err) {
//                                 req.flash("error", "Can't uploade image for update.");
//                                 return res.redirect("back");
//                             } else {
//                                 req.body.campground.image = result.secure_url;
//                                 req.body.campground.imageID = result.public_id;
//                                 geocoder.geocode(req.body.campground.location, function (err, data) {
//                                     if (err || !data.length) {
//                                         req.flash("error", "Invalid address location.");
//                                         return res.redirect("back");
//                                     } else {
//                                         req.body.campground.lat = data[0].latitude;
//                                         req.body.campground.lng = data[0].longitude;
//                                         req.body.campground.location = data[0].formattedAddress;
//                                         req.flash("success", "location found");
//                                         Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campground) {
//                                             if (err) {
//                                                 req.flash("error", err.message);
//                                                 res.redirect("back");
//                                             } else {
//                                                 req.flash("success", "Successfully updated");
//                                                 res.redirect("/campgrounds/" + req.params.id);
//                                             }
//                                         });
//                                     }
//                                 });
//                             }
//                         });
//                     }
//                 });
//             }
//         }
//     });
// });

// UPDATE CAMPGROUND BY Clodinary with async await method
router.put("/:id", middleware.checkCampgroundOwnerShip, upload.single("image"), async function (req, res) {

    try {
        var foundCampground = await Campground.findById(req.params.id);
        if (req.file) {
            await cloudinary.uploader.destroy(foundCampground.imageID);
            var result = await cloudinary.uploader.upload(req.file.path);
            req.body.campground.image = result.secure_url;
            req.body.campground.imageID = result.public_id;
        }
        await geocoder.geocode(req.body.campground.location, function (err, data) {
            if (err || !data) {
                req.flash("error", "Can't update locations.");
                return res.redirect("back");
            } else {
                req.body.campground.lat = data[0].latitude;
                req.body.campground.lng = data[0].longitude;
                req.body.campground.location = data[0].formattedAddress;
            }
        });
        await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
        res.redirect("/campgrounds/" + req.params.id);
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("back");
    }

});


// router.delete("/:id", middleware.checkCampgroundOwnerShip, function (req, res) {
//     Campground.findByIdAndRemove(req.params.id, function (err) {
//         if (err)
//             console.log("can't remove campground.")
//         else {
//             req.flash("success", "remove campground success");
//             res.redirect("/campgrounds");
//         }
//     });
// });

//Delete campground with cloudinary.
router.delete("/:id", middleware.checkCampgroundOwnerShip, async function (req, res) {
    try {
        var foundCampground = await Campground.findByIdAndRemove(req.params.id);
        await cloudinary.uploader.destroy(foundCampground.imageID);
        req.flash("success", "Delete campground and clodinary image success.");
        res.redirect("/campgrounds");
    } catch (error) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports = router;