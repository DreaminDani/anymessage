/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response, Router, urlencoded } from "express";
import { publisherClient } from "../lib/redis-connection";
import { ConversationModel, ProviderModel } from "../models";

const router: Router = Router();

/**
 * @swagger
 * /inbound:
 *   post:
 *     summary: Receive messages from external providers/integrations and associate with team conversation(s)
 *     description: application/x-www-form-urlencoded
 *     tags:
 *       - inbound
 *     consumes:
 *        - application/x-www-form-urlencoded
 *     parameters:
 *       - in: path
 *         name: integration
 *         required: true
 *         type: string
 *         description: name of the integration (e.g. "twilio")
 *       - in: To
 *         name: To
 *         type: string
 *         description: Provider (number) to whom the message is being sent
 *       - in: From
 *         name: From
 *         type: string
 *         description: The (number) of the sender
 *       - in: Body
 *         name: Body
 *         type: string
 *         description: The message being sent
 *     responses:
 *       200:
 *         description: Will vary by sender integration
 */
router.post("/:integration",
    urlencoded(),
    async (req: Request, res: Response) => {
        const toNumber = req.body.To.replace(/\D/g, "");
        const fromNumber = req.body.From.replace(/\D/g, "");
        if (req.params.integration) {
            try {
                const team = await ProviderModel.findTeamByProvider(req.app.get("db"), req.params.integration, toNumber);
                if (team) {
                    const provider = new ProviderModel(req.app.get("db"), toNumber, req.params.integration, team.id);
                    await provider.init();

                    const conversation = new ConversationModel(req.app.get("db"), fromNumber, team.id);
                    await conversation.init();

                    // update conversation
                    let updatedConversation;
                    if (conversation.exists()) {
                        updatedConversation = await conversation.update(req.body.Body, provider.getType(), 0); // recipient is always 0
                    } else {
                        updatedConversation = await conversation.create(
                            toNumber,
                            req.body.Body,
                            provider.getType(),
                            0,
                            team.id,
                        );
                    }

                    publisherClient.publish(team.subdomain, JSON.stringify(updatedConversation[0]));

                    // TODO vary response based on provider.getSuccess()
                    res.writeHead(200, { "Content-Type": "text/xml" });
                    res.end("<Response></Response>"); // respond with no message
                } else {
                    // TODO vary response based on provider.getFailure()
                    res.writeHead(200, { "Content-Type": "text/xml" });
                    res.end(`<Response>
                        This provider has not yet been set up. Please try again later.
                        </Response>`); // respond with failure
                }
            } catch (e) {
                console.error(e);
                res.sendStatus(e.status || 500);
            }
        }
    });

export const InboundController: Router = router;
