const jwt = require("jsonwebtoken");

require("dotenv").config();

// creates a jwt token using the given user json
module.exports.createToken = (user) => {
    const expiration = new Date(); // not used yet

    // const token = jwt.sign(user, process.env.JWT_SECRET);

    const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '30m'});

    return token;
};

// creates a new token using the values extracted from the current one
module.exports.refresh = (token) => {
    let ud = jwt.decode(token, { complete: true });

    const id = ud.payload._id;
    const fname = ud.payload.firstName;
    const lname = ud.payload.lastName;
    const isVerified = ud.payload.isVerified;

    return this.createToken({ _id: id, firstName: fname, lastName: lname, isVerified: isVerified});
};
