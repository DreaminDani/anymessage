/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import redis = require("redis-mock");
import * as sinon from "sinon";
import { mockReq, mockRes } from "sinon-express-mock";

/* dependencies */
jest.mock("../../models/provider.model");
import { injectClient } from "../../lib/redis-connection";
import * as StripeService from "../../lib/StripeService";
import { ProviderModel } from "../../models/provider.model";

/* the thing(s) we're testing */
import { postAdd } from "./add.post";

const fakeCreatedTime = 234;
const fakeUpdatedTime = 123;

const outbound = sinon.spy(ProviderModel.prototype, "outbound");

let mockDB: any;
let req: any;
let res: any;
let expectedResponse: any[];

beforeAll(() => {
    injectClient(redis);
});

beforeEach(() => {
    mockDB = {
        conversations: {
            findOne: jest.fn((criteria: any, options: any) => {
                return {}; // TODO change this depending on if it exists already
            }),
            insert: jest.fn((criteria: any, options: any) => {
                return { ...criteria, id: 1, created: fakeUpdatedTime, updated: fakeUpdatedTime };
            }),
            update: jest.fn((criteria: any, options: any) => {
                return { ...criteria, created: fakeCreatedTime, updated: fakeUpdatedTime };
            }),
        },
        teams: {
            findOne: jest.fn((criteria: any, options: any) => {
                return {
                    subdomain: "example",
                };
            }),
        },
        users: {
            findOne: jest.fn((criteria: any, options: any) => {
                if (criteria.email === "joe@example.com") {
                    return {
                        id: 0,
                        teamId: 0,
                    };
                }
                return {};
            }),
        },
        teams_by_user: {
            find: jest.fn((criteria: any, options: any) => {
                return [{ "team_id": 0 }]
            })
        }
    };

    req = mockReq({
        app: {
            get: (name: string) => {
                return mockDB;
            },
        },
        body: {
            message: "test message",
            phoneNumber: 987654321,
            provider: "123456789",
        },
        team: {
            id: 0,
            subdomain: "example",
        },
        user: {
            email: "joe@example.com",
        },
    });

    res = mockRes({
        json: jest.fn(),
        status: jest.fn(),
    });

    expectedResponse = [{
        from: req.body.provider,
        history: expect.stringContaining(req.body.message),
        id: 1,
        team_id: req.team.id,
        to: req.body.phoneNumber.toString(),
        updated: fakeUpdatedTime,
    }];
});

describe("adding messages", () => {

    test("should respond with new message in new conversation", async () => {
        expectedResponse[0].created = fakeUpdatedTime;
        await postAdd(req, res);

        expect(req.app.get("db").conversations.insert).toBeCalled();
        // expect(publisherClient.publish).toBeCalled();
        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(expect.arrayContaining(expectedResponse));
    });

    test("should send message to outbound provider", async () => {
        await postAdd(req, res);
        // expect(publisherClient.publish).toBeCalled();
        expect(outbound.lastCall.args[0]).toBe(req.body.phoneNumber.toString());
        expect(outbound.lastCall.args[1]).toBe(req.body.message);
    });

    test("should update an existing conversation, if it already exists", async () => {
        mockDB.conversations.findOne = jest.fn((criteria: any, options: any) => {
            return {
                history: [],
                id: 0,
            };
        });

        await postAdd(req, res);

        expect(req.app.get("db").conversations.update).toBeCalled();
        // expect(publisherClient.publish).toBeCalled();
        expect(res.status).toBeCalledWith(200);
    });

});

describe("stripe integration", () => {
    beforeAll(() => {
        process.env.STRIPE_SECRETKEY = "set";
        const hasActiveSubscription = jest.fn().mockImplementation(async () => {
            return false;
        });
        Object.defineProperty(StripeService, "hasActiveSubscription", { value: hasActiveSubscription });
    });

    test("should append anymessage text to message if no active subscription", async () => {
        const extraMessage = " ~ sent with AnyMessage.io";
        await postAdd(req, res);
        expect(outbound.lastCall.args[1]).toBe(req.body.message + extraMessage);
    });

    test("should append anymessage text to message if no active subscription", async () => {
        Object.defineProperty(StripeService, "hasActiveSubscription", { value: jest.fn(() => true) });
        await postAdd(req, res);
        expect(outbound.lastCall.args[1]).toBe(req.body.message);
    });

    afterAll(() => {
        process.env.STRIPE_SECRETKEY = null;
    });
});

describe("errors", () => {
    test("should not return 200, if conversation returns empty", async () => {
        mockDB.conversations.insert = jest.fn((criteria: any, options: any) => {
            return {};
        });

        await postAdd(req, res);
        expect(res.status).toBeCalledWith(500);
    });

    test("should throw generic message if fails in unexpected way", async () => {
        mockDB.conversations.insert = jest.fn((criteria: any, options: any) => {
            throw new Error("some error");
        });

        await postAdd(req, res);
        expect(res.status).toBeCalledWith(500);
    });
});
