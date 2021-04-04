const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const User = mongoose.model("User");
const Code = mongoose.model("Code");
const Event = mongoose.model("Event");

const jwt = require("../createToken");

const verify = require("../middleware/authToken").auth;
const checkIfVerified = require("../middleware/authToken").checkIfVerified;

const {
    registrationValidation,
    loginValidation,
    updateUserValidation,
} = require("../validation");

const argon2 = require("argon2");

const config = require("../config");

const sendVerificationEmail = require("./email").SendVerificationEmail;
const sendPasswordResetEmail = require("./email").SendPasswordResetEmail;

require("dotenv").config();

// login API
router.post("/login", async (req, res, next) => {
    // incoming: email, password
    // outgoing: token

    const { email, password } = req.body;

    try {
        // validate login information
        const value = await loginValidation({
            email: email,
            password: password,
        });

        // check if email exists
        const user = await User.findOne({ email: email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "Email/Password combination is incorrect",
            });
        }

        // check password against hash in db
        if (await argon2.verify(user.password, password)) {
            // create token
            const token = jwt.createToken({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                isVerified: user.isVerified,
            });

            //.header(HEADER, TOKEN_PREFIX + token)
            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
                token: token,
            });
        } else {
            res.json({ success: false, error: "Incorrect Password" });
        }
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            res.status(400).json({
                success: false,
                error: err.details[0].message,
            });
        } else {
            // other error(s)
            console.log(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ success: false, error: err });
        }
    }
});

router.post("/register", async (req, res, next) => {
    const { firstName, lastName, email, password, repeat_password } = req.body;

    try {
        // validate register information
        const value = await registrationValidation({
            lastName: firstName,
            firstName: lastName,
            email: email,
            password: password,
            repeat_password: repeat_password,
        });

        const user = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
        });

        // save user to db and return json
        const savedUser = await user.save();

        // create token
        const token = jwt.createToken({
            _id: savedUser._id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            isVerified: savedUser.isVerified,
        });

        const baseUrl = req.protocol + "://" + req.get("host");
        await sendVerificationEmail(baseUrl, savedUser);

        res.status(201).json({
            _id: savedUser._id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            token: token,
        });
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            console.error({ error: err.details[0].message });
            res.status(400).json({ error: err.details[0].message });
        } else if (err.message.localeCompare(config.email_exists_err)) {
            res.status(400).json({ error: err.message });
        } else if (err.message.localeCompare(config.db_err)) {
            res.status(500).json({ error: err.message });
        } else {
            // other error(s)
            console.error(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ error: err });
        }
    }
});

router.patch("/update", verify, checkIfVerified, async (req, res) => {
    let entries = Object.keys(req.body);
    let updates = {};

    // constructing dynamic query
    for (let i = 0; i < entries.length; i++) {
        updates[entries[i]] = Object.values(req.body)[i];
    }

    try {
        // validate update information
        const value = await updateUserValidation(updates);

        if (updates.password) {
            updates.password = await argon2.hash(updates.password);
        }

        const updatedUser = await User.findByIdAndUpdate(
            { _id: req.user._id },
            { $set: updates },
            { useFindAndModify: false }
        );

        // if (updatedUser == null) return res.status(500).json({error: 'email change failed'});

        const _updatedUser = await User.findById(req.user._id).select("-__v");

        // refreshing token
        const token = jwt.refresh(req.token);

        // _updatedUser._doc.token = token;

        // sending result to client side application
        res.status(200).json(_updatedUser);
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            res.status(400).json({ error: err.details[0].message });
        } else if (err.message.localeCompare(config.email_exists_err)) {
            res.status(400).json({ error: err.message });
        } else if (err.message.localeCompare(config.db_err)) {
            res.status(500).json({ error: err.message });
        } else {
            // other error(s)
            console.log(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ error: err });
        }
    }
});

// #route:  GET api/user/verification/get-activation-email
// #desc:   Send verification email to registered users email address
router.get("/verification/get-activation-email", verify, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(400).json({ error: "User not found" });
        } else {
            await Code.deleteMany({ email: user.email });

            const baseUrl = req.protocol + "://" + req.get("host");
            await sendVerificationEmail(baseUrl, user);

            res.status(200).json({ success: true });
        }
    } catch (err) {
        console.log("Error on /api/user/get-activation-email: ", err);
        res.status(500).json({ success: false });
    }
});

