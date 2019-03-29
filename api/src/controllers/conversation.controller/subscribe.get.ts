/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response } from "express";

import { eventSubscription } from "../../lib/redis-connection";

export const getSubscribe = (req: Request, res: Response) => {
    // TODO verify user is authorized to access team_url (throw 403, if not)
    if (req.cookies.id_token && req.cookies.team_url) {
        const subdomain = req.cookies.team_url.split(".")[0];
        eventSubscription(subdomain, req, res);
    } else {
        console.log("user is attempting to subscribe to conversations without the proper cookies");
        res.send(400);
    }
};
