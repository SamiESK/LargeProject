const Joi = require("joi");

const mongoose = require("mongoose");

const User = mongoose.model("User");

const config = require("./config");

// method to check if email is already taken
const checkEmail = async (email) => {
    let emailExists;
    try {
        emailExists = await User.findOne({ email: email });
    } catch (err) {
        throw new Error(config.db_err); // TODO: make string message a constant defined in config
    }

    if (emailExists) {
        //helpers.error('any.invalid');
        throw new Error(config.email_exists_err); // TODO: make string message a constant defined in config
    }

    // Return the value unchanged
    return email;
};

const registrationValidation = (data) => {
    const registerSchema = Joi.object({
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().min(1).required(),
        email: Joi.string()
            .min(5)
            .email()
            .external(checkEmail, "Email in use")
            .required(),
        password: Joi.string().min(8).required(),
        repeat_password: Joi.ref("password"),
    }).with("password", "repeat_password");
    return registerSchema.validateAsync(data);
};

const loginValidation = (data) => {
    const loginSchema = Joi.object({
        email: Joi.string().min(5).required(),
        password: Joi.string().min(8).required(),
    });
    return loginSchema.validateAsync(data);
};

const emailValidation = (data) => {
    const emailSchema = Joi.object({
        email: Joi.string()
            .min(5)
            .email()
            .external(checkEmail, "Email in use")
            .required(),
    });
    return emailSchema.validateAsync(data);
};

module.exports = { registrationValidation, loginValidation, emailValidation };
