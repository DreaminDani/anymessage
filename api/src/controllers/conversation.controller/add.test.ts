import { mockReq, mockRes } from "sinon-express-mock";
import { closeAll, publisherClient } from "../../lib/redis-connection";
import { ProviderModel } from "../../models/provider.model";
import { postAdd } from "./add.post";

jest.mock("../../models/provider.model");

const mockDB = {
    conversations: {
        findOne: jest.fn((criteria: any, options: any) => {
            return [];
        }),
        insert: jest.fn((criteria: any, options: any) => {
            return { ...criteria, created: 123, updated: 123 };
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

afterAll(() => {
    closeAll();
});

test("should respond with new message in new conversation", async () => {
    await postAdd(req, res);

    expect(res.status).toBeCalledWith(200);
});

test("should update existing conversation with new message", () => {

});

test("should throw specific error if create fails", () => {

});

test("should throw generic message if fails in unexpected way", () => {

});

test("should throw a 400 error if user does not exist", () => {

});
