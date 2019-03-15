/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { NextFunction, Response } from "express";
import { Database } from "massive";
import { ModelError } from "./index";
import { ITeamRequest } from "./team.model";

interface IConversationHistory {
    who: number;
    type: string;
    message: string;
    timestamp: number;
}

/**
 * Interact with the conversations database
 * @export
 * @class ConversationModel
 */
export class ConversationModel {

    public static async getConversationsByTeam(db: Database, teamId: number) {
        try {
            return await db.conversations.find({ team_id: teamId }, {
                order: [{
                    direction: "desc",
                    field: "updated_at",
                }],
            });
        } catch (e) {
            throw new ModelError(e);
        }
    }

    private initialized: boolean;
    private db: Database;
    private id: number;
    private recipient: string;
    private teamId: number;
    private history: IConversationHistory[];

    constructor(db: Database, recipient: string, teamId: number) {
        this.db = db;
        this.recipient = recipient;
        this.teamId = teamId;
        this.initialized = false;
    }

    /*
     * Simple factory function to get conversation from database
     * Must be called before any other getters/setters
     */
    public async init() {
        try {
            const conversation = await this.db.conversations.findOne({
                team_id: this.teamId,
                to: this.recipient,
            });
            if (conversation) {
                this.id = conversation.id;
                this.history = conversation.history;
            }

            this.initialized = true;
        } catch (e) {
            throw new ModelError(e);
        }
    }

    /**
     * Alternative to init if you need to create the conversation
     * @return the conversation, if created sucessfully
     */
    public async create(provider: string, message: string, type: string, who: number, teamId: number) {
        try {
            const newConversation = await this.db.conversations.insert({
                from: provider,
                history: JSON.stringify([{
                    message,
                    timestamp: Date.now() / 1000,
                    type,
                    who,
                }]),
                team_id: teamId,
                to: this.recipient,
            });

            if (newConversation) {
                this.id = newConversation.id;
                this.initialized = true;

                return [newConversation];
            } else {
                throw new ModelError("Conversation was not created. Please verify model integrity");
            }
        } catch (e) {
            throw new ModelError(e);
        }
    }

    /**
     * Update an existing conversation
     * @return the conversation, if updated sucessfully
     */
    public async update(message: string, type: string, who: number) {
        if (this.initialized) {
            this.history.push({
                message,
                timestamp: Math.floor(Date.now() / 1000),
                type,
                who,
            });

            try {
                return await this.db.conversations.update({ id: this.id }, {
                    history: JSON.stringify(this.history),
                });
            } catch (e) {
                throw new ModelError(e);
            }
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    /**
     * Use after init to check if conversation already exists
     */
    public exists() {
        if (this.initialized) {
            return typeof this.id !== "undefined";
        }

        throw new ModelError(ModelError.NO_INIT);
    }

}

/*
* Middleware for use in controllers
*/
interface IConversationRequestBody {
    phoneNumber?: string;
    message?: string;
    provider?: string;
}
export interface IConversationRequest extends ITeamRequest {
    body: IConversationRequestBody;
}

/**
 * Middleware that verifies a JSON-parsed Express request has all the data necessary to run
 */
export function verifyOutboundMessage(req: IConversationRequest, res: Response, next: NextFunction) {
    let passed = true;
    if (!req.body.phoneNumber || req.body.phoneNumber.length < 1) {
        passed = false;
        res.status(400);
        res.json({ error: "phoneNumber is required" });
    }

    // check if message is formatted correctly
    if (!req.body.message || req.body.message.length < 1) {
        passed = false;
        res.status(400);
        res.json({ error: "message is required" });
    }

    // check that phone number is a number
    if (!/^\d+$/.test(req.body.phoneNumber)) {
        passed = false;
        res.status(400);
        res.json({ error: "phoneNumber must only contain numbers [0-9]" });
    }

    // check if provider exists and user has access to it
    if (req.body.provider) {
        console.log("checking user has access to provider"); // todo check if user has access to this number
    } else {
        passed = false;
        res.status(400);
        res.json({ error: "provider is required" });
    }

    if (passed) {
        // todo sanitize message before moving on
        next();
    }
}
