/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */

import { Database } from "massive";
import { ModelError } from "./index";

import twilio = require("../providers/twilio");

const providerTypeMap: any = {
    twilio: "sms",
};

/**
 * Providers are stored within the integrations database
 * This model provides a "providers-first" abstraction for api controllers
 *  to interact with individual providers and their relationships without
 *  having to refer to them thorugh their parent integration
 * @export
 * @class ProvidersModel
 */
export class ProviderModel {

    /**
     * @return a list of all providers for a given teamId
     * @return an empty list, if not found
     */
    public static async findAllByTeam(db: Database, teamId: number) {
        try {
            const providers = await db.query(
                `SELECT providers FROM integrations
                    WHERE team_id = $1`,
                [teamId as unknown as string],
            );
            if (providers && providers[0]) {
                return providers[0].providers;
            } else {
                return [];
            }
        } catch (e) {
            throw new ModelError(e);
        }
    }

    /**
     * @return a teamId for a given integration provider.
     * @return null, if not found
     */
    public static async findTeamByProvider(db: Database, integrationName: string, provider: string) {
        try {
            const result = await db.query(
                `SELECT team_id
                FROM integrations AS tt, jsonb_array_elements(
                    (
                      SELECT providers
                      FROM integrations
                      WHERE name = $1 AND id = tt.id
                    )
                ) AS arr_elem
                WHERE arr_elem = $2`,
                [integrationName, provider],
            );
            if (result) {
                return result[0].team_id;
            } else {
                return null;
            }
        } catch (e) {
            throw new ModelError(e);
        }
    }

    private initialized: boolean;
    private db: Database;
    private id: string; // phone number, username, etc.
    private authentication: any;
    private integrationName: string; // twilio, whatsapp, etc.
    private teamId: number;

    /**
     * @param db required
     * @param id
     * @param integrationName
     * @param teamId
     */
    constructor(db: Database, id: string, integrationName: string, teamId: number) {
        this.db = db;
        this.id = id;
        this.integrationName = integrationName;
        this.teamId = teamId;
        this.initialized = false;
    }

    /**
     * Associate constructed provider with its integration
     * @return {string} integration name, if found
     */
    public async init() {
        try {
            const integration = await this.db.integrations.findOne({
                name: this.integrationName,
                team_id: this.teamId,
            });

            if (integration) {
                this.authentication = integration.authentication;
                this.initialized = true;
            } else {
                throw new ModelError(`Integration not found for ${this.integrationName} in team "${this.teamId}"`);
            }
        } catch (e) {
            throw new ModelError(e);
        }

        return this.integrationName;
    }

    public getType(): string {
        if (this.initialized) {
            if (this.integrationName in providerTypeMap) {
                return providerTypeMap[this.integrationName];
            }

            throw new ModelError("integrationName is not found in providerTypeMap");
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    public async outbound(to: string, message: string) {
        if (this.initialized) {
            try {
                switch (this.integrationName) {
                    case "twilio":
                        await twilio.outbound(to, message,
                            this.id,
                            this.authentication.accountSID,
                            this.authentication.authToken,
                    );
                }
            } catch (e) {
                throw new ModelError(e);
            }
        } else {
            throw new ModelError(ModelError.NO_INIT);
        }
    }
}
