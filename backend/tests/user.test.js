// tests/login.test.js
require("dotenv").config();

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const db = require("./db");
const User = mongoose.model("User");
const Code = mongoose.model("Code");

const TOKEN_PREFIX = require("../config").token_prefix;

const BASE_URL = "/api/user";

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

describe(`Testing '${BASE_URL}/login' API Endpoint`, () => {
    test("Testing a User Login with Populated DataBase", async () => {
        const loginInfo = {
            email: "andrewjamesjohn@outlook.com",
            password: "password",
        };

        const user = new User({
            firstName: "john",
            lastName: "doe",
            ...loginInfo,
        });

        await user.save();

        let res = await agent
            .post(`${BASE_URL}/login`)
            .type("json")
            .send(loginInfo)
            .expect(200);

        expect(res.body.token).toBeTruthy();
    });
});

describe(`Testing '${BASE_URL}/register' API Endpoint`, () => {
    beforeEach(async () => {
        await db.clear();
        global.mockMailer = (options = defaultMailOptions) => {
            return sgMail.send.mockImplementation(() =>
                Promise.resolve(options)
            );
        };

        const error = jest.spyOn(console, "error").mockImplementation(() => {});
        // error.mockReset();
    });

    test("Testing a User Registration", async () => {
        const registration = {
            firstName: "John",
            lastName: "Doe",
            email: "andrewjamesjohn@outlook.com",
            password: "!Password1",
            repeat_password: "!Password1",
        };

        let res = await agent
            .post(`${BASE_URL}/register`)
            .type("json")
            .send(registration)
            .expect(201);

        // check if user added to database
        const user = await User.findById(res.body._id);
        expect(user.firstName).toBe(registration.firstName);
        expect(user.lastName).toBe(registration.lastName);
        expect(user.email).toBe(registration.email);
        expect(user._id).toBeTruthy();
        expect(user._id.toString()).toEqual(res.body._id.toString());

        // check if code was created in database for email verification
        const code = await Code.findOne({ email: user.email });
        expect(code).toBeTruthy();
        expect(code.code.toString()).toBeTruthy();
        await db.clear();
    });

    test("Testing User Registration Validation", async () => {
        let registration = {
            firstName: "John",
            lastName: "Doe",
            email: "andrewjamesjohn@outlook.com",
            password: "!Password",
            repeat_password: "!Password",
        };

        let res = await agent
            .post(`${BASE_URL}/register`)
            .type("json")
            .send(registration)
            .expect(400);

        expect(res.body.error).toEqual(
            "Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character"
        );

        registration.password = "ss";
        res = await agent
            .post(`${BASE_URL}/register`)
            .type("json")
            .send(registration)
            .expect(400);

        expect(res.body.error).toEqual(
            "Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character"
        );

        Object.keys(registration).forEach(async (key) => {
            res = await agent
                .post(`${BASE_URL}/register`)
                .type("json")
                .send({ key: registration[key] })
                .expect(400);

            expect(res.body.error).toBeTruthy();
        });

        delete registration["repeat_password"];
        res = await agent
            .post(`${BASE_URL}/register`)
            .type("json")
            .send(registration)
            .expect(400);

        expect(res.body.error).toBeTruthy();
    });
});

