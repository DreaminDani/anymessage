/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import cookieParser = require("cookie-parser");
import { json, Response, Router } from "express";
import { checkJwt } from "../helpers";
import { eventSubscription, publisherClient } from "../lib/redis-connection";
import {
    ConversationModel,
    IConversationRequest,
    ITeamRequest,
    ProviderModel,
    TeamModel,
    UserModel,
    verifyOutboundMessage,
    verifySubdomain,
} from "../models";

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
router.get("/list",
    checkJwt,
    verifySubdomain,
    async (req: ITeamRequest, res: Response) => {
        try {
            const conversations = await ConversationModel.getConversationsByTeam(req.app.get("db"), req.team.id);
            res.status(200);
            res.json(conversations);
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    });

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
router.get("/subscribe", cookieParser(), (req, res) => {
    if (req.cookies.id_token && req.cookies.team_url) {
        const subdomain = req.cookies.team_url.split(".")[0];
        eventSubscription(subdomain, req, res);
    } else {
        console.log("user is attempting to subscribe to conversations without the proper cookies");
        res.send(400);
    }
});

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
router.post("/add",
    checkJwt,
    verifySubdomain,
    json(),
    verifyOutboundMessage,
    async (req: IConversationRequest, res: Response) => {
        const user = new UserModel(req.app.get("db"), req.user.email);
        const userId = await user.init();

        if (user.exists()) {
            try {
                // check if user team has subscription
                // TODO getTeamId() should actually get ACTIVE teamId
                const team = new TeamModel(req.app.get("db"), user.getTeamId());
                await team.init();
                let outboundMessage = req.body.message;

                // only check for subscription if running with stripe
                let isSubscriber = true;
                if (process.env.STRIPE_SECRETKEY) {
                    isSubscriber = await team.hasActiveSubscription();
                }

                if (!isSubscriber) {
                    outboundMessage += " ~ sent with AnyMessage.io";
                }

                // init provider
                // TODO make client send integration name with provider
                const provider = new ProviderModel(req.app.get("db"), req.body.provider, "twilio", req.team.id);
                await provider.init();

                // send message via provider
                await provider.outbound(req.body.phoneNumber.toString(), outboundMessage);

                // init conversation model
                const conversation = new ConversationModel(req.app.get("db"), req.body.phoneNumber.toString(), req.team.id);
                await conversation.init();

                // update/create conversation in database
                let updatedConversation = [];
                if (conversation.exists()) {
                    updatedConversation = await conversation.update(req.body.message, provider.getType(), userId);
                } else {
                    updatedConversation = await conversation.create(
                        req.body.provider,
                        req.body.message,
                        provider.getType(),
                        userId,
                        req.team.id,
                    );
                }

                publisherClient.publish(req.team.subdomain, JSON.stringify(updatedConversation[0]));

                res.status(200);
                res.json(updatedConversation);
            } catch (e) {
                console.error(e);
                res.status(e.status || 500);
                (e.status && e.message) ? res.json({ error: e.message }) : res.send();
            }
        } else {
            res.status(400);
            res.json({ error: "Requesting user does not exist. Please try logging in again." });
        }
    });

export const ConversationController: Router = router;
