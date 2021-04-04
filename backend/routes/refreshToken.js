const express = require("express");
const router = express.Router();

const verify = require("../middleware/authToken").auth;
const jwt = require("../createToken");

const path = require("path");

// refresh token API
router.get("/refresh", verify, async (req, res) => {
    try {
        // refreshing token
        const token = await jwt.refresh(req.token);

        // sending back token
        res.status(200).json({ token: token });
    } catch (err) {
        console.log(`Error in ${__filename}: \n\t${err}`);
        res.status(500).json({ error: err });
    }
});

module.exports = router;
