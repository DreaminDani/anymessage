/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Router } from "express";
import { checkJwt } from "../../helpers";
import { verifyIntegrationBody, verifySubdomain } from "../../models";

import { getIndex } from "./index.get";
import { getProviders } from "./providers.get";
import { postSave } from "./save.post";

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
router.get("/providers", checkJwt, verifySubdomain, getProviders);

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
router.post("/save", checkJwt, verifySubdomain, json(), verifyIntegrationBody, postSave);

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
router.get("/", checkJwt, verifySubdomain, getIndex);

export const IntegrationController: Router = router;
