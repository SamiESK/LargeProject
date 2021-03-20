const express = require("express");

const router = express.Router();

const verify = require("../middleware/verifyToken");

const mongoose = require("mongoose");

const Event = mongoose.model("Event");

const jwt = require("../createToken");

const HEADER = require("../config").header;

const TOKEN_PREFIX = require("../config").token_prefix;

// current searches events by name, description, and location
router.get("/", verify, async (req, res) => {
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
                error: "Please ensure you pick two dates",
            });
        }

        // check that date is in the right format
        // expected result: YYYY-MM-DD
        console.log({ search, startDate, endDate });
        //console.log(`start: ${startDate}, end:${endDate}`);

        let timeRange = null;
        if (startDate && endDate) {
            timeRange = {
                time: {
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
                .sort({ time: "asc" })
                .select("-userID -__v");
        } else {
            // if no search is specify return all events for user
            events = await Event.find({
                $and: [{ userID: userID }, timeRange],
            })
                .sort({ time: "asc" })
                .select("-userID -__v");
        }

        // Handle responses
        if (!events) {
            return res.status(404).json({
                error: "Could not retrieve events",
            });
        }

        // refreshing token
        const token = jwt.refresh(req.token);

        // sending result
        res.header(HEADER, TOKEN_PREFIX + token)
            .status(200)
            .json(events);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

// create an event
router.post("/create", verify, async (req, res) => {
    // getting userID from token decoded in verify
    const userID = req.user._id;

    const event = new Event({
        userID: userID,
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        time: req.body.time,
    });
    try {
        // saving event to db
        const savedEvent = await event.save();

        // refreshing token
        const token = jwt.refresh(req.token);

        // sending result to client side application
        res.header(HEADER, TOKEN_PREFIX + token)
            .status(200)
            .json(savedEvent);
    } catch (err) {
        res.json({ error: err });
    }
});

router.patch("/update/:eventID", verify, async (req, res) => {
    const entries = Object.keys(req.body);
    const updates = {};

    // constructing dynamic query
    for (let i = 0; i < entries.length; i++) {
        updates[entries[i]] = Object.values(req.body)[i];
    }

    try {
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

        // sending result to client side application
        res.header(HEADER, TOKEN_PREFIX + token)
            .status(200)
            .json(_updatedEvent);
    } catch (err) {
        res.json({ error: err });
    }
});

// delete an event
router.delete("/remove/:eventID", verify, async (req, res) => {
    try {
        // delete event from db
        const removedEvent = await Event.deleteOne({ _id: req.params.eventID });

        // refreshing token
        const token = jwt.refresh(req.token);

        // sending result to client side application
        res.header(HEADER, TOKEN_PREFIX + token)
            .status(200)
            .json(removedEvent);
    } catch (err) {
        res.json({ error: err });
    }
});

module.exports = router;
