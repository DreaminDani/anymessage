/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response, Router } from "express";
import helpers = require("../helpers");
import { UserModel } from "../models";

const router: Router = Router();

router.get("/login", helpers.checkJwt, async (req: Request, res: Response) => {
    const userModel = new UserModel(req.app.get("db"), req.user.email);
    try {
        const existingUser = await userModel.login();
        if (existingUser) {
            res.status(200);
            res.json(existingUser);
        } else {
            const newUser = await userModel.create(req.user);
            if (newUser) {
                res.status(200);
                res.json({redirectURI: "/settings"});
            } else {
                throw new Error(newUser); // unknown error, throw the object
            }
        }
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        res.send(e.message || "");
    }
});

export const UserController: Router = router;
