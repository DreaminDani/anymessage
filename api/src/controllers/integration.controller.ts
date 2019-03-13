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

/**
 * @swagger
 * /integration/providers:
 *   get:
 *     summary: Get list of providers for current subdomain/team
 *     tags:
 *       - integration
 *     responses:
 *       200:
 *         description: Array of all providers
 *         schema:
 *           type: array
 *           items:
 *             type: string
 */
router.get("/providers",
    checkJwt,
    verifySubdomain,
    async (req: ITeamRequest, res: Response) => {
        try {
            // TODO respond with more provider info (like type, name, etc.)
            const providersList = await ProviderModel.findAllByTeam(req.app.get("db"), req.team.id);
            res.status(200);
            res.json(providersList);
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    });

/**
 * @swagger
 * /integration/save:
 *   post:
 *     summary: Create/update an integration
 *     tags:
 *       - integration
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: An integration contains some authentication, a name, and an array of providers
 *         schema:
 *           type: object
 *           properties:
 *             authentication:
 *               type: object
 *               properties:
 *                 key: string
 *                 description: required keys varies by integration type
 *             name:
 *               type: string
 *             providers:
 *               type: array
 *               description: A list of providers that this integration enables
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empty response if successful
 */
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
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    });

/**
 * @swagger
 * /integration:
 *   get:
 *     summary: Get information for specific integration
 *     tags:
 *       - integration
 *     parameters:
 *       - in: query
 *         name: name
 *     responses:
 *       200:
 *         description: Varies by integration
 *         schema:
 *           type: object
 *           items:
 *             type: string
 */
router.get("/",
    checkJwt,
    verifySubdomain,
    async (req: ITeamRequest, res: Response) => {
        if (req.query.name) {
            try {
                const integration = new IntegrationModel(req.app.get("db"), req.team.id, req.query.name);
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
                (e.status && e.message) ? res.json({ error: e.message }) : res.send();
            }
        } else {
            res.status(400);
            res.send({ error: "you must provide an integration 'name'" });
        }
    });

export const IntegrationController: Router = router;
