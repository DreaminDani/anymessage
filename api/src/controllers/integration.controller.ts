/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Request, Response, Router, urlencoded } from "express";
import { checkJwt } from "../helpers";
import { ITeamRequest, verifySubdomain } from "../models";

const router: Router = Router();

router.get("/providers", checkJwt, verifySubdomain, (req: ITeamRequest, res: Response) => {
    req.app.get("db").query(
        `SELECT providers FROM integrations
            WHERE team_id = $1`,
        [req.team.id],
    ).then((result: any) => {
        res.status(200);
        if (result) {
            res.send(result[0]);
        } else {
            res.send({providers: []});
        }
    }).catch((error: string) => {
        console.error(error);
        res.sendStatus(500);
    });
});

// get specific integration for a given team
router.get("/", checkJwt, verifySubdomain, (req: ITeamRequest, res: Response) => {
    const parsedURL = req.url.split("?");
    if (parsedURL.length > 1) {
        const integration = parsedURL[1];
        if (req.team && req.team.id) {
            req.app.get("db").integrations.findOne({
                name: integration,
                team_id: req.team.id,
            }).then((integration: any) => {
                if (integration) {
                    res.status(200);
                    res.send({
                        ...integration.authentication,
                        providers: integration.providers,
                    });
                } else {
                    res.sendStatus(200);
                }
            }).catch((error: string) => {
                console.error(error);
                res.sendStatus(500);
            });
        } else {
            // no team. no integrations
            res.sendStatus(200);
        }
    } else {
        res.status(400);
        res.send({error: "you must request a specific integration"});
    }
});

router.post("/save", checkJwt, verifySubdomain, json(), (req: ITeamRequest, res: Response) => {
    // todo verify and inject-protect integration
    // { accountSID: '123', authToken: 'abc', name: 'twilio' }
    req.app.get("db").integrations.findOne({
        name: req.body.name,
        team_id: req.team.id,
    }).then((integration: any) => {
        if (integration) {
            req.app.get("db").integrations.save({
                authentication: {
                    accountSID: req.body.accountSID,
                    authToken: req.body.authToken,
                },
                id: integration.id,
                providers: {
                    data: req.body.providers || [""],
                    rawType: true,
                    toPostgres: (p: any) => {
                        return req.app.get("db").pgp.as.format("$1::jsonb", [JSON.stringify(p.data)]);
                    },
                },
            }).then(() => {
                res.sendStatus(200);
            }).catch((e: string) => {
                console.error(e);
                res.sendStatus(500);
            });
        } else {
            req.app.get("db").integrations.save({
                authentication: {
                    accountSID: req.body.accountSID,
                    authToken: req.body.authToken,
                },
                name: req.body.name,
                providers: {
                    data: req.body.providers || [""],
                    rawType: true,
                    toPostgres: (p: any) => {
                        return req.app.get("db").pgp.as.format("$1::jsonb", [JSON.stringify(p.data)]);
                    },
                },
                team_id: req.team.id,
            }).then(() => {
                res.sendStatus(200);
            }).catch((error: string) => {
                console.error(error);
                res.sendStatus(500);
            });
        }
    }).catch((err: string) => {
        console.error(err);
        res.sendStatus(500);
    });

});

export const IntegrationController: Router = router;
