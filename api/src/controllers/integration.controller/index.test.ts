/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { mockReq, mockRes } from "sinon-express-mock";
import { getIndex } from "./index.get";

let mockDB: any;
let req: any;
let res: any;

beforeEach(() => {
    mockDB = {
        integrations: {
            findOne: jest.fn((criteria: any, options: any) => {
                return {
                    authentication: { someKey: "some value" },
                    providers: [], // this might end up being a key value store (should we test this?)
                    id: 0,
                };
            }),
        },
    };

    req = mockReq({
        app: {
            get: (name: string) => {
                return mockDB;
            },
        },
        team: {
            id: 0,
            subdomain: "example",
        },
        query: {
            name: "example",
        },
    });
    res = mockRes({
        status: jest.fn(),
        send: jest.fn(),
        sendStatus: jest.fn(),
    });
});

test("should return integration info, if integration found", async () => {
    await getIndex(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledWith({
        authentication: { someKey: "some value" },
        providers: [],
    });
});

test("should return an empty 200 when no integration found", async () => {
    mockDB.integrations.findOne = () => ({});
    req.app.get = (name: string) => mockDB;
    await getIndex(req, res);

    expect(res.sendStatus).toBeCalledWith(200);
});

test("should throw 400 if integration not provided in query", async () => {
    req.query = {};
    await getIndex(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledWith({ error: "you must provide an integration 'name'" });
});

test("should catch internal error", async () => {
    req.app.get = (name: string) => {
        throw new Error("Some error");
    };

    await getIndex(req, res);
    expect(res.status).toBeCalledWith(500);
});
