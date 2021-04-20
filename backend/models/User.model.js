const mongoose = require("mongoose");
const argon2 = require("argon2");

const UserSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        googleId: {
            type: String,
        },
        microsoftId: {
            type: String,
        },
        githubId: {
            type: String,
        },
    },
    { timestamps: true }
);

// hash password on save
UserSchema.pre("save", async function (next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    const hash = await argon2.hash(this.password);
    this.password = hash;
    next();
});

module.exports = mongoose.model("User", UserSchema);
