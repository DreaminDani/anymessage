/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import redis = require("redis-mock");
import { mockReq, mockRes } from "sinon-express-mock";
import { postIndex } from "./index.post";

// jest.mock("../../lib/redis-connection");
import { injectClient } from "../../lib/redis-connection";

const fakeCreatedTime = 234;
const fakeUpdatedTime = 123;

let mockDB: any;
let request: any;
let response: any;
let req: any;
let res: any;

beforeAll(() => {
    injectClient(redis);
});

beforeEach(() => {
    mockDB = {
        conversations: {
            findOne: jest.fn((criteria: any, options: any) => {
                return {};
            }),
            insert: jest.fn((criteria: any, options: any) => {
                return { ...criteria, id: 1, created: fakeUpdatedTime, updated: fakeUpdatedTime };
            }),
            update: jest.fn((criteria: any, options: any) => {
                return { ...criteria, created: fakeCreatedTime, updated: fakeUpdatedTime };
            }),
        },
        query: jest.fn((criteria: any, options: any) => {
            // this could be mocked better... but it's only used in findTeamByProvider for now
            return [{
                id: 0,
                subdomain: "example",
                customer_id: "cus_123",
            }];
        }),
        integrations: {
            findOne: jest.fn((criteria: any, options: any) => {
                return {
                    name: "testint",
                    team_id: 0, // This will always match query response, above
                }; // TODO change this to test error case
            }),
        },
    };
    request = {
        app: {
            get: (name: string) => {
                return mockDB;
            },
        },
        params: { integration: "twilio" }, // will be used to test variances based on /:integration
        body: {
            To: "123456789",
            From: "987654321",
            Body: "test message",
        },
    };

    response = {
        writeHead: jest.fn(),
        end: jest.fn(),
        sendStatus: jest.fn(),
    };

    req = mockReq(request);
    res = mockRes(response);
});

describe("adding messages", () => {

    test("should create new message in new conversation", async () => {
        await postIndex(req, res);

        expect(req.app.get("db").conversations.insert).toBeCalled();
        // expect(createPublisherClient).toBeCalled();

        // todo split this between passed /:integration
        expect(res.writeHead).toBeCalledWith(200, { "Content-Type": "text/xml" });
        expect(res.end).toBeCalledWith("<Response></Response>");
    });

    test("should update an existing conversation, if it already exists", async () => {
        mockDB.conversations.findOne = jest.fn((criteria: any, options: any) => {
            return {
                history: [],
                id: 0,
            };
        });
        request.app.get = (name: string) => mockDB;

        await postIndex(mockReq(request), res);

        expect(req.app.get("db").conversations.update).toBeCalled();
        // expect(createPublisherClient).toBeCalled();

        // todo split this between passed /:integration
        expect(res.writeHead).toBeCalledWith(200, { "Content-Type": "text/xml" });
        expect(res.end).toBeCalledWith("<Response></Response>");
    });

});

describe("errors", () => {
    test("should not return 200, if conversation returns empty", async () => {
        mockDB.conversations.insert = jest.fn((criteria: any, options: any) => {
            return {};
        });
        request.app.get = (name: string) => mockDB;

        await postIndex(mockReq(request), res);
        expect(res.sendStatus).toBeCalledWith(500);
    });

    test("should throw generic message if fails in unexpected way", async () => {
        mockDB.conversations.insert = jest.fn((criteria: any, options: any) => {
            throw new Error("some error");
        });
        request.app.get = (name: string) => mockDB;

        await postIndex(mockReq(request), res);
        expect(res.sendStatus).toBeCalledWith(500);
    });

    test("should respond with warning if provider not found", async () => {
        mockDB.query = jest.fn((criteria: any, options: any) => {
            return {};
        });
        request.app.get = (name: string) => mockDB;

        await postIndex(mockReq(request), res);

        // todo split this between passed /:integration
        expect(res.writeHead).toBeCalledWith(200, { "Content-Type": "text/xml" });
        expect(res.end).toBeCalledWith(`<Response>
                    This provider has not yet been set up. Please try again later.
                    </Response>`);
    });
});
