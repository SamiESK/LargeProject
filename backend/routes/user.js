const express = require("express");

const router = express.Router();

const verify = require("../middleware/authToken").auth;
const checkIfVerified = require("../middleware/authToken").checkIfVerified;

const mongoose = require("mongoose");

const cryptoRandomString = require("crypto-random-string");

const User = mongoose.model("User");

const Code = mongoose.model("Code");

const Event = mongoose.model("Event");

const jwt = require("../createToken");

const {
    registrationValidation,
    loginValidation,
    updateUserValidation,
} = require("../validation");

const argon2 = require("argon2");

const config = require("../config");

const HEADER = require("../config").header;

const TOKEN_PREFIX = require("../config").token_prefix;

require("dotenv").config();

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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
            return res
                .status(400)
                .json({ success: false, error: "Email/Password combination is incorrect" });
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
            res.status(200).json({ firstName: user.firstName, lastName: user.lastName, token: token });
        } else {
            res.json({ success: false, error: "Incorrect Password" });
        }
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            res.status(400).json({ success: false, error: err.details[0].message });
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
            _id: user._id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            isVerified: savedUser.isVerified,
        });

        // could create token here

        const baseUrl = req.protocol + "://" + req.get("host");

        // create and save code to be used during verification process
        const secretCode = cryptoRandomString({
            length: 10,
        });

        const newCode = new Code({
            code: secretCode,
            email: user.email,
        });

        await newCode.save();

        // creating and sending email with verification link to user
        const msg = {
            from: `Eventree <${process.env.FROM_EMAIL}>`,
            to: savedUser.email,
            subject: "Your Activation Link for Eventree",
            text: `Please use the following link within the next 10 minutes to activate your account on Eventree: ${baseUrl}/api/user/verification/verify-account/${user._id}/${secretCode}`,
            html: `<p>Please use the following link within the next 10 minutes to activate your account on Eventree: <strong><a href="${baseUrl}/api/user/verification/verify-account/${user._id}/${secretCode}" target="_blank">Verify Email</a></strong></p>`,
        };

        await sgMail.send(msg).catch((error) => {console.error(error)});

        res.status(200).json({
            _id: savedUser._id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            token: token,
        });

    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            console.log({ error: err.details[0].message });
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

        //_updatedUser._doc.token = token;

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
router.get(
    "/verification/get-activation-email",
    verify,
    async (req, res) => {
        const baseUrl = req.protocol + "://" + req.get("host");

        try {
            const user = await User.findById(req.user._id);

            if (!user) {
                res.status(400).json({ error: 'User not found' });
            } else {

                await Code.deleteMany({ email: user.email });

                const secretCode = cryptoRandomString({
                    length: 10,
                });
                const newCode = new Code({
                    code: secretCode,
                    email: user.email,
                });
                await newCode.save();

                const msg = {
                    from: `Eventree <${process.env.FROM_EMAIL}>`,
                    to: user.email,
                    subject: "Your Activation Link for Eventree",
                    text: `Please use the following link within the next 10 minutes to activate your account on Eventree: ${baseUrl}/api/user/verification/verify-account/${user._id}/${secretCode}`,
                    html: `<p>Please use the following link within the next 10 minutes to activate your account on Eventree: <strong><a href="${baseUrl}/api/user/verification/verify-account/${user._id}/${secretCode}" target="_blank">Verify Email</a></strong></p>`,
                };
                await sgMail.send(msg)
                    .then(() => {console.log('Email sent')})
                    .catch((error) => {console.error(error)});

                res.status(200).json({ success: true });
            }
        } catch (err) {
            console.log("Error on /api/user/get-activation-email: ", err);
            res.status(500).json({ success: false });
        }
    }
);

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
router.delete("/delete-account", verify, checkIfVerified, async (req, res) => {
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
                        res.json({ success: true });
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

                const secretCode = cryptoRandomString({
                    length: 10,
                });
                const newCode = new Code({
                    code: secretCode,
                    email: email,
                });
                await newCode.save();

                const msg = {
                    from: `Eventree <${process.env.FROM_EMAIL}>`,
                    to: email,
                    subject: "Your Password Reset Code for Eventree",
                    text: `Please use the following code within the next 10 minutes to reset your password on Eventree: ${secretCode}`,
                    html: `<p>Please use the following code within the next 10 minutes to reset your password on Eventree: <strong>${secretCode}</strong></p>`,
                };
                await sgMail.send(msg).catch((error) => {console.error(error)});

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
        const value = await updateUserValidation({password: password, repeat_password: repeat_password});
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