describe(`Testing '${BASE_URL}/update' API Endpoint`, () => {
    beforeEach(async () => {
        global.mockMailer = (options = defaultMailOptions) => {
            return sgMail.send.mockImplementation(() =>
                Promise.resolve(options)
            );
        };
    });

    const registration = {
        firstName: "John",
        lastName: "Doe",
        email: "andrewjamesjohn@outlook.com",
        password: "!Password1",
        repeat_password: "!Password1",
    };

    let res;

    test("Register New User", async () => {
        res = await agent
            .post(`${BASE_URL}/register`)
            .type("json")
            .send(registration)
            .expect(201);
    });

    test("Verify New Account", async () => {
        const code = await Code.findOne({ email: registration.email });

        res = await agent
            .get(
                `/api/user/verification/verify-account/${res.body._id}/${code.code}`
            )
            .expect(302);
    });

    let token;

    test("Login with Verified User", async () => {
        res = await agent
            .post(`${BASE_URL}/login`)
            .type("json")
            .send({
                email: registration.email,
                password: registration.password,
            })
            .expect(200);

        token = res.body.token;
    });

    let updates = {};

    test("Update Only First Name", async () => {
        updates.firstName = "James";

        res = await agent
            .patch(`${BASE_URL}/update`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({ firstName: updates.firstName })
            .expect(200);

        // check the values in response
        expect(res.body.firstName).toBe(updates.firstName);
    });

    test("Update Only Last Name", async () => {
        updates.lastName = "John";

        res = await agent
            .patch(`${BASE_URL}/update`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({ lastName: updates.lastName })
            .expect(200);

        // check the values in response
        expect(res.body.lastName).toBe(updates.lastName);
    });

    test("Update Only Email", async () => {
        updates.email = "james@mail.net";

        res = await agent
            .patch(`${BASE_URL}/update`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({ email: updates.email })
            .expect(200);

        // check the values in response
        expect(res.body.email).toBe(updates.email);
    });

    test("Update Only Password", async () => {
        updates.password = "!Password2";
        updates.repeat_password = "!Password2";

        res = await agent
            .patch(`${BASE_URL}/update`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({
                password: updates.password,
                repeat_password: updates.repeat_password,
            })
            .expect(200);

        res = await agent
            .post(`${BASE_URL}/login`)
            .type("json")
            .send({
                email: updates.email,
                password: updates.password,
            })
            .expect(200);

        // check the values in response
        expect(res.body.token).toBeTruthy();

        res = await agent
            .post(`${BASE_URL}/login`)
            .type("json")
            .send({
                email: updates.email,
                password: updates.password,
            })
            .expect(200);
    });

    test("Update Entire User Profile for Account", async () => {
        updates = {
            firstName: registration.firstName,
            lastName: registration.lastName,
            email: registration.email,
            password: registration.password,
            repeat_password: registration.password,
        };

        res = await agent
            .patch(`${BASE_URL}/update`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send(updates)
            .expect(200);

        // check the values in response
        expect(res.body.firstName).toBe(updates.firstName);
        expect(res.body.lastName).toBe(updates.lastName);
        expect(res.body.email).toBe(updates.email);

        res = await agent
            .post(`${BASE_URL}/login`)
            .type("json")
            .send({
                email: updates.email,
                password: updates.password,
            })
            .expect(200);
    });
});

describe(`Testing '${BASE_URL}/verification/get-activation-email' API Endpoint`, () => {
    beforeEach(async () => {
        global.mockMailer = (options = defaultMailOptions) => {
            return sgMail.send.mockImplementation(() =>
                Promise.resolve(options)
            );
        };
    });

    let res;
    let token;

    test("Creating account and getting token", async () => {
        await db.clear();
        const registration = {
            firstName: "John",
            lastName: "Doe",
            email: "andrewjamesjohn@outlook.com",
            password: "!Password1",
            repeat_password: "!Password1",
        };

        res = await agent
            .post(`${BASE_URL}/register`)
            .type("json")
            .send(registration)
            .expect(201);

        token = res.body.token;
    });

    test("Ping the Get Activation Email API", async () => {
        res = await agent
            .get(`${BASE_URL}/verification/get-activation-email`)
            .set("Authorization", TOKEN_PREFIX + token)
            .expect(200);
        expect(res.body.success).toBe(true);
        await db.clear();
    });
});

describe(`Testing '${BASE_URL}/delete-account' API Endpoint`, () => {
    beforeEach(async () => {
        await db.clear();
        global.mockMailer = (options = defaultMailOptions) => {
            return sgMail.send.mockImplementation(() =>
                Promise.resolve(options)
            );
        };
    });

    test("Creating an account and Deleting it", async () => {
        const registration = {
            firstName: "John",
            lastName: "Doe",
            email: "andrewjamesjohn@outlook.com",
            password: "!Password1",
            repeat_password: "!Password1",
        };

        let res = await agent
            .post(`${BASE_URL}/register`)
            .type("json")
            .send(registration)
            .expect(201);

        const token = res.body.token;

        res = await agent
            .delete(`${BASE_URL}/delete-account`)
            .set("Authorization", TOKEN_PREFIX + token)
            .type("json")
            .send({ password: registration.password })
            .expect(200);
        expect(res.body.success).toBe(true);
        await db.clear();
    });
});
