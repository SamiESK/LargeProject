const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const User = mongoose.model("User");
const Code = mongoose.model("Code");
const Event = mongoose.model("Event");

const passport = require("passport");

const jwt = require("../createToken");

const verifyAuthToken = require("../middleware/authToken").auth;
const checkIfVerified = require("../middleware/authToken").checkIfVerified;

const {
    registrationValidation,
    loginValidation,
    updateUserValidation,
} = require("./user.validation");

const validateObjectID = require("./events.validation").validateObjectID;

const argon2 = require("argon2");

const config = require("../config");

const sendVerificationEmail = require("../email").SendVerificationEmail;
const sendPasswordResetEmail = require("../email").SendPasswordResetEmail;

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
            return res.status(404).json({
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
            res.cookie("jwt", token);
            //.header(HEADER, TOKEN_PREFIX + token)
            res.status(200).json({
                success: true,
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
            res.status(500).json({ success: false, error: config.server });
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

        res.cookie("jwt", token);

        const baseUrl = req.protocol + "://" + req.get("host");
        await sendVerificationEmail(baseUrl, savedUser);

        res.status(201).json({
            _id: savedUser._id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            token: token,
            success: true,
        });
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            console.error({ success: false, error: err.details[0].message });
            res.status(400).json({
                success: false,
                error: err.details[0].message,
            });
        } else if (err.message.localeCompare(config.email_exists_err)) {
            res.status(400).json({ success: false, error: err.message });
        } else if (err.message.localeCompare(config.db_err)) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            // other error(s)
            console.error(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ success: false, error: config.server });
        }
    }
});

router.get(
    "/info",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const userIdValidationResult = await validateObjectID({
                id: req.user._id.toString(),
            });

            // find user
            const user = await User.findById({
                _id: req.user._id,
            });

            delete user._doc.__v;
            delete user._doc._id;

            res.cookie("jwt", await jwt.refresh(req.cookies.jwt));

            // sending result to client side application
            res.status(200).json({
                success: true,
                user: user,
            });
        } catch (err) {
            if (err.hasOwnProperty("details")) {
                res.status(400).json({
                    success: false,
                    error: err.details[0].message,
                });
            } else {
                console.log(`Error in ${__filename}: \n\t${err}`);
                res.status(500).json({ success: false, error: config.server });
            }
        }
    }
);

router.patch(
    "/update",
    passport.authenticate("jwt", { session: false }),
    checkIfVerified,
    async (req, res) => {
        let entries = Object.keys(req.body);
        let updates = {};

        // constructing dynamic query
        for (let i = 0; i < entries.length; i++) {
            updates[entries[i]] = Object.values(req.body)[i];
        }

        try {
            const userDoc = await User.findById(req.user._id);

            if (updates.email && userDoc.email.toString() === updates.email) {
                delete updates.email;
            }

            let oldPass = null;

            if (updates.old_password) {
                oldPass = updates.old_password;
                delete updates.old_password;
            }

            // validate update information
            const value = await updateUserValidation(updates);

            const user = await User.findOne({ _id: req.user._id }).select(
                "+password"
            );

            if (updates.password && oldPass) {
                if (await argon2.verify(user.password, oldPass)) {
                    updates.password = await argon2.hash(updates.password);
                } else {
                    return res.json({ success: false, error: "Incorrect Password" });
                }
            }

            const updatedUser = await User.findByIdAndUpdate(
                { _id: req.user._id },
                { $set: updates },
                { useFindAndModify: false }
            );

            // if (updatedUser == null) return res.status(500).json({error: 'email change failed'});

            const _updatedUser = await User.findById(req.user._id).select(
                "-__v"
            );

            // _updatedUser._doc.token = token;
            res.cookie("jwt", await jwt.refresh(req.cookies.jwt));

            // sending result to client side application
            res.status(200).json({ success: true, ..._updatedUser.toObject() });
        } catch (err) {
            // if there is a validation error
            if (err.hasOwnProperty("details")) {
                res.status(400).json({
                    success: false,
                    error: err.details[0].message,
                });
            } else if (err.message.localeCompare(config.email_exists_err)) {
                res.status(400).json({ success: false, error: err.message });
            } else if (err.message.localeCompare(config.db_err)) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                // other error(s)
                console.log(`Error in ${__filename}: \n\t${err}`);
                res.status(500).json({ success: false, error: config.server });
            }
        }
    }
);

router.get("/email-exists", async (req, res) => {
    try {
        const email = await User.findOne({ email: req.query.email });

        if (email) {
            res.status(200).json({
                success: true,
                emailExists: true,
            });
        } else {
            res.status(200).json({
                success: true,
                emailExists: false,
            });
        }
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            res.status(400).json({
                success: false,
                error: err.details[0].message,
            });
        } else if (err.message.localeCompare(config.email_exists_err)) {
            res.status(400).json({ success: false, error: err.message });
        } else if (err.message.localeCompare(config.db_err)) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            // other error(s)
            console.log(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ success: false, error: config.server });
        }
    }
});

