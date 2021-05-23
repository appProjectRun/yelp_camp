const { isLoggedIn } = require("../middleware");

var express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  User = require("../models/user"),
  Campground = require("../models/campground"),
  async = require("async"),
  nodemailer = require("nodemailer"),
  crypto = require("crypto"),
  Notification = require("../models/notification");


router.get("/", function (req, res) {
  res.render("landing");
});

router.get("/register", function (req, res) {
  res.render("register", { page: 'register' });
});

router.post("/register", function (req, res) {
  var newUser = new User(
    {
      username: req.body.username,
      avatar: req.body.avatar,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
  if (req.body.adminCode === "secretcode123") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function () {
      req.flash("success", "register success " + user.username);
      res.redirect("/campgrounds");
    });
  });
});

// login form
router.get("/login", function (req, res) {
  res.render("login", { page: 'login' });
});

// login handling
router.post("/login", passport.authenticate("local", {
  successRedirect: "/campgrounds",
  failureRedirect: "/login"
}), function (req, res) {
});

// logout
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "you logged out success.");
  res.redirect("/campgrounds");
});

// router.get("/user/:id", function (req, res) {
//     User.findById(req.params.id, function (err, foundUser) {
//         if (err) {
//             req.flash("error", "Can't find user profile.");
//             res.redirect("back");
//         } else {
//             Campground.find().where("author.id").equals(foundUser._id).exec(function (err, foundCampground) {
//                 if (err) {
//                     req.flash("error", "Can't find user's campground.");
//                     res.redirect("back");
//                 }
//                 else {
//                     res.render("user/show", { user: foundUser, campground: foundCampground });
//                 }
//             });
//         }
//     });
// });

//USER NOTIFICATION
router.get("/user/:id", async function (req, res) {
  try {
    let foundUser = await User.findById(req.params.id).populate("followers").exec();
    let foundCampground = await Campground.find().where("author.id").equals(foundUser._id).exec();
    res.render("user/show", { user: foundUser, campground: foundCampground });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("back");
  }
});

//FOLLOW USER
router.get("/follow/:id", isLoggedIn, async function (req, res) {
  try {
    let followed = false;
    let foundUser = await User.findById(req.params.id).populate("followers").exec();
    if (foundUser._id.equals(req.user._id)) {
      req.flash("error", "You can't follow your self.");
      return res.redirect("back");
    }
    await foundUser.followers.forEach(function (eachFoundUser) {
      if (eachFoundUser._id.equals(req.user._id)) {
        followed = true;
      }
    });
    if (!followed) {
      foundUser.followers.push(req.user._id);
      foundUser.save();
      req.flash("success", "Successfully followed " + foundUser.username);
      res.redirect("/user/" + req.params.id);
    } else {
      req.flash("error", "You have followed already.")
      res.redirect("back");
    }
  } catch (err) {
    req.flash("error", err.message)
    res.redirect("back");
  }
});

//VIEW ALL NOTIFICATIONS
router.get("/notifications", isLoggedIn, async function (req, res) {
  try {
    let user = await User.findById(req.user._id).populate(
      {
        path: "notifications",
        options: {sort: { "_id": -1 } }
      }).exec();
    let allNotifications = user.notifications;
    res.render("notification/index", { allNotifications });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

//HANDLE NOTIFICATION
router.get("/notifications/:id", isLoggedIn, async function (req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/campgrounds/${notification.campgroundId}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

router.get("/forgot", function (req, res) {
  res.render("forgot");
});

// forgot password
router.get('/forgot', function (req, res) {
  res.render('forgot');
});

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'jacksingchue@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'jacksingchue@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function (req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', { token: req.params.token });
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
              req.logIn(user, function (err) {
                done(err, user);
              });
            });
          })
        } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect('back');
        }
      });
    },
    function (user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'jacksingchue@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'jacksingchue@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function (err) {
    res.redirect('/campgrounds');
  });
});

module.exports = router;
