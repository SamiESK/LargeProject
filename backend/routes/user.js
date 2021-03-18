const express = require("express");

const router = express.Router();

const mongoose = require("mongoose");

const User = mongoose.model("User");

const jwt = require("../createToken");

const { registrationValidation, loginValidation } = require("../validation");

const argon2 = require("argon2");

const HEADER = require("../config").header;

const TOKEN_PREFIX = require("../config").token_prefix;

// login API
router.get("/login", async (req, res, next) => {
    // incoming: email, password
    // outgoing: token

    const { email, password } = req.body;

    try {
        // validate login information
        const value = await loginValidation({
            email: email,
            // could add username: req.body.username
            // I omitted it for simplicity
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

            // send token back in header and json (the json is not required I think)
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
            res.json({ error: err });
        }
    }
});

router.post("/register", async (req, res, next) => {
    const { firstName, lastName, email, password, repeat_password } = req.body;

    try {
        // check if email is already taken
        const emailExists = await User.findOne({ email: email });
        if (emailExists)
            return res.status(400).json({ error: "Email already exists" });

        // validate register information
        const value = await registrationValidation({
            lastName: firstName,
            firstName: lastName,
            email: email,
            // could add username: req.body.username
            // I omitted it for simplicity
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
        res.status(200).json({_id: savedUser._id, firstName: firstName, lastName: lastName, email: email});
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            console.log({ error: err.details[0].message });
            res.status(400).json({ error: err.details[0].message });
        } else {
            // other error(s)
            res.json({ error: err });
        }
    }
});

module.exports = router;
