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
    // incoming: search

    const { search } = req.body;

    // getting userID from token decoded in verify
    const userID = req.user._id;

    try {
        if (search) {
            let _search = search.trim();

            // search DB for this user's events
            // where _search partially matches
            // the title, description, or location
            const events = await Event.find({
                $and: [
                    { userID: userID },
                    {
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
                    },
                ],
            }).select("-userID -__v");

            // refreshing token
            const token = jwt.refresh(req.token);

            // sending result
            res.header(HEADER, TOKEN_PREFIX + token)
                .status(200)
                .json(events);
        } else {
            // if no search is specify return all events for user
            const events = await Event.find({ userID: userID }).select(
                "-userID -__v"
            );

            const token = jwt.refresh(req.token);

            res.header(HEADER, TOKEN_PREFIX + token)
                .status(200)
                .json(events);
        }
    } catch (err) {
        res.json({ error: err });
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