// #route:  GET /verification/verify-account
// #desc:   Verify user's email address
router.get(
    "/verification/verify-account/:userId/:secretCode",
    async (req, res) => {
        try {
            const user = await User.findById(req.params.userId);
            const response = await Code.findOne({
                email: user.email,
                code: req.params.secretCode,
            });

            if (!user) {
                res.sendStatus(401);
            } else {
                await User.updateOne(
                    { email: user.email },
                    { isVerified: true }
                );

                await Code.deleteMany({ email: user.email });
                /*await Code.deleteOne({
                    email: user.email,
                    code: req.params.secretCode,
                });*/

                let redirectPath;

                // we might want to replace this with a redirect to a simple page that
                // tells the user they are verified http://127.0.0.1:3000/Verified or something
                if (process.env.NODE_ENV == "production") {
                    redirectPath = `${req.protocol}://${req.get("host")}`;
                } else {
                    redirectPath = `http://127.0.0.1:3000/`;
                }

                res.redirect(redirectPath);
            }
        } catch (err) {
            console.log("Error on /api/verification/verify-account: ", err);
            res.sendStatus(500);
        }
    }
);

// #route:  DELETE /delete-account
// #desc: delete a user account
router.delete("/delete-account", verify, async (req, res) => {
    const { password } = req.body;

    if (!password) {
        res.json({ success: false, error: "Please provide your password." });
    } else {
        try {
            const user = await User.findById(req.user._id).select("+password");

            if (!user) {
                res.json({
                    success: false,
                    error: "Oh, something went wrong. Please try again!",
                });
            } else {
                const pwCheck = await argon2.verify(user.password, password);

                if (!pwCheck) {
                    res.json({
                        success: false,
                        error: "The provided password is not correct.",
                    });
                } else {
                    const deleted = await User.deleteOne({
                        email: user.email,
                    });

                    await Code.deleteMany({ email: user.email });
                    await Event.deleteMany({ userID: user._id });

                    if (!deleted) {
                        res.json({
                            success: false,
                            error:
                                "Oh, something went wrong. Please try again!",
                        });
                    } else {
                        // req.session = null;
                        res.status(200).json({ success: true });
                    }
                }
            }
        } catch (err) {
            console.log("Error on /delete-account: ", err);
            res.json({
                success: false,
                error: "Oh, something went wrong. Please try again!",
            });
        }
    }
});

// #route:  POST /password-reset/get-code
// #desc:   Reset password of user
router.post("/password-reset/get-code", async (req, res) => {
    const { email } = req.body;
    let errors = [];

    if (!email) {
        errors.push({ msg: "Please provide your registered email address!" });
        res.json({ success: false, errors });
    } else {
        try {
            const user = await User.findOne({ email: email });

            if (!user) {
                errors.push({
                    msg: "The provided email address is not registered!",
                });
                res.json({ success: false, errors });
            } else {
                await Code.deleteOne({ email });

                await sendPasswordResetEmail(email);

                res.json({ success: true });
            }
        } catch (err) {
            console.log("Error on /password-reset/get-code: ", err);
            errors.push({
                msg: "Oh, something went wrong. Please try again!",
            });
            res.json({ success: false, errors });
        }
    }
});

// #route:  POST /password-reset/verify
// #desc:   Verify and save new password of user
router.post("/password-reset/verify", async (req, res) => {
    const { email, password, repeat_password, code } = req.body;
    let errors = [];

    if (!email || !password || !repeat_password || !code) {
        errors.push({ msg: "Please fill in all fields!" });
    }

    try {
        const value = await updateUserValidation({
            password: password,
            repeat_password: repeat_password,
        });
        const response = await Code.findOne({ email, code });

        if (!response) {
            errors.push({
                msg:
                    "The entered code is not correct. Please make sure to enter the code in the requested time interval.",
            });
            res.json({ success: false, errors });
        } else {
            const hash = await argon2.hash(password);
            await User.updateOne({ email }, { password: hash });
            await Code.deleteOne({ email, code });
            res.json({ success: true });
        }
    } catch (err) {
        console.log("Error on /password-reset/verify: ", err);
        errors.push({
            msg: "Oh, something went wrong. Please try again!",
        });
        res.json({ success: false, errors });
    }
});

module.exports = router;
