const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);

const newEventValidation = (data) => {
    const eventSchema = Joi.object({
        userID: Joi.objectId().required(),
        title: Joi.string().min(1).required(),
        description: Joi.string().min(1),
        location: Joi.string().min(1),
        startTime: Joi.date().required(),
        endTime: Joi.date().min(Joi.ref('startTime')),
    })
    return eventSchema.validateAsync(data);
};

const updateEventValidation = (data) => {
    const eventSchema = Joi.object({
        title: Joi.string().min(1),
        description: Joi.string().min(1),
        location: Joi.string().min(1),
        startTime: Joi.date(),
        endTime: Joi.date().min(Joi.ref('startTime')),
    }).with("startTime", "endTime");
    return eventSchema.validateAsync(data);
};

module.exports = { newEventValidation, updateEventValidation };
