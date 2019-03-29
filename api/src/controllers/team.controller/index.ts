/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Router } from "express";
import { checkJwt } from "../../helpers";
import { verifySubdomain } from "../../models";

import { getSubscription } from "./subscription.get";
import { postSubscription } from "./subscription.post";
import { getUrl } from "./url.get";
import { postUrlAvailable, postUrlSet } from "./url.post";

const router: Router = Router();

/**
 * @swagger
 * /team/subscription:
 *   get:
 *     summary: Get current subscription funding source
 *     description: Get team's funding source (Credit Card) for a subscription. Only available with STRIPE
 *     tags:
 *       - team
 *     responses:
 *       200:
 *         description: See stripe docs for more detail on response https://stripe.com/docs/api/sources
 */
router.get("/subscription", checkJwt, verifySubdomain, json(), getSubscription);

/**
 * @swagger
 * /team/subscription:
 *   post:
 *     summary: Create or update a subscription
 *     description: Create/Update subscription. Only available with STRIPE
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Information about the subscription to update
 *         schema:
 *           type: object
 *           properties:
 *             cus_id:
 *               type: string
 *             token:
 *               type: string
 *             team_url:
 *               type: string
 *           example:
 *             cus_id: "cus_retrievedFromSubscriptionEndpoint"
 *             team_url: "example.anymessage.io"
 *             token: "tok_providedByStripeElements"
 *     tags:
 *       - team
 *     responses:
 *       200:
 *         description: Empty response, if successful
 */
router.post("/subscription", checkJwt, json(), postSubscription);

/**
 * @swagger
 * /team/url:
 *   get:
 *     summary: Get user's team URL
 *     tags:
 *       - team
 *     responses:
 *       200:
 *         description: Team URL or Empty String
 *         schema:
 *           type: object
 *           properties:
 *             teamURL:
 *               type: string
 *               default: ""
 */
router.get("/url", checkJwt, verifySubdomain, getUrl);

/**
 * @swagger
 * /team/url/available:
 *   post:
 *     summary: Check if a Team URL is available
 *     tags:
 *       - team
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Only include subdomain in request body
 *         schema:
 *           type: object
 *           properties:
 *             newURL:
 *               type: string
 *           example:
 *             newURL: "example"
 *     responses:
 *       200:
 *         description: Boolean if URL is available
 *         schema:
 *           type: object
 *           properties:
 *             available:
 *               type: boolean
 */
router.post("/url/available", checkJwt, json(), postUrlAvailable);

/**
 * @swagger
 * /team/url/set:
 *   post:
 *     summary: Set URL for a team
 *     description: Requires that URL is available and user has access to team
 *     tags:
 *       - team
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Only include subdomain in request body
 *         schema:
 *           type: object
 *           properties:
 *             newURL:
 *               type: string
 *           example:
 *             newURL: "example"
 *     responses:
 *       200:
 *         description: Redirect URL with new URL prefix
 *         schema:
 *           type: object
 *           properties:
 *             redirectURI:
 *               type: string
 *               default: '//{subdomain}.UI_HOSTNAME/messages'
 */
router.post("/url/set", checkJwt, json(), postUrlSet);

export const TeamController: Router = router;
