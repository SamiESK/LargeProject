const express = require("express");

const router = express.Router();

const verify = require("../middleware/verifyToken");

const mongoose = require("mongoose");

const User = mongoose.model("User");

const jwt = require("../createToken");

const {
    registrationValidation,
    loginValidation,
    emailValidation,
} = require("../validation");

const argon2 = require("argon2");

const config = require("../config");

const HEADER = require("../config").header;

const TOKEN_PREFIX = require("../config").token_prefix;

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
                .json({ error: "Email/Password combination is incorrect" });
        }

        // check password against hash in db
        if (await argon2.verify(user.password, password)) {
            // create token
            const token = jwt.createToken({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
            });

            //.header(HEADER, TOKEN_PREFIX + token)
            res.status(200).json({ token: token });
        } else {
            res.json({ error: "incorrect pass" });
        }
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            res.status(400).json({ error: err.details[0].message });
        } else {
            // other error(s)
            console.log(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ error: err });
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

        // hash password
        const hash = await argon2.hash(password);

        const user = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            // could add username: req.body.username
            // I omitted it for simplicity
            password: hash,
        });

        // save user to db and return json
        const savedUser = await user.save();
        res.status(200).json({
            _id: savedUser._id,
            firstName: firstName,
            lastName: lastName,
            email: email,
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

router.patch("/update/email", verify, async (req, res) => {
    const newEmail = req.body.email;

    try {
        // validate register information
        const value = await emailValidation({
            email: newEmail,
        });

        // updating user in db
        const updatedUser = await User.findByIdAndUpdate(
            { _id: req.user._id },
            { $set: { email: newEmail } },
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

module.exports = router;
