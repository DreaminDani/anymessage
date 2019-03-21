/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Router, urlencoded } from "express";
import { postIndex } from "./index.post";

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
router.post("/:integration", urlencoded(), postIndex);

export const InboundController: Router = router;
