/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Router } from "express";
import { checkJwt } from "../../helpers";

import { getDetails } from "./details.get";
import { getLogin } from "./login.get";

const router: Router = Router();

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
 *         description: JSON of user record
 *         schema:
 *           type: object
 *           properties:
 *              given_name:
 *                  type: string
 *              family_name:
 *                  type: string
 *              nickname:
 *                  type: string
 *              name:
 *                  type: string
 *              picture:
 *                  type: string
 *                  format: uri
 *              gender:
 *                  type: string
 *              locale:
 *                  type: string
 *                  format: iso2
 *              updated_at:
 *                  type: string
 *                  format: date-time
 *              email:
 *                  type: string
 *                  format: email
 *              email_verified:
 *                  type: boolean
 *              iss:
 *                  type: string
 *                  format: uri
 *              sub:
 *                  type: string
 *                  default: 'oauth|sub'
 *              aud:
 *                  type: string
 *                  format: hash
 *              iat:
 *                  type: number
 *                  format: date-time
 *              exp:
 *                  type: number
 *                  format: date-time
 *              at_hash:
 *                  type: string
 *                  format: hash
 *              nonce:
 *                  type: string
 *                  format: nonce
 */
router.get("/details", checkJwt, getDetails);

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
 *         description: User subdomain. If no subdomain exists, Setup URL
 *         schema:
 *           type: object
 *           properties:
 *             redirectURI:
 *               type: string
 *               default: '//{subdomain}.UI_HOSTNAME/messages'
 */
router.get("/login", checkJwt, getLogin);

export const UserController: Router = router;
