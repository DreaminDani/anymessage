/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Request, Response, Router, urlencoded } from "express";
import { Database, Entity } from "massive";
import { Result } from "range-parser";
import helpers = require("../helpers");

const router: Router = Router();

router.get("/login", helpers.checkJwt, (req: Request, res: Response) => {
    // look up user by email (TODO generalize to more than auth0)
    req.app.get("db").users.find({
        email: req.user.email,
    }).then((result: any[]) => {
        if (result.length === 1) {
            // TODO verify user is using the same auth provider
            const currentUser = result[0];
            if (currentUser.team_id) {
                // if found, return return tenant url
                // TODO replace this with a join query
                req.app.get("db").teams.findOne({
                    id: currentUser.team_id,
                }).then((team: any) => {
                        res.status(200);
                        res.json({
                            // todo handle SSL
                            redirectURI: `http://${team.subdomain}.${process.env.UI_HOSTNAME}/messages`,
                            teamURL: team.subdomain,
                        });
                    }).catch((err: string) => {
                        console.error(err);
                        res.status(500);
                    });
            } else {
                // if no tenant URL, redirect to setup (settings for now)
                res.status(200);
                res.json({redirectURI: "/settings"});
            }
        } else if (result.length === 0) {
            // if not found, create user
            // return OK (TODO return setup url)
            req.app.get("db").users.insert({
                auth_metadata: req.user,
                auth_provider: req.user.iss,
                email: req.user.email,
                name: req.user.name,
            }).then((userData: Entity) => {
                res.status(200);
                res.json({redirectURI: "/settings"});
            })
            .catch((err: string) => {
                console.error(err);
                res.status(500);
            });
        } else {
            res.status(500);
        }
    }).catch((error: string) => {
        console.error(error);
        res.status(500);
    });
});

export const UserController: Router = router;
