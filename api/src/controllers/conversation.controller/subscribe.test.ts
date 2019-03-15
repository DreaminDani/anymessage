import { mockReq, mockRes } from "sinon-express-mock";
import { closeAll, eventSubscription } from "../../lib/redis-connection";
import { getSubscribe } from "./subscribe.get";

jest.mock("../../lib/redis-connection");

const request = {
    cookies: {
        id_token: "anything",
        team_url: "example.anymessage.io",
    },
};

const response = {
    send: jest.fn(),
};

const req = mockReq(request);
const res = mockRes(response);

afterAll(() => {
    closeAll();
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
