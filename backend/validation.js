const Joi = require("joi");

const registrationValidation = (data) => {
    const registerSchema = Joi.object({
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().min(1).required(),
        email: Joi.string().min(5).email().required(), // we should add a function to check for unique email
        password: Joi.string().min(8).required(),
        repeat_password: Joi.ref('password'),
    }).with('password', 'repeat_password');
    return registerSchema.validateAsync(data);
};

const loginValidation = (data) => {
    const loginSchema = Joi.object({
        email: Joi.string().min(5).required(),
        password: Joi.string().min(8).required(),
    });
    return loginSchema.validateAsync(data);
};

module.exports = { registrationValidation, loginValidation };
