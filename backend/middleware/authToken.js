const jwt = require("jsonwebtoken");

const HEADER = require("../config").header;

const mongoose = require("mongoose");

const User = mongoose.model("User");

const auth = (req, res, next) => {
    const authHeader = req.header(HEADER);
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid Token" });
    }
};

const checkIfVerified = async (req, res, next) => {
    try {
        const user = await User.findById(
            { _id: req.user._id }
        );
        if (user.isVerified != true) {
            return res.status(401).json({ error: "Unverified Account" });
        }
        req.user.isVerified = user.isVerified;
        next();
    } catch (err) {
        res.status(500).json({ error: "DB failure" });
    }
}

module.exports = {auth, checkIfVerified};