router.get(
    "/email-exists-auth",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const userDoc = await User.findById(req.user._id);

            if (
                req.query.email &&
                userDoc.email.toString() === req.query.email
            ) {
                return res.status(200).json({
                    success: true,
                    emailExists: false,
                });
            }

            const email = await User.findOne({ email: req.query.email });

            if (email) {
                res.status(200).json({
                    success: true,
                    emailExists: true,
                });
            } else {
                res.status(200).json({
                    success: true,
                    emailExists: false,
                });
            }
        } catch (err) {
            // if there is a validation error
            if (err.hasOwnProperty("details")) {
                res.status(400).json({
                    success: false,
                    error: err.details[0].message,
                });
            } else if (err.message.localeCompare(config.email_exists_err)) {
                res.status(400).json({ success: false, error: err.message });
            } else if (err.message.localeCompare(config.db_err)) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                // other error(s)
                console.log(`Error in ${__filename}: \n\t${err}`);
                res.status(500).json({ success: false, error: config.server });
            }
        }
    }
);

// #route:  GET api/user/verification/get-activation-email
// #desc:   Send verification email to registered users email address
router.get(
    "/verification/get-activation-email",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                });
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

                if (process.env.NODE_ENV == "production") {
                    redirectPath = `${req.protocol}://${req.get(
                        "host"
                    )}/verified`;
                } else {
                    redirectPath = `http://127.0.0.1:3000/verified`;
                }

                res.redirect(redirectPath);
            }
        } catch (err) {
            console.log("Error on /api/verification/verify-account: ", err);

            let redirectPath;

            // we might want to replace this with a redirect to a simple page that
            // tells the user they are verified http://127.0.0.1:3000/Verified or something
            if (process.env.NODE_ENV == "production") {
                redirectPath = `${req.protocol}://${req.get(
                    "host"
                )}/unverified`;
            } else {
                redirectPath = `http://127.0.0.1:3000/unverified`;
            }
            res.redirect(redirectPath);
        }
    }
);

// #route:  POST /delete-account
// #desc: delete a user account
router.post(
    "/delete-account",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const { password } = req.body;

        if (!password) {
            res.status(400).json({
                success: false,
                error: "Please provide your password.",
            });
        } else {
            try {
                const user = await User.findById(req.user._id).select(
                    "+password"
                );

                if (!user) {
                    res.status(404).json({
                        success: false,
                        error: "Oh, something went wrong. Please try again!",
                    });
                } else {
                    const pwCheck = await argon2.verify(
                        user.password,
                        password
                    );

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
                res.status(500).json({
                    success: false,
                    error: "Oh, something went wrong. Please try again!",
                });
            }
        }
    }
);

router.delete(
    "/delete-account",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "Oh, something went wrong. Please try again!",
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
                        error: "Oh, something went wrong. Please try again!",
                    });
                } else {
                    // req.session = null;
                    res.status(200).json({ success: true });
                }
            }
        } catch (err) {
            console.log("Error on /delete-account: ", err);
            res.status(500).json({
                success: false,
                error: "Oh, something went wrong. Please try again!",
            });
        }
    }
);

// #route:  POST /password-reset/get-code
// #desc:   Reset password of user
router.post("/password-reset/get-code", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({
            success: false,
            error: "Please provide your registered email address!",
        });
    } else {
        try {
            const user = await User.findOne({ email: email });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "The provided email address is not registered!",
                });
            } else {
                await Code.deleteOne({ email });

                await sendPasswordResetEmail(email);

                res.status(200).json({ success: true });
            }
        } catch (err) {
            console.log("Error on /password-reset/get-code: ", err);
            res.status(500).json({
                success: false,
                error: "Oh, something went wrong. Please try again!",
            });
        }
    }
});

// #route:  POST /password-reset/verify
// #desc:   Verify and save new password of user
router.post("/password-reset/verify", async (req, res) => {
    const { email, password, repeat_password, code } = req.body;
    let errors = [];

    if (!email || !password || !repeat_password || !code) {
        return res
            .status(400)
            .json({ success: false, error: "Please fill in all fields!" });
    }

    try {
        const value = await updateUserValidation({
            password: password,
            repeat_password: repeat_password,
        });

        const response = await Code.findOne({ email: email, code: code });

        if (!response) {
            res.status(401).json({
                success: false,
                error:
                    "The entered code is not correct. Please make sure to enter the code in the requested time interval.",
            });
        } else {
            const hash = await argon2.hash(password);
            await User.updateOne({ email }, { password: hash });
            await Code.deleteOne({ email, code });
            res.status(200).json({ success: true });
        }
    } catch (err) {
        if (err.hasOwnProperty("details")) {
            res.status(400).json({
                success: false,
                error: err.details[0].message,
            });
        } else if (err.message.localeCompare(config.db_err)) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            // other error(s)
            console.log(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({
                success: false,
                error: "Oh, something went wrong. Please try again!",
            });
        }
    }
});

module.exports = router;
