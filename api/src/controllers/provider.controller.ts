/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response, Router, urlencoded } from "express";
import { add } from "./conversation.controller";

const router: Router = Router();

// todo rename this inbound controller?
router.post("/inbound/:integration", urlencoded(), (req: Request, res: Response) => {
    // TODO actually get Destination number from twilio request
    const toNumber = req.body.To.replace(/\D/g, "");
    if (req.params.integration) {
        // look up team_id from "To" number
        req.app.get("db").query(
            `SELECT team_id
            FROM integrations AS tt, jsonb_array_elements(
                (
                  SELECT providers
                  FROM integrations
                  WHERE name = $1 AND id = tt.id
                )
            ) AS arr_elem
            WHERE arr_elem = $2`,
            [req.params.integration, toNumber],
        ).then((result: any) => {
            if (result) {
                const team_id = result[0].team_id;
                add(req.body, req.params.integration, team_id, toNumber, req.app.get("db"),
                    (error: string, message: string) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send();
                        }

                        res.writeHead(200, {"Content-Type": "text/xml"});
                        res.end("<Response></Response>"); // respond with no message
                    });
            } else {
                res.writeHead(200, {"Content-Type": "text/xml"});
                res.end(`<Response>
                        This provider has not yet been set up. Please try again later.
                        </Response>`); // respond with failure
            }
        });
    }
});

export const ProviderController: Router = router;
