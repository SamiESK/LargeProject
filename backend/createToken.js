const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");

require("dotenv").config();

// creates a jwt token using the given user json
module.exports.createToken = (user) => {
    const expiration = new Date(); // not used yet

    // const token = jwt.sign(user, process.env.JWT_SECRET);

    const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '30m'});

    return token;
};

// creates a new token using the values extracted from the current one
module.exports.refresh = async (token) => {
    let ud = jwt.decode(token, { complete: true });

    const id = ud.payload._id;
    const user = await User.findById({_id: id});

    return this.createToken({ _id: user.id, firstName: user.firstName, lastName: user.lastName, isVerified: user.isVerified});
};
