const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");

const OAuthRedirect = require('../config').OAuthRedirect;

const jwt = require("jsonwebtoken");

require("dotenv").config();

// OAuth Authentication, Just going to this URL will open OAuth screens
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Oauth user data comes to these redirectURLs
router.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    async (req, res) => {
        try {
            const user = await User.findOne({ googleId: req.user.googleId });

            if (user) {
                const token = jwt.sign(
                    { _id: user._id },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "30m",
                    }
                );

                res.cookie("jwt", token);
                res.redirect(require('../config').buildRedirectPathClient(OAuthRedirect));
            } else {
                res.status(400);
            }
        } catch (err) {
            console.error(err);
            res.status(404);
        }
    }
);

module.exports = router;
