const express = require("express");

const router = express.Router();
const passport = require("passport");

const verifyAuthToken = require("../middleware/authToken").auth;
const checkIfVerified = require("../middleware/authToken").checkIfVerified;

const mongoose = require("mongoose");

const Event = mongoose.model("Event");

const jwt = require("../createToken");

const config = require("../config");

const {
    newEventValidation,
    updateEventValidation,
    validateObjectID,
} = require("./events.validation");

// current searches events by name, description, and location
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    checkIfVerified,
    async (req, res) => {
        // incoming: search, startDate, endDate

        // api call should look something like this:
        // {{url}}/api/events/?search=awesome event&startDate=2021-03-10T22:44:43.415Z&endDate=2021-03-25T22:44:43.415Z

        // however if you just want all the events of a user you can do this:
        // {{url}}/api/events/
        // console.log(req.cookies)
        try {
            // getting userID from token decoded in verify
            const userID = req.user._id.toString();

            // get search and dates from req.query
            let { search, startDate, endDate, limit, offset } = req.query;

            // check that date is not empty
            if (startDate === "" || endDate === "") {
                return res.status(400).json({
                    success: false,
                    error: "Please ensure you pick two dates",
                });
            }

            // check that date is in the right format
            // expected result: YYYY-MM-DD
            // console.log({ search, startDate, endDate });
            // console.log(`start: ${startDate}, end:${endDate}`);

            let timeRange = null;
            if (startDate && endDate) {
                timeRange = {
                    startTime: {
                        $gte: new Date(new Date(startDate).setHours(0, 0, 0)),
                        $lt: new Date(new Date(endDate).setHours(23, 59, 59)),
                    },
                };
            } else if (startDate) {
                timeRange = {
                    startTime: {
                        $gte: new Date(new Date(startDate).setHours(0, 0, 0)),
                    },
                };
            } else if (endDate) {
                timeRange = {
                    startTime: {
                        $lt: new Date(new Date(endDate).setHours(23, 59, 59)),
                    },
                };
            } else {
                timeRange = {};
            }

            let events = null;

            // Query database using Mongoose
            // Mind the curly braces
            if (search) {
                let _search = search.trim();

                let searchJSON = {
                    $or: [
                        {
                            title: {
                                $regex: _search + ".*",
                                $options: "i",
                            },
                        },
                        {
                            description: {
                                $regex: _search + ".*",
                                $options: "i",
                            },
                        },
                        {
                            location: {
                                $regex: _search + ".*",
                                $options: "i",
                            },
                        },
                    ],
                };

                // search DB for this user's events
                // where _search partially matches
                // the title, description, or location
                if (limit && offset) {
                    events = await Event.find({
                        $and: [{ userID: userID }, timeRange, searchJSON],
                    })
                        .sort({ startTime: "asc" })
                        .skip(parseInt(offset))
                        .limit(parseInt(limit))
                        .select("-userID -__v");
                } else {
                    events = await Event.find({
                        $and: [{ userID: userID }, timeRange, searchJSON],
                    })
                        .sort({ startTime: "asc" })
                        .select("-userID -__v");
                }
            } else {
                // if no search is specify return all events for user
                if (limit && offset) {
                    events = await Event.find({
                        $and: [{ userID: userID }, timeRange],
                    })
                        .sort({
                            startTime: "asc",
                            title: "asc",
                            location: "asc",
                        })
                        .skip(parseInt(offset))
                        .limit(parseInt(limit))
                        .select("-userID -__v");
                } else {
                    events = await Event.find({
                        $and: [{ userID: userID }, timeRange],
                    })
                        .sort({
                            startTime: "asc",
                            title: "asc",
                            location: "asc",
                        })
                        .select("-userID -__v");
                }
            }

            // Handle responses
            if (!events) {
                return res.status(404).json({
                    success: false,
                    error: "Could not retrieve events",
                });
            }

            res.cookie("jwt", await jwt.refresh(req.cookies.jwt));

            // sending result
            res.status(200).json(events);
        } catch (err) {
            console.log(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ success: false, error: config.server });
        }
    }
);

// create an event
router.post(
    "/create",
    passport.authenticate("jwt", { session: false }),
    checkIfVerified,
    async (req, res) => {
        // getting userID from token decoded in verify
        req.body.userID = req.user._id.toString();

        const eventJSON = req.body;

        try {
            const value = await newEventValidation(eventJSON);

            const event = new Event(eventJSON);

            // saving event to db
            const savedEvent = await event.save();
            delete savedEvent._doc.__v;
            delete savedEvent._doc.userID;

            // savedEvent._doc.token = token;
            res.cookie("jwt", await jwt.refresh(req.cookies.jwt));

            // sending result to client side application
            res.status(200).json({ ...savedEvent.toObject(), success: true });
        } catch (err) {
            // if there is a validation error
            if (err.hasOwnProperty("details")) {
                res.status(400).json({
                    success: false,
                    error: err.details[0].message,
                });
            } else {
                // other error(s)
                console.log(`Error in ${__filename}: \n\t${err}`);
                res.status(500).json({ success: false, error: config.server });
            }
        }
    }
);

router.patch(
    "/update/:eventID",
    passport.authenticate("jwt", { session: false }),
    checkIfVerified,
    async (req, res) => {
        const entries = Object.keys(req.body);
        const updates = {};

        // constructing dynamic query
        for (let i = 0; i < entries.length; i++) {
            updates[entries[i]] = Object.values(req.body)[i];
        }

        try {
            const updateValidationResult = await updateEventValidation(updates);
            const eventIdValidationResult = await validateObjectID({
                id: req.params.eventID,
            });

            // updating event in db
            const updatedEvent = await Event.findByIdAndUpdate(
                { _id: req.params.eventID },
                { $set: updates },
                { useFindAndModify: false }
            );
            const _updatedEvent = await Event.findById(
                req.params.eventID
            ).select("-userID -__v");

            _updatedEvent._doc.success = true;

            res.cookie("jwt", await jwt.refresh(req.cookies.jwt));

            // sending result to client side application
            res.status(200).json({
                ..._updatedEvent.toObject(),
                success: true,
            });
        } catch (err) {
            // if there is a validation error
            if (err.hasOwnProperty("details")) {
                res.status(400).json({
                    success: false,
                    error: err.details[0].message,
                });
            } else {
                // other error(s)
                console.log(`Error in ${__filename}: \n\t${err}`);
                res.status(500).json({ success: false, error: config.server });
            }
        }
    }
);

// delete an event
router.delete(
    "/remove/:eventID",
    passport.authenticate("jwt", { session: false }),
    checkIfVerified,
    async (req, res) => {
        try {
            const eventIdValidationResult = await validateObjectID({
                id: req.params.eventID,
            });

            // delete event from db
            const removedEvent = await Event.deleteOne({
                _id: req.params.eventID,
            });

            res.cookie("jwt", await jwt.refresh(req.cookies.jwt));

            // sending result to client side application
            res.status(200).json({
                success: true,
                ok: removedEvent.ok,
                deletedCount: removedEvent.deletedCount,
                // n: removedEvent.n,
            });
        } catch (err) {
            if (err.hasOwnProperty("details")) {
                res.status(400).json({
                    success: false,
                    error: err.details[0].message,
                });
            } else {
                console.log(`Error in ${__filename}: \n\t${err}`);
                res.status(500).json({ success: false, error: config.server });
            }
        }
    }
);

module.exports = router;
