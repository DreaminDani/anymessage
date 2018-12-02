/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { NextFunction, Request, Response } from "express";
import { Database } from "massive";
import { ModelError } from "./index";

/**
 * Interact with the teams database
 * @export
 * @class TeamModel
 */
export class TeamModel {

    /**
     * Check if a sudomain is available
     * @return {boolean} if team is found
     */
    public static async available(db: Database, subdomain: string) {
        try {
            const found = await db.teams.findOne({subdomain});
            return (found) ? false : true;
        } catch (e) {
            throw new ModelError(e);
        }
    }

    private initialized: boolean;
    private db: Database;
    private id: number;
    private subdomain: string;

    constructor(db: Database, id?: number) {
        this.db = db;
        this.id = id;
        this.initialized = false;
    }

    /**
     * Simple factory function to get team from database
     * Must be called before any other getters/setters
     * @return {number} ID of team, if found
     */
    public async init() {
        try {
            const team = await this.db.teams.findOne({
                id: this.id,
            });
            if (team.subdomain) {
                this.subdomain = team.subdomain;
            } else {
                throw new ModelError("Cannot find team with passed \"id\"");
            }

            this.initialized = true;
            return this.id;
        } catch (e) {
            throw new ModelError(e);
        }
    }

    /**
     * Alternative to init if you need to create the team
     * @return {number} ID of new team, if created
     */
    public async create(newURL: string) {
        try {
            const newTeam = await this.db.teams.insert({subdomain: newURL});
            if (newTeam) {
                this.id = newTeam.id;
                this.initialized = true;

                return this.id;
            } else {
                throw new ModelError("Team was not created. Please verify model integrity");
            }
        } catch (e) {
            throw new ModelError(e);
        }
    }

    public getSubdomain(): string {
        if (this.initialized) {
            return this.subdomain;
        }

        throw new ModelError(ModelError.NO_INIT);
    }

    public async setSubdomain(newURL: string) {
        if (this.initialized) {
            try {
                return await this.db.teams.update({
                    id: this.id,
                }, {
                    subdomain: newURL,
                });
            } catch (e) {
                throw new ModelError(e);
            }
        }

        throw new ModelError(ModelError.NO_INIT);
    }

}

/*
* Middleware for use in controllers
*/
interface ITeamURLRequestBody {
    newURL?: string;
}
interface ITeamURLRequest extends Request {
    body: ITeamURLRequestBody;
}

/**
 * Middleware to verify team name input, normalize strings, and prevent XSS
 * @param  {ITeamURLRequest} req (needs to be a JSON-parsed Express request)
 */
export function verifyTeamName(req: ITeamURLRequest, res: Response, next: NextFunction): void {
    let passed = true;
    if (!req.body.newURL) {
        passed = false;
        res.status(400);
        res.json({error: "newURL is required"});
    }

    if (!/^[0-9a-z\-]+$/.test(req.body.newURL)) {
        passed = false;
        res.status(400);
        res.json({error: "newURL can only conatain lowercase letters, numbers and dashes"});
    }

    if (passed) {
        next();
    }
}

interface ITeam {
    id: number;
    subdomain: string;
}
export interface ITeamRequest extends Request {
  team: ITeam;
}

/**
 * Middleware to verify user has access to origin subdomain
 * @param  {ITeamRequest} req (needs to be a JSON-parsed Express request)
 */
export async function verifySubdomain(req: ITeamRequest, res: Response, next: NextFunction) {
    const subdomain = (req.headers.origin as string).split("://")[1].split(".")[0];
    if (subdomain && subdomain !== "www") {
        // look up subdomain and check if id matches user team_id
        try {
            const data = await req.app.get("db").query(
                `SELECT teams.id FROM users
                    LEFT JOIN teams
                    ON users.team_id = teams.id
                    WHERE teams.subdomain = $1
                    AND users.email = $2`,
                [subdomain, req.user.email],
            );

            // return an unauthorized if user is not found
            if (data.length === 0) {
                res.status(403).end();
            } else {
                // set team.id and team.subdomain for future requests to use
                const id = data[0].id;
                req.team = { id, subdomain };
                next();
            }
        } catch (e) {
            console.error(e);
            res.status(500).end();
        }
    } else {
        next();
    }
}
