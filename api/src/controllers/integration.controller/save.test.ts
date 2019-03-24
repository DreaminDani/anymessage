/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { mockReq, mockRes } from "sinon-express-mock";
import { postSave } from "./save.post";

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
            save: jest.fn((criteria: any, options: any) => {
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
    });
    res = mockRes({
        status: jest.fn(),
        sendStatus: jest.fn(),
    });
});

test("should return with 200 on successful save", async () => {
    await postSave(req, res);
    expect(mockDB.integrations.save).toBeCalled();
    expect(res.sendStatus).toBeCalledWith(200);
});

test("should catch internal error", async () => {
    req.app.get = (name: string) => {
        throw new Error("Some error");
    };

    await postSave(req, res);
    expect(res.status).toBeCalledWith(500);
});
