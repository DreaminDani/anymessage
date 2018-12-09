/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Response, Router } from "express";
import { checkJwt } from "../helpers";
import { IntegrationModel, ITeamRequest, ProviderModel, verifyIntegrationBody, verifySubdomain } from "../models";

const router: Router = Router();

router.get("/providers",
checkJwt,
verifySubdomain,
async (req: ITeamRequest, res: Response) => {
    try {
        const providersList = await ProviderModel.findAllByTeam(req.app.get("db"), req.team.id);
        res.status(200);
        res.json(providersList);
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({error: e.message}) : res.send();
    }
});

// get specific integration for a given team
router.get("/",
checkJwt,
verifySubdomain,
async (req: ITeamRequest, res: Response) => {
    const parsedURL = req.url.split("?");
    if (parsedURL.length > 1) {
        const integrationName = parsedURL[1];
        try {
            const integration = new IntegrationModel(req.app.get("db"), req.team.id, integrationName);
            const info = await integration.init();
            if (info) {
                res.status(200);
                res.send(info);
            } else {
                res.sendStatus(200);
            }
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({error: e.message}) : res.send();
        }
    } else {
        res.status(400);
        res.send({error: "you must request a specific integration"});
    }
});

router.post("/save",
checkJwt,
verifySubdomain,
json(),
verifyIntegrationBody,
async (req: ITeamRequest, res: Response) => {
    try {
        const integration = new IntegrationModel(req.app.get("db"), req.team.id, req.body.name);
        await integration.init();
        await integration.save(req.body.authentication, req.body.providers);
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({error: e.message}) : res.send();
    }
});

export const IntegrationController: Router = router;
