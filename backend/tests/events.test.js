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

// Setup connection to the Database
beforeAll(async () => {
    await db.connect();
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
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
        startTime: "2021-05-21T22:20:43.415Z",
        endTime: "2021-05-21T22:20:43.415Z",
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
        startTime: "2021-05-22T22:20:43.415Z",
        endTime: "2021-05-22T22:20:43.415Z",
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

describe(`Test '${BASE_URL}/create' API Endpoint`, () => {
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

    test("Test Creation of Events to Populate Database", async () => {
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
        expect(res.body[0]).toEqual(expect.objectContaining(events[0]));
        expect(res.body[1]).toEqual(expect.objectContaining(events[1]));
        expect(res.body[2]).toEqual(expect.objectContaining(events[2]));
        expect(res.body[3]).toEqual(expect.objectContaining(events[4]));
        expect(res.body[4]).toEqual(expect.objectContaining(events[3]));
    });
});

describe("Test Searching Events with Database Populated from Create Test", () => {
    beforeEach(async () => {
        global.mockMailer = (options = defaultMailOptions) => {
            return sgMail.send.mockImplementation(() =>
                Promise.resolve(options)
            );
        };
    });

    let token;

    test("Login with Verified User", async () => {
        const sleep = (ms) => {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        };
        await sleep(100);

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

    test("Test Search with No Parameters", async () => {
        res = await agent
            .get(`${BASE_URL}/`)
            .set("Authorization", TOKEN_PREFIX + token)
            .expect(200);

        expect(res.body.length).toBe(5);
    });

    test("Test Search with startDate AND endData parameters", async () => {
        res = await agent
            .get(
                `${BASE_URL}/?startDate=2021-05-01T22:20:43.415Z&endDate=2021-05-30T22:20:43.415Z`
            )
            .set("Authorization", TOKEN_PREFIX + token)
            .expect(200);

        expect(res.body.length).toBe(3);
        expect(res.body[0]).toEqual(expect.objectContaining(events[1]));
        expect(res.body[1]).toEqual(expect.objectContaining(events[2]));
        expect(res.body[2]).toEqual(expect.objectContaining(events[4]));
    });

    test("Test Search with startDate, endDate, and search parameters", async () => {
        res = await agent
            .get(
                `${BASE_URL}/?search=Event 5&startDate=2021-05-01T22:20:43.415Z&endDate=2021-05-30T22:20:43.415Z`
            )
            .set("Authorization", TOKEN_PREFIX + token)
            .expect(200);

        expect(res.body.length).toBe(1);
        expect(res.body[0]).toEqual(expect.objectContaining(events[4]));
    });

    test("Test Search with Only startDate parameters", async () => {
        res = await agent
            .get(`${BASE_URL}/?startDate=2021-05-01T22:20:43.415Z`)
            .set("Authorization", TOKEN_PREFIX + token)
            .expect(200);

        expect(res.body.length).toBe(4);
        expect(res.body[0]).toEqual(expect.objectContaining(events[1]));
        expect(res.body[1]).toEqual(expect.objectContaining(events[2]));
        expect(res.body[2]).toEqual(expect.objectContaining(events[4]));
        expect(res.body[3]).toEqual(expect.objectContaining(events[3]));
    });
});

describe(`Test '${BASE_URL}/update' API Endpoint`, () => {
    beforeEach(async () => {
        global.mockMailer = (options = defaultMailOptions) => {
            return sgMail.send.mockImplementation(() =>
                Promise.resolve(options)
            );
        };
    });

    let res;
    let token;

    let eventsFromDB;
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

    test("Get EventIDs from Database", async () => {
        res = await agent
            .get(`${BASE_URL}/`)
            .set("Authorization", TOKEN_PREFIX + token)
            .expect(200);

        expect(res.body.length).toBe(5);
        eventsFromDB = res.body;
    });

    let updates = {};

    test("Update Each Field of an Event Individually", async () => {
        updates.newTitle = "Event 1 is the best";
        res = await agent
            .patch(`${BASE_URL}/update/${eventsFromDB[0]._id}`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({ title: updates.newTitle })
            .expect(200);

        expect(res.body.title).toEqual(updates.newTitle);

        updates.newLocation = "Location 1 is Obviously the best";
        res = await agent
            .patch(`${BASE_URL}/update/${eventsFromDB[0]._id}`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({ location: updates.newLocation })
            .expect(200);

        expect(res.body.title).toEqual(updates.newTitle);
        expect(res.body.location).toEqual(updates.newLocation);

        updates.newDescription =
            "This is gonna be the best event because reasons";
        res = await agent
            .patch(`${BASE_URL}/update/${eventsFromDB[0]._id}`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({ description: updates.newDescription })
            .expect(200);

        expect(res.body.title).toEqual(updates.newTitle);
        expect(res.body.location).toEqual(updates.newLocation);
        expect(res.body.description).toEqual(updates.newDescription);

        updates.newStart = Date.now();
        updates.newEnd = Date.now() + 60 * 60;
        res = await agent
            .patch(`${BASE_URL}/update/${eventsFromDB[0]._id}`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({ endTime: updates.newEnd, startTime: updates.newStart })
            .expect(200);

        expect(res.body.title).toEqual(updates.newTitle);
        expect(res.body.location).toEqual(updates.newLocation);
        expect(res.body.description).toEqual(updates.newDescription);
        expect(new Date(res.body.startTime).toString()).toEqual(
            new Date(updates.newStart).toString()
        );
        expect(new Date(res.body.endTime).toString()).toEqual(
            new Date(updates.newEnd).toString()
        );
    });

    describe("Test Update Events", () => {});
});

describe("Test Deleting Events", () => {
    beforeEach(async () => {
        global.mockMailer = (options = defaultMailOptions) => {
            return sgMail.send.mockImplementation(() =>
                Promise.resolve(options)
            );
        };
    });

    let eventsFromDB;
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

    test("Get EventIDs from Database", async () => {
        res = await agent
            .get(`${BASE_URL}/`)
            .set("Authorization", TOKEN_PREFIX + token)
            .expect(200);

        expect(res.body.length).toBe(5);
        eventsFromDB = res.body;
    });

    test("Delete Each Event Created in Earlier Test from Database", async () => {
        let total = 5;

        Object.keys(eventsFromDB).forEach(async (key) => {
            res = await agent
                .delete(`${BASE_URL}/remove/${eventsFromDB[key]._id}`)
                .set("Authorization", TOKEN_PREFIX + token)
                .expect(200);

            expect(res.body.success).toEqual(true);
            expect(res.body.deletedCount).toEqual(1);
            expect(res.body.ok).toEqual("ok");

            res = await agent
                .get(`${BASE_URL}/`)
                .set("Authorization", TOKEN_PREFIX + token)
                .expect(200);

            expect(res.body.length).toBe(--total);
        });
    });
});
