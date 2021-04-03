const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.set("port", process.env.PORT || 5000);

app.use(cors());
app.use(bodyParser.json());

require("dotenv").config();

require("./models/User");
require("./models/Event");
require("./models/Code");

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
});

// import routes
app.use("/api/user", require("./routes/user"));
app.use("/api/events", require("./routes/events"));
app.use("/api/token", require("./routes/refreshToken"));

if (process.env.NODE_ENV !== "test") {
    mongoose.connect(
        process.env.MONGODB_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        },
        (error) => {
            if (error) {
                return new Error("Failed to connect to database");
            }
            console.log("Connected to DB with Mongoose");
        }
    );
}

module.exports = app;
