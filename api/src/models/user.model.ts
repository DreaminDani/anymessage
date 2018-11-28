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

    /*
     * Alternative to init if you want to create the user
     */
    public create = (userInfo: IUserInfo) => {
        // if not found, create user
        // return OK (TODO return setup url)
        try {
            return this.db.users.insert({
                auth_metadata: userInfo,
                auth_provider: userInfo.iss,
                email: userInfo.email,
                name: userInfo.name,
            });
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

    /*
     * replace with calls to team model altogether
     */
    public login = async () => {
        // look up user by email (TODO generalize to more than auth0)
        try {
            const result = await this.db.users.find({
                email: this.email,
            });

            if (result.length === 1) {
                // TODO verify user is using the same auth provider
                const currentUser = result[0];
                if (currentUser.team_id) {
                        // if found, return return tenant url
                        // TODO replace this with a join query and/or TeamModel search
                        const team = await this.db.teams.findOne({
                            id: currentUser.team_id,
                        });

                        if (team) {
                            return {
                                // todo handle SSL
                                redirectURI: `http://${team.subdomain}.${process.env.UI_HOSTNAME}/messages`,
                                teamURL: team.subdomain,
                            };
                        } else {
                            throw new ModelError("user has team_id but no team exists with that id");
                        }
                    } else {
                        // if no tenant URL, redirect to setup (settings for now)
                        return {redirectURI: "/settings"};
                    }
                } else if (result.length === 0) {
                    return null; // user does not exist
                } else {
                    console.log(result);
                    throw new ModelError("user has too many records!");
                }
        } catch (e) {
            throw new ModelError(e);
        }
    }
}
