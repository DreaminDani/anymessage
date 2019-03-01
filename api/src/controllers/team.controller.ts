/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Request, Response, Router } from "express";
import { checkJwt } from "../helpers";
import { createCustomer, getFundingSource, updateSubscription } from "../lib/StripeService";
import { ITeamRequest, ModelError, TeamModel, UserModel, verifySubdomain } from "../models";

const router: Router = Router();

// returns CC info for existing subscriber
router.get("/subscription",
    checkJwt,
    verifySubdomain,
    json(),
    async (req: ITeamRequest, res) => {
        const team = new TeamModel(req.app.get("db"), req.team.id);
        await team.init();

        const customer = team.getCustomerID();
        if (customer) {
            const source = await getFundingSource(customer);
            res.status(200);
            res.json(source);
        } else {
            res.status(200);
            res.json({});
        }
    });

router.post("/subscription",
    checkJwt,
    json(),
    async (req, res) => {
        const { cus_id, token, team_url } = req.body;
        try {
            let customer = cus_id;
            if (!customer && !team_url) {
                throw new ModelError("team_url required if cus_id not passed", 400);
            } else if (!customer) {
                const user = new UserModel(req.app.get("db"), req.user.email);
                await user.init();
                const teamId = await user.inTeam(team_url); // will throw 403 if user does not have access
                const team = new TeamModel(req.app.get("db"), teamId);
                await team.init();
                customer = team.getCustomerID();

                if (!customer) {
                    // if customer doesn't already exist, create one!
                    customer = await createCustomer(team.getSubdomain(), teamId, token);
                    // associate customer id with team
                    await team.setCustomerID(customer);
                }
            }

            // TODO attach webhooks?
            await updateSubscription(customer, token);
            res.status(200).end();
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    });

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
            res.send({ teamURL: subdomain || "" });
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    });

router.post("/url/available",
    checkJwt,
    json(),
    async (req: Request, res: Response) => {
        try {
            const available = await TeamModel.available(req.app.get("db"), req.body.newURL);
            res.status(200);
            res.send({ available });
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    });

router.post("/url/set",
    checkJwt,
    json(),
    async (req: Request, res: Response) => {
        if (req.body.newURL) {
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
                (e.status && e.message) ? res.json({ error: e.message }) : res.send();
            }
        } else {
            res.status(200);
            res.send({
                message: "No newURL sent",
            });
        }
    });

export const TeamController: Router = router;
