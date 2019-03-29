/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response } from "express";

export const getDetails = (req: Request, res: Response) => {
    if (req.user) {
        res.status(200);
        res.json(req.user);
    } else {
        console.error("req.user is not defined");
        res.status(500);
        res.send();
    }
}