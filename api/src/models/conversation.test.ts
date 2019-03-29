import { NextFunction } from "express";
import { mockReq, mockRes } from "sinon-express-mock";

import { verifyOutboundMessage } from "./conversation.model";

let request: any;
let response: any;
let res: any;
let next: NextFunction;

beforeEach(() => {
    next = jest.fn();
    request = {
        team: {
            id: 0,
            subdomain: "example",
        },
    };
    response = {
        json: jest.fn(),
        status: jest.fn(),
    };
    res = mockRes(response);
});

test("a well-formed body passes", () => {
    request.body = {
        message: "test",
        phoneNumber: 987654321,
        provider: "123456789",
    };
    const req = mockReq(request);

    verifyOutboundMessage(req, res, next);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(req.body).toBe(request.body);
});

test("respond with user error when the phoneNumber is missing", () => {
    request.body = {
        message: "test",
        provider: "123456789",
    };
    const req = mockReq(request);

    verifyOutboundMessage(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ error: "phoneNumber is required" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
});

test("respond with user error when the message is missing", () => {
    request.body = {
        phoneNumber: 987654321,
        provider: "123456789",
    };
    const req = mockReq(request);

    verifyOutboundMessage(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ error: "message is required" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
});

test("respond with user error when the phoneNumber is not a number", () => {
    request.body = {
        message: "test",
        phoneNumber: "abc",
        provider: "123456789",
    };
    const req = mockReq(request);

    verifyOutboundMessage(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ error: "phoneNumber must only contain numbers [0-9]" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
});

// todo test provider access (in a describe)
test("respond with user error when the provider is missing", () => {
    request.body = {
        message: "test",
        phoneNumber: "abc",
    };
    const req = mockReq(request);

    verifyOutboundMessage(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ error: "provider is required" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
});
