const jwt = require("jsonwebtoken");

const HEADER = require("../config").header;

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
        res.status(400).json({ error: "Invalid Token" });
    }
};

module.exports = auth;
