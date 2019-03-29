/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import cookieParser = require("cookie-parser");
import { json, Router } from "express";
import { checkJwt } from "../../helpers";
import { verifyOutboundMessage, verifySubdomain } from "../../models";

import { postAdd } from "./add.post";
import { getList } from "./list.get";
import { getSubscribe } from "./subscribe.get";

const router: Router = Router();

/**
 * @swagger
 * /conversation/list:
 *   get:
 *     summary: Get list of all conversations for the current team/subdomain
 *     tags:
 *       - conversation
 *     responses:
 *       200:
 *         description: Array of all conversations
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             description: IConversationsHistory (type)
 *             properties:
 *               who:
 *                 type: number
 *               type:
 *                 type: string
 *               message:
 *                 type: string
 *               timestamp:
 *                 type: number
 *                 format: date-time
 */
router.get("/list", checkJwt, verifySubdomain, getList);

/**
 * @swagger
 * /conversation/subscribe:
 *   get:
 *     summary: SSE subscription for all new messages for a team
 *     description: requires team_url set in the user's cookies
 *     tags:
 *       - conversation
 *     produces: ["text/event-stream"]
 */
router.get("/subscribe", cookieParser(), getSubscribe);

/**
 * @swagger
 * /conversation/add:
 *   post:
 *     summary: Create/update a conversation
 *     tags:
 *       - conversation
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: information about the message
 *         schema:
 *           type: object
 *           properties:
 *             phoneNumber:
 *               type: number
 *               descrpition: the number the user would like to send a message to
 *             message:
 *               type: string
 *             provider:
 *               type: string
 *               description: A string matching the name of a provider the user has access to
 *     responses:
 *       200:
 *         description: Responds with the updated conversation (array of message objects)
 */
router.post("/add", checkJwt, verifySubdomain, json(), verifyOutboundMessage, postAdd);

export const ConversationController: Router = router;
