const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const EventsSchema = mongoose.Schema(
    {
        userID: {
            type: ObjectId,
            ref: "User",
            require: true,
        },
        title: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        location: {
            type: String,
            require: true,
        },
        startTime: {
            type: Date,
            require: true,
        },
        endTime: {
            type: Date,
            require: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", EventsSchema);
