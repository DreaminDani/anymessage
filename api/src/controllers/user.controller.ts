/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response, Router } from "express";
import { checkJwt } from "../helpers";
import { TeamModel, UserModel } from "../models";

const router: Router = Router();

router.get("/login", checkJwt, async (req: Request, res: Response) => {
    try {
        const user = new UserModel(req.app.get("db"), req.user.email);
        await user.init();
        if (user.exists()) {
            let result: {};
            const teamId = user.getTeamId();
            if (teamId) {
                const team = new TeamModel(req.app.get("db"), teamId);
                await team.init();

                const subdomain = team.getSubdomain();
                if (subdomain) {
                    result = {
                        // todo handle SSL
                        redirectURI: `http://${subdomain}.${process.env.UI_HOSTNAME}/messages`,
                        teamURL: subdomain,
                    };
                }
            }
            res.status(200);
            res.json(result || {redirectURI: "/settings"});
        } else {
            const newUser = await user.create(req.user);
            if (newUser) {
                res.status(200);
                res.json({redirectURI: "/settings"});
            } else {
                throw new Error(newUser as unknown as string); // unknown error, throw the object
            }
        }
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({error: e.message}) : res.send();
    }
});

export const UserController: Router = router;
