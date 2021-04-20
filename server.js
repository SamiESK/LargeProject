const express = require("express");

const path = require("path");

const PORT = process.env.PORT || 5000;

const app = require("./backend/app");

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
    // Set static folder

    // console.log("Using frontend/build")
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
