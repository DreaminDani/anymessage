/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Database } from "massive";
import { ModelError, TeamModel } from "./index";

interface IUserInfo {
    iss: string;
    email: string;
    name: string;
}

/**
 * Interact with the users database
 * @export
 * @class UserModel
 */
export class UserModel {
    private initialized: boolean;
    private db: Database;
    private id: number;
    private email: string;
    private teamId: number;

    constructor(db: Database, email: string) {
        this.db = db;
        this.email = email;
        this.initialized = false;
    }

    /**
     * Simple factory function to get user from database
     * Must be called before any other getters/setters
     * @return {number} ID of user, if found
     */
    public async init() {
        try {
            const user = await this.db.users.findOne({
                email: this.email,
            });
            if (user) {
                this.id = user.id;
                this.teamId = user.team_id;
            }

            this.initialized = true;
            return this.id;
        } catch (e) {
            throw new ModelError(e);
        }
    }

    /**
     * Alternative to init if you need to create the user
     * @return {number} ID of new user, if created
     */
    public async create(userInfo: IUserInfo) {
        try {
            const newUser = await this.db.users.insert({
                auth_metadata: userInfo,
                auth_provider: userInfo.iss,
                email: userInfo.email,
                name: userInfo.name,
            });

            if (newUser) {
                this.id = newUser.id;
                this.initialized = true;

                return this.id;
            } else {
                throw new ModelError("User was not created. Please verify model integrity");
            }
        } catch (e) {
            throw new ModelError(e);
        }
    }

    /**
     * Use after init to update auth_metadata with latest from provider
     */
    public async updateMetadata(userInfo: IUserInfo) {
        if (this.initialized) {
            return await this.db.users.save({
                id: this.id,
                auth_metadata: userInfo,
            });
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    /**
     * Use after init to check if user already exists
     */
    public exists() {
        if (this.initialized) {
            return typeof this.id !== "undefined";
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    public async inTeam(team_url: string) {
        if (this.initialized) {
            const requestedTeam = await TeamModel.findTeamByURL(this.db, team_url);

            // TODO support multiple teams here
            if (this.teamId === requestedTeam.id) {
                return this.teamId;
            } else {
                throw new ModelError("You do not have access to the requested team", 403);
            }
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    public getTeamId() {
        if (this.initialized) {
            return this.teamId;
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    public async setTeamId(teamId: number) {
        if (this.initialized) {
            this.teamId = teamId;
            try {
                return await this.db.users.update(
                    { id: this.id },
                    { team_id: teamId },
                );
            } catch (e) {
                throw new ModelError(e);
            }
        }

        throw new ModelError(ModelError.NO_INIT);
    }
}
