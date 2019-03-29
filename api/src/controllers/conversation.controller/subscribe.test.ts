/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import redis = require("redis-mock");
import { mockReq, mockRes } from "sinon-express-mock";

jest.mock("../../lib/redis-connection");
import { eventSubscription, injectClient } from "../../lib/redis-connection";
import { getSubscribe } from "./subscribe.get";

let req: any;
let res: any;

beforeAll(() => {
    injectClient(redis);
});

beforeEach(() => {
    req = mockReq({
        cookies: {
            id_token: "anything",
            team_url: "example.anymessage.io",
        },
    });
    res = mockRes({
        send: jest.fn(),
    });
});

test("should start an event subscription on the provided key", async () => {
    await getSubscribe(req, res);
    const subdomain = req.cookies.team_url.split(".")[0];
    expect(eventSubscription).toBeCalledWith(subdomain, req, res);
});

test("should give 400 response if no id_token provided", async () => {
    req.cookies.id_token = undefined;
    await getSubscribe(req, res);
    expect(res.send).toBeCalledWith(400);
});

test("should give 400 response if no team_url provided", async () => {
    req.cookies.team_url = undefined;
    await getSubscribe(req, res);
    expect(res.send).toBeCalledWith(400);
});
