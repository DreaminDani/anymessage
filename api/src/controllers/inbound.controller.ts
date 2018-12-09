/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response, Router, urlencoded } from "express";
import { ConversationModel, ProviderModel } from "../models";

const router: Router = Router();

router.post("/:integration",
urlencoded(),
async (req: Request, res: Response) => {
    const toNumber = req.body.To.replace(/\D/g, "");
    const fromNumber = req.body.From.replace(/\D/g, "");
    if (req.params.integration) {
        try {
            const teamId = await ProviderModel.findTeamByProvider(req.app.get("db"), req.params.integration, toNumber);
            if (teamId) {
                const provider = new ProviderModel(req.app.get("db"), toNumber, req.params.integration, teamId);
                await provider.init();

                const conversation = new ConversationModel(req.app.get("db"), fromNumber, teamId);
                await conversation.init();

                // update conversation
                if (conversation.exists()) {
                    await conversation.update(req.body.Body, provider.getType(), 0); // recipient is always 0
                } else {
                    await conversation.create(
                        toNumber,
                        req.body.Body,
                        provider.getType(),
                        0,
                        teamId,
                    );
                }

                res.writeHead(200, {"Content-Type": "text/xml"});
                res.end("<Response></Response>"); // respond with no message
            } else {
                res.writeHead(200, {"Content-Type": "text/xml"});
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
