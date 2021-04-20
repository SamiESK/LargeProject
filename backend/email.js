require("dotenv").config();

const mongoose = require("mongoose");
const Code = mongoose.model("Code");
const cryptoRandomString = require("crypto-random-string");

const { buildRedirectPathClient } = require("./config");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SendVerificationEmail = async (baseUrl, user) => {
    // create and save code to be used during verification process
    const secretCode = cryptoRandomString({
        length: 10,
    });

    const newCode = new Code({
        code: secretCode,
        email: user.email,
    });

    await newCode.save();

    // creating and sending email with verification link to user
    const msg = {
        from: `Eventree <${process.env.FROM_EMAIL}>`,
        to: user.email,
        subject: "Your Activation Link for Eventree",
        text: `Please use the following link within the next 10 minutes to activate your account on Eventree: ${baseUrl}/api/user/verification/verify-account/${user._id}/${secretCode}`,
        html: `<p>Please use the following link within the next 10 minutes to activate your account on Eventree: <strong><a href="${baseUrl}/api/user/verification/verify-account/${user._id}/${secretCode}" target="_blank">Verify Email</a></strong></p>`,
        mail_settings: {
            sandbox_mode: {
                enable: process.env.NODE_ENV === "test",
            },
        },
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(error);
    }
};

const SendPasswordResetEmail = async (email) => {
    const secretCode = cryptoRandomString({
        length: 10,
    });
    const newCode = new Code({
        code: secretCode,
        email: email,
    });
    await newCode.save();

    const msg = {
        from: `Eventree <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: "Your Password Reset Code for Eventree",
        text: `Please use the code ${secretCode} at ${buildRedirectPathClient('password-reset')} within the next 10 minutes to reset your password on Eventree`,
        html: `<p>Please use the following code <strong>${secretCode}</strong> <a href="${buildRedirectPathClient('password-reset')}" target="_blank">here</a> in the next 10 minutes to reset your password on Eventree</p>`,
        mail_settings: {
            sandbox_mode: {
                enable: process.env.NODE_ENV === "test",
            },
        },
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(error);
    }
};

module.exports.SendPasswordResetEmail = SendPasswordResetEmail;
module.exports.SendVerificationEmail = SendVerificationEmail;
