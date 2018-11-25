/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { json, Response, Router } from "express";
import { Database, Entity } from "massive";
import { ITeamRequest } from "../custom";
import helpers = require("../helpers");
import twilioProvider = require("../providers/twilio");

const router: Router = Router();

router.get("/list", helpers.checkJwt, helpers.verifySubdomain, (req: ITeamRequest, res: Response) => {
    req.app.get("db").conversations.find({team_id: req.team.id}, {
        order: [{
            direction: "desc",
            field: "updated_at",
        }],
    }).then((conversations: Entity) => {
        res.json(conversations);
    }).catch((error: Error) => {
        console.error(error);
        res.status(500).send();
    });
});

router.post("/add", helpers.checkJwt, helpers.verifySubdomain, json(), (req: ITeamRequest, res: Response) => {
    helpers.verifyOutboundMessage(req, (err: string, body: any) => {
        if (err) {
            res.statusCode = 400;
            res.json({errors: err});
        }

        // todo check if user has access to this number
        add(body, req.user, req.team.id, body.provider, req.app.get("db"), (error: string, message: string) => {
            if (error) {
                console.error(error);
                res.status(500).send();
            }

            res.json(message);
        });
    });
});

export function add(
    body: any,
    user: string | any,
    teamID: number,
    serviceNumber: number | null,
    db: Database,
    callback: (err: string, body?: any) => void,
) {
    // these must be normalized between api users (/providers)
    let phoneNumber: string; // conversation "recipient"
    let who: string | number; // user name (0 if from provider)
    let message: string;
    let outbound: boolean; // true for UI users
    let authToken: string;
    let accountSID: string;
    switch (user) {
    case "twilio":
        phoneNumber = body.From.replace(/\D/g, "");
        who = 0;
        message = body.Body;
        outbound = false;
        break;
    default:
        // todo split into multiple providers
        db.integrations.findOne({
            name: "twilio",
            team_id: teamID,
        }).then((integration: any) => {
            if (integration) {
                authToken = integration.authentication.authToken;
                accountSID = integration.authentication.accountSID;
            } else {
                callback("you must setup an integration first");
            }
        }).catch((err: string) => {
            callback(err);
        });
        phoneNumber = body.phoneNumber.toString();
        who = user.sub; // TODO a better user id
        message = body.message;
        outbound = true;
    }
    db.conversations.find({
        to: phoneNumber,
    }).then((result: any[]) => {
        // if found, update
        if (result.length === 1) {
            // copy history
            const history = result[0].history;

            // add message to history
            // todo replace this with updateDoc?
            history.push({
                message,
                timestamp: Math.floor(Date.now() / 1000),
                type: "sms", // TODO pass into function
                who,
            });

            // save message
            db.conversations.update({
                id: result[0].id,
            }, {
                history: JSON.stringify(history),
            }).then((conversation: Entity) => {
                // added to database, now send via provider
                if (outbound) {
                    twilioProvider.outbound(
                        phoneNumber,
                        message,
                        result[0].from,
                        accountSID,
                        authToken,
                        (providerError: string) => {
                            if (providerError) {
                                callback(providerError);
                            }
                            callback(null, conversation);
                        });
                } else {
                    callback(null, conversation);
                }
            }).catch((error: string) => {
                callback(error);
            });

        } else if (result.length === 0) {
            // if not found, create new one
            db.conversations.insert({
                from: serviceNumber,
                history: JSON.stringify([{
                    message,
                    timestamp: Date.now() / 1000,
                    type: "sms", // TODO pass into function
                    who,
                }]),
                team_id: teamID,
                to: phoneNumber,
            }).then((conversation: Entity) => {
                // added to database, now send via provider
                if (outbound) {
                    twilioProvider.outbound(
                        phoneNumber.toString(),
                        message,
                        serviceNumber.toString(),
                        accountSID,
                        authToken,
                        (providerError: string) => {
                            if (providerError) {
                                callback(providerError); // todo actually tell the user about this
                            }
                            callback(null, [conversation]);
                        });
                } else {
                    callback(null, [conversation]);
                }
            }).catch((error: string) => {
                callback(error);
            });
        } else {
            // there's too many conversations for this phone number... bail!
            console.error("too many conversations for this user");
            callback(body);
        }

    }).catch((error: string) => {
        callback(error);
    });
}

export const ConversationController: Router = router;
