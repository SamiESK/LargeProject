const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");

require("dotenv").config();
require("./models/User.model");
require("./models/Event.model");
require("./models/Code.model");
const User = mongoose.model("User");

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
// const FacebookStrategy = require("passport-facebook").Strategy;

const { buildRedirectPath } = require("./config");

let opts = {};
opts.jwtFromRequest = (req) => {
    // let token = null;
    // const authHeader = req.header(require("./config").header);
    // const headerToken = authHeader && authHeader.split(" ")[1];
    // if (!headerToken) {
    //     return token;
    // } else {
    //     return headerToken;
    // }

    // tell passport to read JWT from cookies
    var token = null;
    if (req && req.cookies) {
        token = req.cookies["jwt"];
    }

    return token;
};

opts.secretOrKey = process.env.JWT_SECRET;

// main authentication, our app will rely on it
passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        // console.log("JWT BASED AUTH GETTING CALLED"); // called everytime a protected URL is being served
        // console.log(jwt_payload._id);
        User.findOne({ _id: jwt_payload._id }, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GoogleClientID,
            clientSecret: process.env.GoogleClientSecret,
            callbackURL: buildRedirectPath("auth/google/callback"),
        },
        async (accessToken, refreshToken, profile, done) => {
            // passport callback function
            //check if user already exists in our db with the given profile ID
            try {
                const currentUser = await User.findOne({
                    googleId: profile.id,
                });
                if (currentUser) {
                    //if we already have a record with the given profile ID
                    done(null, currentUser);
                } else {
                    //if not, create a new user
                    new User({
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile._json.email,
                        isVerified: profile._json.email_verified,
                        googleId: profile.id,
                        password: "googleOAuth",
                    })
                        .save()
                        .then((newUser) => {
                            done(null, newUser);
                        });
                }
            } catch (err) {
                console.error(err);
            }
        }
    )
);

passport.use(
    new MicrosoftStrategy(
        {
            clientID: process.env.MicrosoftClientID,
            clientSecret: process.env.MicrosoftClientSecret,
            callbackURL: buildRedirectPath("auth/microsoft/callback"),
        },
        async (accessToken, refreshToken, profile, done) => {
            // passport callback function
            //check if user already exists in our db with the given profile ID
            try {
                const currentUser = await User.findOne({
                    microsoftId: profile.id,
                });
                if (currentUser) {
                    //if we already have a record with the given profile ID
                    done(null, currentUser);
                } else {
                    //if not, create a new user
                    new User({
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                        isVerified: true,
                        microsoftId: profile.id,
                        password: "microsoftOAuth",
                    })
                        .save()
                        .then((newUser) => {
                            done(null, newUser);
                        });
                }
            } catch (err) {
                console.error(err);
            }
        }
    )
);

passport.use(
    new GithubStrategy(
        {
            clientID: process.env.GithubClientID,
            clientSecret: process.env.GithubClientSecret,
            callbackURL: buildRedirectPath("auth/github/callback"),
            scope: ["profile", "read:user", "user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            // passport callback function
            //check if user already exists in our db with the given profile ID
            try {
                const currentUser = await User.findOne({
                    githubId: profile.id,
                });
                if (currentUser) {
                    //if we already have a record with the given profile ID
                    done(null, currentUser);
                } else {
                    //if not, create a new user
                    new User({
                        firstName: profile.displayName || profile.username,
                        lastName: "!github!",
                        email: profile.emails[0].value,
                        isVerified: true,
                        githubId: profile.id,
                        password: "githubOAuth",
                    })
                        .save()
                        .then((newUser) => {
                            done(null, newUser);
                        });
                }
            } catch (err) {
                console.error(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const app = express();

app.set("port", process.env.PORT || 5000);

// app.use(cors());

var corsOptions = {
    origin: function (origin, callback) {
        // db.loadOrigins is an example call to load
        // a list of origins from a backing database
        db.loadOrigins(function (error, origins) {
            callback(error, origins);
        });
    },
};

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin); // "*"
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", true);
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

// import routes
app.use("/api/user", require("./routes/user"));
app.use("/api/events", require("./routes/events"));
app.use("/api/token", require("./routes/refreshToken"));

app.use("/", require("./routes/user.github"));
app.use("/", require("./routes/user.google"));
app.use("/", require("./routes/user.microsoft"));

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
