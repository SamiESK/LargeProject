const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const PORT = process.env.PORT || 5000;

const app = express();

app.set("port", process.env.PORT || 5000);

app.use(cors());
app.use(bodyParser.json());

require("dotenv").config();

require("./backend/models/User");
require("./backend/models/Event");
require("./backend/models/Code");

const url = process.env.MONGODB_URI;

mongoose.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true },
    (error) => {
        if (error) {
            return new Error("Failed to connect to database");
        }
        console.log("Connected to DB with Mongoose")
      }
);

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
app.use("/api/user", require("./backend/routes/user"));
app.use("/api/events", require("./backend/routes/events"));
app.use("/api/token", require("./backend/routes/refreshToken"));

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static("frontend/build"));

    app.get("*", (req, res) => {
        res.sendFile(
            path.resolve(__dirname, "frontend", "build", "index.html")
        );
    });
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
}); // start Node + Express server on port
