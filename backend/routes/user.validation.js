const Joi = require("joi");

const mongoose = require("mongoose");

const User = mongoose.model("User");

const config = require("../config");

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
            .min(1)
            .email()
            .external(checkEmail, "Email in use")
            .required(),
        password: Joi.string()
            .min(8)
            .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/)
            .required()
            .messages({
                "string.min": "Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character",
                "string.pattern.base":
                    "Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character",
            }),
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

const updateUserValidation = (data) => {
    const updateSchema = Joi.object({
        firstName: Joi.string().min(1),
        lastName: Joi.string().min(1),
        email: Joi.string().min(5).email().external(checkEmail, "Email in use"),
        password: Joi.string()
            .min(8)
            .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/)
            .messages({
                "string.min": "Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character",
                "string.pattern.base":
                    "Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character",
            }),
        repeat_password: Joi.ref("password"),
    }).with("password", "repeat_password");
    return updateSchema.validateAsync(data);
};

module.exports = {
    registrationValidation,
    loginValidation,
    updateUserValidation,
};
