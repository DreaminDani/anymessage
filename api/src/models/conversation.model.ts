/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { NextFunction, Request, Response } from "express";
// getConversationsByTeam(teamId)

// parse the "add" function into pieces

/*
* Middelware for use in controllers
*/
interface IConversationRequestBody {
    phoneNumber?: string;
    message?: string;
    username?: string; // todo - acutally POST the username/id?
}
interface IConversationRequest extends Request {
    body: IConversationRequestBody;
}

/**
 * Middleware that verifies a JSON-parsed Express request has all the data necessary to run
 */
export function verifyOutboundMessage(req: IConversationRequest, res: Response, next: NextFunction) {
    let passed = true;
    console.log(req.body);
    if (!req.body.phoneNumber || req.body.phoneNumber.length < 1) {
        passed = false;
        res.status(400);
        res.json({error: "phoneNumber is required"});
    }

    // check if message is formatted correctly
    if (!req.body.message || req.body.message.length < 1) {
        passed = false;
        res.status(400);
        res.json({error: "message is required"});
    }

    // check that phone number is a number
    if (!/^\d+$/.test(req.body.phoneNumber)) {
        passed = false;
        res.status(400);
        res.json({error: "phoneNumber must only contain numbers [0-9]"});
    }

    // todo validate username/id

    if (passed) {
        // todo sanitize message before moving on
        next();
    }
}
