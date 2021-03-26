const express = require("express");

const router = express.Router();

const verify = require("../middleware/authToken").auth;
const checkIfVerified = require("../middleware/authToken").checkIfVerified;

const mongoose = require("mongoose");

const Event = mongoose.model("Event");

const jwt = require("../createToken");

const {
    newEventValidation,
    updateEventValidation,
} = require("./eventsValidation");

const HEADER = require("../config").header;

const TOKEN_PREFIX = require("../config").token_prefix;

// current searches events by name, description, and location
router.get("/", verify, checkIfVerified, async (req, res) => {
    // incoming: search, startDate, endDate

    // api call should look something like this:
    // {{url}}/api/events/?search=awesome event&startDate=2021-03-10T22:44:43.415Z&endDate=2021-03-25T22:44:43.415Z

    // however if you just want all the events of a user you can do this:
    // {{url}}/api/events/

    try {
        // getting userID from token decoded in verify
        const userID = req.user._id;

        // get search and dates from req.query
        let { search, startDate, endDate } = req.query;

        // check that date is not empty
        if (startDate === "" || endDate === "") {
            return res.status(400).json({
                success: false, error:"Please ensure you pick two dates",
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
                    $gte: new Date(new Date(startDate).setHours(00, 00, 00)),
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
            events = await Event.find({
                $and: [{ userID: userID }, timeRange, searchJSON],
            })
                .sort({ startTime: "asc" })
                .select("-userID -__v");
        } else {
            // if no search is specify return all events for user
            events = await Event.find({
                $and: [{ userID: userID }, timeRange],
            })
                .sort({ startTime: "asc" })
                .select("-userID -__v");
        }

        // Handle responses
        if (!events) {
            return res.status(404).json({
                success: false, error:"Could not retrieve events",
            });
        }

        // refreshing token
        const token = jwt.refresh(req.token);

        // events._doc.token = token;

        // sending result
        res.status(200).json(events);
    } catch (err) {
        console.log(`Error in ${__filename}: \n\t${err}`);
        res.status(500).json({ success: false, error:err });
    }
});

// create an event
router.post("/create", verify, checkIfVerified, async (req, res) => {
    // getting userID from token decoded in verify
    req.body.userID = req.user._id

    const eventJSON = req.body;

    try {
        const value = await newEventValidation(eventJSON);

        const event = new Event(eventJSON);

        // saving event to db
        const savedEvent = await event.save();
        delete savedEvent._doc.__v;
        delete savedEvent._doc.userID;

        // refreshing token
        const token = jwt.refresh(req.token);

        // savedEvent._doc.token = token;

        // sending result to client side application
        res.status(200).json(savedEvent);
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            res.status(400).json({ success: false, error:err.details[0].message });
        } else {
            // other error(s)
            console.log(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ success: false, error:err });
        }
    }
});

router.patch("/update/:eventID", verify, checkIfVerified, async (req, res) => {
    const entries = Object.keys(req.body);
    const updates = {};

    // constructing dynamic query
    for (let i = 0; i < entries.length; i++) {
        updates[entries[i]] = Object.values(req.body)[i];
    }

    try {
        const value = await updateEventValidation(updates);

        // updating event in db
        const updatedEvent = await Event.findByIdAndUpdate(
            { _id: req.params.eventID },
            { $set: updates },
            { useFindAndModify: false }
        );
        const _updatedEvent = await Event.findById(req.params.eventID).select(
            "-userID -__v"
        );
        // refreshing token
        const token = jwt.refresh(req.token);
        //_updatedEvent._doc.token = token;

        // sending result to client side application
        res.status(200).json(_updatedEvent);
    } catch (err) {
        // if there is a validation error
        if (err.hasOwnProperty("details")) {
            res.status(400).json({ success: false, error:err.details[0].message });
        } else {
            // other error(s)
            console.log(`Error in ${__filename}: \n\t${err}`);
            res.status(500).json({ success: false, error:err });
        }
    }
});

// delete an event
router.delete("/remove/:eventID", verify, checkIfVerified, async (req, res) => {
    try {
        // delete event from db
        const removedEvent = await Event.deleteOne({ _id: req.params.eventID });

        // refreshing token
        const token = jwt.refresh(req.token);

        // sending result to client side application
        res.status(200).json({
            ok: removedEvent.ok,
            deletedCount: removedEvent.deletedCount,
            // n: removedEvent.n,
            // token: token
        });
    } catch (err) {
        console.log(`Error in ${__filename}: \n\t${err}`);
        res.status(500).json({ success: false, error:err });
    }
});

module.exports = router;
