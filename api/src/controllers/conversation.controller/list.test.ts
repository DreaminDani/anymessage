import { mockReq, mockRes } from "sinon-express-mock";
import { getList } from "./list.get";

const mockDB = {
    conversations: {
        find: jest.fn((criteria: any, options: any) => {
            return { success: true };
        }),
    },
};

const request = {
    app: {
        get: (name: string) => {
            return mockDB;
        },
    },
    team: {
        id: 0,
        subdomain: "example",
    },
};

const response = {
    json: jest.fn(),
    status: jest.fn(),
};

const req = mockReq(request);
const res = mockRes(response);

test("should return the result of a find on conversations", async () => {
    await getList(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({ success: true });
});

test("should return filtered result by given team id", async () => {
    await getList(req, res);
    expect(req.app.get("db").conversations.find).toBeCalledWith({ team_id: request.team.id }, expect.any(Object));
});

test("should catch internal error", async () => {
    req.app.get = (name: string) => {
        throw new Error("Some error");
    };

    await getList(req, res);
    expect(res.status).toBeCalledWith(500);
});
