/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { mockReq, mockRes } from "sinon-express-mock";
import { getProviders } from "./providers.get";

let mockDB: any;
let req: any;
let res: any;

beforeEach(() => {
    mockDB = {
        query: jest.fn((criteria: any, options: any) => {
            return [];
        }),
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
        json: jest.fn(),
    });
});

test("should return providers list (empty in this test)", async () => {
    await getProviders(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith([]);
});

test("should catch internal error", async () => {
    req.app.get = (name: string) => {
        throw new Error("Some error");
    };

    await getProviders(req, res);
    expect(res.status).toBeCalledWith(500);
});
