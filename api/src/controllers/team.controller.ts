/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Request, Response, Router } from "express";
import { checkJwt } from "../helpers";
import { ITeamRequest, verifySubdomain } from "../models";
import { TeamModel } from "../models";
import { UserModel } from "../models";

const router: Router = Router();

// get users's team URL
router.get("/url",
checkJwt,
verifySubdomain,
async (req: ITeamRequest, res: Response) => {
    try {
        const user = new UserModel(req.app.get("db"), req.user.email);
        await user.init();
        const teamId = user.getTeamId();

        let subdomain: string;
        if (teamId) {
            const team = new TeamModel(req.app.get("db"), teamId);
            await team.init();

            subdomain = team.getSubdomain();
        }

        res.status(200);
        res.send({teamURL: subdomain || ""});
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({error: e.message}) : res.send();
    }
});

router.post("/url/available",
checkJwt,
json(),
async (req: Request, res: Response) => {
    try {
        const available = await TeamModel.available(req.app.get("db"), req.body.newURL);
        res.status(200);
        res.send({available});
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({error: e.message}) : res.send();
    }
});

router.post("/url/set",
checkJwt,
json(),
async (req: Request, res: Response) => {
    try {
        // look up user by email (TODO generalize to more than auth0)
        const user = new UserModel(req.app.get("db"), req.user.email);
        await user.init();
        const teamId = user.getTeamId();

        if (teamId) {
            // if user has team_id, update its URL
            const team = new TeamModel(req.app.get("db"), teamId);
            await team.init();

            await team.setSubdomain(req.body.newURL);
        } else {
            // create a new team with URL
            const team = new TeamModel(req.app.get("db"));
            const newTeamId = await team.create(req.body.newURL);
            await user.setTeamId(newTeamId);
        }

        res.status(200);
        res.send({
            redirectHost: `//${req.body.newURL}.${process.env.UI_HOSTNAME}`,
        });
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({error: e.message}) : res.send();
    }
});

export const TeamController: Router = router;
