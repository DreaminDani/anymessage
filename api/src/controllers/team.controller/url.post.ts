/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response } from "express";
import { ITeamRequest, TeamModel, UserModel } from "../../models";

export const postUrlAvailable = async (req: Request, res: Response) => {
    try {
        const available = await TeamModel.available(req.app.get("db"), req.body.newURL);
        res.status(200);
        res.send({ available });
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({ error: e.message }) : res.send();
    }
}

export const postUrlSet = async (req: ITeamRequest, res: Response) => {
    if (req.body.newURL) {
        try {
            if (req.team.id) {
                // if user has team_id, update its URL
                const team = new TeamModel(req.app.get("db"), req.team.id);
                await team.init();

                await team.setSubdomain(req.body.newURL);
            } else {
                // create a new team with URL 
                const team = new TeamModel(req.app.get("db"));
                const newTeamId = await team.create(req.body.newURL);

                const user = new UserModel(req.app.get("db"), req.user.email);
                await user.init();
                await user.setTeamId(newTeamId);
            }

            res.status(200);
            res.send({
                redirectHost: `//${req.body.newURL}.${process.env.UI_HOSTNAME}`,
            });
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    } else {
        res.status(200);
        res.send({
            message: "No newURL sent",
        });
    }
}