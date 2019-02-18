/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Request, Response, Router } from "express";
import * as Stripe from "stripe";
import { checkJwt } from "../helpers";
import { ITeamRequest, ModelError, TeamModel, UserModel, verifySubdomain } from "../models";

const stripe = new Stripe(process.env.STRIPE_SECRETKEY);

const router: Router = Router();

// returns customer ID for existing subscriber
router.get("/subscription", async (req, res) => {
    // return exising customer ID, if it exists
    console.log("here");
    res.status(200).end();
});

router.post("/subscription",
    checkJwt,
    json(),
    async (req, res) => {
        const { cus_id, cus_source_id, team_url } = req.body;
        try {
            // use passed customer ID OR create a new one
            let customer = cus_id;
            if (!customer) {
                // check user has access to subdomain and get back ID
                if (team_url) {
                    const user = new UserModel(req.app.get("db"), req.user.email);
                    await user.init();

                    // TODO extract this boolean to User Model
                    const teamId = user.getTeamId();
                    const requestedTeam = await TeamModel.findTeamByURL(req.app.get("db"), team_url);

                    // TODO support multiple teams here
                    if (teamId === requestedTeam.id) {
                        const newCustomer = await stripe.customers.create({
                            description: requestedTeam.subdomain,
                            metadata: { team_id: requestedTeam.id },
                            source: cus_source_id,
                        });
                        if (newCustomer && newCustomer.id) {
                            customer = newCustomer.id;
                            // store customer in team record
                        } else {
                            throw new Error("stripe did not return a valid customer id");
                        }
                    } else {
                        throw new ModelError("You do not have access to the requested team", 403);
                    }
                } else {
                    // TODO more declarative validation
                    throw new ModelError("team_url required if cus_id not passed", 400);
                }
            }

            // todo check if subscription already exists
            const subscription = await stripe.subscriptions.create({
                customer,
                items: [{ plan: "plan_EXbfs8rrU8AnPQ" }], // todo extract this to an env file
            });

            // todo attach webhooks
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
