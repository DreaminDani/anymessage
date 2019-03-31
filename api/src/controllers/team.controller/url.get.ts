/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Response } from "express";
import { ITeamRequest, TeamModel, UserModel } from "../../models";

export const getUrl = async (req: ITeamRequest, res: Response) => {
    try {
        let subdomain: string;
        if (req.team.id) {
            const team = new TeamModel(req.app.get("db"), req.team.id);
            await team.init();

            subdomain = team.getSubdomain();
        }

        res.status(200);
        res.send({ teamURL: subdomain || "" });
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({ error: e.message }) : res.send();
    }
}