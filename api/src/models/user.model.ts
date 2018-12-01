/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Database } from "massive";
import { ModelError } from "./index";

interface IUserInfo {
    iss: string;
    email: string;
    name: string;
}

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

    /*
     * Simple factory function to get team from database
     * Must be called before any other getters/setters
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
        } catch (e) {
            throw new ModelError(e);
        }
    }

    /**
     * Alternative to init if you want to create the user
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
                    {id: this.id},
                    {team_id: teamId},
                );
            } catch (e) {
                throw new ModelError(e);
            }
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    public exists() {
        if (this.initialized) {
            return typeof this.id !== "undefined";
        }

        throw new ModelError(ModelError.NO_INIT);
    }
}