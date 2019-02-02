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

/**
 * @swagger
 * /user/login:
 *   get:
 *     summary: Login user
 *     description: Logs user into their team subdomain
 *     tags:
 *       - user
 *     responses:
 *       200:
 *         description: Returns user subdomain. If no subdomain exists, returns setup URL
 *         schema:
 *           type: object
 *           properties:
 *             redirectURI:
 *               type: string
 *               default: '//{subdomain}.UI_HOSTNAME/messages'
 */
router.get("/login",
    checkJwt,
    async (req: Request, res: Response) => {
        try {
            const user = new UserModel(req.app.get("db"), req.user.email);
            await user.init();
            if (user.exists()) {
                // update stored metadata
                await user.updateMetadata(req.user);
                // get team_id to return it
                let result: {};
                const teamId = user.getTeamId();
                if (teamId) {
                    const team = new TeamModel(req.app.get("db"), teamId);
                    await team.init();

                    const subdomain = team.getSubdomain();
                    if (subdomain) {
                        result = {
                            redirectURI: `//${subdomain}.${process.env.UI_HOSTNAME}/messages`,
                            teamURL: subdomain,
                        };
                    }
                }
                res.status(200);
                res.json(result || { redirectURI: "/setup" });
            } else {
                const newUser = await user.create(req.user);
                if (newUser) {
                    res.status(200);
                    res.json({ redirectURI: "/setup" });
                } else {
                    throw new Error(newUser as unknown as string); // unknown error, throw the object
                }
            }
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    });

/**
 * @swagger
 * /user/details:
 *   get:
 *     summary: Get details for user
 *     description: Get a client-side copy of the user record
 *     tags:
 *       - user
 *     responses:
 *       200:
 *         description: Returns JSON of user record
 *         schema:
 *           type: object
 *           properties:
 *             redirectURI:
 *               type: string
 *               default: `{ given_name: 'First',
 *                            family_name: 'Last',
 *                            nickname: 'some_nickname',
 *                            name: 'First Last',
 *                            picture: 'https://some.url',
 *                            gender: 'male',
 *                            locale: 'en',
 *                            updated_at: '2019-02-01T13:45:20.523Z',
 *                            email: 'email@example.com',
 *                            email_verified: true,
 *                            iss: 'https://oauth.url',
 *                            sub: 'oauth|sub',
 *                            aud: 'hAsH',
 *                            iat: 1549028720,
 *                            exp: 1549064720,
 *                            at_hash: 'hAsH',
 *                            nonce: 'NoNcE' }`
 */
router.get("/details",
    checkJwt,
    (req: Request, res: Response) => {
        if (req.user) {
            res.status(200);
            res.json(req.user);
        } else {
            console.error("req.user is not defined");
            res.status(500);
            res.send();
        }
    });

export const UserController: Router = router;
