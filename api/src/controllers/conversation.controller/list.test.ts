/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { mockReq, mockRes } from "sinon-express-mock";
import { getList } from "./list.get";

let mockDB: any;
let req: any;
let res: any;

beforeEach(() => {
    mockDB = {
        conversations: {
            find: jest.fn((criteria: any, options: any) => {
                return { success: true };
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
        json: jest.fn(),
        status: jest.fn(),
    });
});

test("should return the result of a find on conversations", async () => {
    await getList(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({ success: true });
});

test("should return filtered result by given team id", async () => {
    await getList(req, res);
    expect(req.app.get("db").conversations.find).toBeCalledWith({ team_id: req.team.id }, expect.any(Object));
});

test("should catch internal error", async () => {
    req.app.get = (name: string) => {
        throw new Error("Some error");
    };

    await getList(req, res);
    expect(res.status).toBeCalledWith(500);
});
