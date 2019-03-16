import redis = require("redis-mock");
import * as sinon from "sinon";
import { mockReq, mockRes } from "sinon-express-mock";

/* dependencies */
jest.mock("../../lib/redis-connection");
jest.mock("../../models/provider.model");
import { closeAll, injectClient, publisherClient } from "../../lib/redis-connection";
import * as StripeService from "../../lib/StripeService";
import { ProviderModel } from "../../models/provider.model";

/* the thing(s) we're testing */
import { postAdd } from "./add.post";

const fakeCreatedTime = 234;
const fakeUpdatedTime = 123;

const outbound = sinon.spy(ProviderModel.prototype, "outbound");

let mockDB: any;
let request: any;
let response: any;
let req: any;
let res: any;
let expectedResponse: any[];

beforeEach(() => {
    injectClient(redis);
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
    };
    request = {
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
    };

    response = {
        json: jest.fn(),
        status: jest.fn(),
    };

    req = mockReq(request);
    res = mockRes(response);

    expectedResponse = [{
        from: request.body.provider,
        history: expect.stringContaining(request.body.message),
        id: 1,
        team_id: request.team.id,
        to: request.body.phoneNumber.toString(),
        updated: fakeUpdatedTime,
    }];
});

afterAll(() => {
    closeAll();
});

describe("adding messages", () => {

    test("should respond with new message in new conversation", async () => {
        expectedResponse[0].created = fakeUpdatedTime;
        await postAdd(req, res);

        expect(req.app.get("db").conversations.insert).toBeCalled();
        expect(publisherClient.publish).toBeCalled();
        expect(res.status).toBeCalledWith(200);
        expect(res.json).toBeCalledWith(expect.arrayContaining(expectedResponse));
    });

    test("should send message to outbound provider", async () => {
        await postAdd(req, res);
        expect(publisherClient.publish).toBeCalled();
        expect(outbound.lastCall.args[0]).toBe(request.body.phoneNumber.toString());
        expect(outbound.lastCall.args[1]).toBe(request.body.message);
    });

    test("should update an existing conversation, if it already exists", async () => {
        mockDB.conversations.findOne = jest.fn((criteria: any, options: any) => {
            return {
                history: [],
                id: 0,
            };
        });
        request.app.get = (name: string) => mockDB;

        await postAdd(mockReq(request), res);

        expect(req.app.get("db").conversations.update).toBeCalled();
        expect(publisherClient.publish).toBeCalled();
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
        expect(outbound.lastCall.args[1]).toBe(request.body.message + extraMessage);
    });

    test("should append anymessage text to message if no active subscription", async () => {
        Object.defineProperty(StripeService, "hasActiveSubscription", { value: jest.fn(() => true) });
        await postAdd(req, res);
        expect(outbound.lastCall.args[1]).toBe(request.body.message);
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
        request.app.get = (name: string) => mockDB;

        await postAdd(mockReq(request), res);
        expect(res.status).toBeCalledWith(500);
    });

    test("should throw generic message if fails in unexpected way", async () => {
        mockDB.conversations.insert = jest.fn((criteria: any, options: any) => {
            throw new Error("some error");
        });
        request.app.get = (name: string) => mockDB;

        await postAdd(mockReq(request), res);
        expect(res.status).toBeCalledWith(500);
    });

    test("should throw a 400 error if user does not exist", async () => {
        request.user.email = "sally@example.com";

        await postAdd(mockReq(request), res);
        expect(res.status).toBeCalledWith(400);
        expect(res.json).toBeCalledWith(expect.any(Object));
    });
});
