import redis = require("redis-mock");
import * as sinon from "sinon";
import { mockReq, mockRes } from "sinon-express-mock";
import { closeAll, injectClient, publisherClient } from "../../lib/redis-connection";
import { ProviderModel } from "../../models/provider.model";
import { postAdd } from "./add.post";

jest.mock("../../models/provider.model");

const fakeCreatedTime = 234;
const fakeUpdatedTime = 123;

const mockDB = {
    conversations: {
        findOne: jest.fn((criteria: any, options: any) => {
            return {}; // TODO change this depending on if it exists already
        }),
        insert: jest.fn((criteria: any, options: any) => {
            return { ...criteria, created: fakeUpdatedTime, updated: fakeUpdatedTime };
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
            return {
                id: 0,
                teamId: 0,
            };
        }),
    },
};

const request = {
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

const response = {
    json: jest.fn(),
    status: jest.fn(),
};

const req = mockReq(request);
const res = mockRes(response);
let expectedResponse: any[];

beforeAll(() => {
    injectClient(redis);
});

beforeEach(() => {
    expectedResponse = [{
        from: request.body.provider,
        history: expect.stringContaining(request.body.message),
        team_id: request.team.id,
        to: request.body.phoneNumber.toString(),
        updated: fakeUpdatedTime,
    }];
});

afterAll(() => {
    closeAll();
});

test("should respond with new message in new conversation", async () => {
    expectedResponse[0].created = fakeUpdatedTime;
    await postAdd(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(expect.arrayContaining(expectedResponse));
});

test("should send message to outbound provider", async () => {
    await postAdd(req, res);

    const outbound = sinon.spy(ProviderModel.prototype, "outbound");
    expect(outbound).toBeCalledWith(request.body.phoneNumber.toString(), request.body.message);
});

test("should respond with updated conversation, if it already exists", async () => {
    expectedResponse[0].created = fakeCreatedTime;
    await postAdd(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(expect.arrayContaining(expectedResponse));
});

test("should throw specific error if create fails", () => {

});

test("should throw generic message if fails in unexpected way", () => {

});

test("should throw a 400 error if user does not exist", () => {

});
