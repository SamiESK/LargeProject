// tests/events.test.js
require("dotenv").config();

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const db = require("./db");
const Code = mongoose.model("Code");
const Event = mongoose.model("Event");
const User = mongoose.model("User");

const TOKEN_PREFIX = require("../config").token_prefix;

const BASE_URL = "/api/events";

const USER_URL = "/api/user";

// Pass supertest agent for each test
const agent = request.agent(app);

jest.setTimeout(15000);

jest.mock("@sendgrid/mail");
const sgMail = require("@sendgrid/mail");
const defaultMailOptions = { response: "Okay" };

// Setup connection to the database
beforeAll(async () => {
    await db.connect();
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
});

afterAll(async () => {
    await db.close();
    jest.clearAllMocks();
});

const events = [
    {
        title: "Event 1",
        description: "Description 1",
        location: "Location 1",
        startTime: "2021-04-20T22:20:43.415Z",
        endTime: "2021-04-20T22:20:43.415Z",
    },
    {
        title: "Event 2",
        description: "Description 2",
        location: "Location 2",
        startTime: "2021-05-20T22:20:43.415Z",
        endTime: "2021-05-20T22:20:43.415Z",
    },
    {
        title: "Event 3",
        description: "Description 3",
        location: "Location 3",
        startTime: "2021-05-20T22:20:43.415Z",
        endTime: "2021-05-20T22:20:43.415Z",
    },
    {
        title: "Event 4",
        description: "Description 4",
        location: "Location 4",
        startTime: "2021-06-20T22:20:43.415Z",
        endTime: "2021-06-20T22:20:43.415Z",
    },
    {
        title: "Event 5",
        description: "Description 5",
        location: "Location 5",
        startTime: "2021-05-20T22:20:43.415Z",
        endTime: "2021-05-20T22:20:43.415Z",
    },
];

const loginInfo = {
    email: "some@email.com",
    password: "Passw0rd!",
};

const registration = {
    ...loginInfo,
    repeat_password: loginInfo.password,
    firstName: "John",
    lastName: "Doe",
};

describe(`Testing '${BASE_URL}/' API Endpoint`, () => {
    beforeEach(async () => {
        global.mockMailer = (options = defaultMailOptions) => {
            return sgMail.send.mockImplementation(() =>
                Promise.resolve(options)
            );
        };
    });

    let res;

    test("Register New User", async () => {
        res = await agent
            .post(`${USER_URL}/register`)
            .type("json")
            .send(registration)
            .expect(201);
    });

    test("Verify New Account", async () => {
        const code = await Code.findOne({ email: registration.email });

        res = await agent
            .get(
                `${USER_URL}/verification/verify-account/${res.body._id}/${code.code}`
            )
            .expect(302);
    });

    let token;

    test("Login with Verified User", async () => {
        res = await agent
            .post(`${USER_URL}/login`)
            .type("json")
            .send({
                email: registration.email,
                password: registration.password,
            })
            .expect(200);

        token = res.body.token;
    });

    test("Testing Searching Events with a Populated DataBase", async () => {
        events.forEach(async (element) => {
            res = await agent
                .post(`${BASE_URL}/create`)
                .set("Authorization", TOKEN_PREFIX + token)
                .type("json")
                .send(element)
                .expect(200);
        });

        res = await agent
                .get(`${BASE_URL}/`)
                .set("Authorization", TOKEN_PREFIX + token)
                .expect(200);

        expect(res.body.length).toBe(5);

        res = await agent
                .get(`${BASE_URL}/?startDate=2021-05-01T22:20:43.415Z&endDate=2021-05-30T22:20:43.415Z`)
                .set("Authorization", TOKEN_PREFIX + token)
                .expect(200);

        expect(res.body.length).toBe(3);

        res = await agent
                .get(`${BASE_URL}/?search=Event 5&startDate=2021-05-01T22:20:43.415Z&endDate=2021-05-30T22:20:43.415Z`)
                .set("Authorization", TOKEN_PREFIX + token)
                .expect(200);

        expect(res.body.length).toBe(1);
    });
});
