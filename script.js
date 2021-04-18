#!/usr/bin/env node

// console.log(require("crypto").randomBytes(64).toString('hex'));
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(
    process.env.MONGODB_TEST_URI,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },
    (error) => {
        if (error) {
            return new Error("Failed to connect to database");
        }
        console.log("Connected to DB with Mongoose")
      }
);

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
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

const user = new User({
	firstName: 'firstName',
	lastName: 'lastName',
	email: 'email',
	password: 'password',
}).save();

// console.log(Date());
