/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */

import { NextFunction, Response } from "express";
import { Database } from "massive";
import { ModelError } from "./";
import { ITeamRequest } from "./team.model";

interface IIntegrationAuthentication {
    accountSID?: string; // twilio
    authToken?: string; // twilio
    [key: string]: string;
}

/**
 * Interact with the integrations database
 * @export
 * @class IntegrationsModel
 */
export class IntegrationModel {
    // public static async getTeamFromProvider()
    private initialized: boolean;
    private db: Database;
    private id: number;
    private teamId: number;
    private name: string;
    private authentication: IIntegrationAuthentication;
    private providers: string[];

    constructor(db: Database, teamId: number, name: string) {
        this.db = db;
        this.teamId = teamId;
        this.name = name;
        this.initialized = false;
    }

    /**
     * Simple factory function to get integration from database
     * Must be called before any other getters/setters
     * @return a formatted integration object, if found
     */
    public async init() {
        try {
            const integration = await this.db.integrations.findOne({
                name: this.name,
                team_id: this.teamId,
            });

            if (integration && integration.id) {
                this.id = integration.id;

                if (integration.authentication) {
                    this.authentication = {...integration.authentication};
                }

                if (integration.providers) {
                    this.providers = integration.providers;
                }
            }

            this.initialized = true;
            return this.formatIntegration();
        } catch (e) {
            throw new ModelError(e);
        }
    }

    public async save(authentication: IIntegrationAuthentication, providers: string[]) {
        if (this.initialized) {
            const saveObject = this.buildSaveObject(authentication, providers);
            try {
                return await this.db.integrations.save(saveObject);
            } catch (e) {
                throw new ModelError(e);
            }
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    /**
     * build an object to save to the database
     */
    private buildSaveObject(authentication: IIntegrationAuthentication, providers: string[]) {
        let saveObject: any;
        saveObject = {
            authentication,
            // id: integration.id,
            providers: {
                data: providers || [""],
                rawType: true,
                toPostgres: (p: any) => {
                    return this.db.pgp.as.format("$1::jsonb", [JSON.stringify(p.data)]);
                },
            },
        };

        if (this.id) {
            // use the ID to refer to existing objects
            saveObject.id = this.id;
        } else {
            // provide the required name and team_id for new objects
            saveObject.name = this.name;
            saveObject.team_id = this.teamId;
        }
        return saveObject;
    }

    /**
     * Convert integration info into an easy to consume format
     */
    private formatIntegration() {
        if (this.authentication && this.providers) {
            return {
                authentication: this.authentication,
                providers: this.providers,
            };
        } else {
            return null;
        }
    }
}

interface IIntegrationRequestBody {
    authentication: IIntegrationAuthentication;
    name: string;
    providers?: string[];
}

export interface IIntegrationRequest extends ITeamRequest {
  body: IIntegrationRequestBody;
}

/**
 * Middleware to verify integration input, normalize strings, and prevent XSS
 * @param  {IIntegrationRequest} req (needs to be a JSON-parsed Express request)
 */
export function verifyIntegrationBody(req: IIntegrationRequest, res: Response, next: NextFunction): void {
    let passed = true;
    if (!req.body.authentication) {
        passed = false;
        res.status(400);
        res.json({error: "authentication object is required"});
    }

    for (const key in req.body.authentication) {
        if (req.body.authentication[key].length > 0
                && !/^[A-Za-z0-9\-\_]+$/.test(req.body.authentication[key])) {
                passed = false;
                res.status(400);
                res.json({error: `authentication.${key} can only contain letters, numbers, dashes and underscores`});
        }
    }

    // todo verify provider format against known provider regexp format
    if (req.body.providers) {
        for (const provider of req.body.providers) {
            if (!/^[A-Za-z0-9\-\_]+$/.test(provider)) {
                passed = false;
                res.status(400);
                res.json({error: `"${provider}" can only contain letters, numbers, dashes and underscores`});
            }
        }
    }

    if (passed) {
        next();
    }
}
