import { Database } from "massive";
import { ModelError } from "./index";

interface IHasMemberFunction {
    aMemberFunction(): void;
}

export class TeamModel {
    private initialized: boolean;
    private db: Database;
    private id: number;
    private subdomain: string;

    constructor(db: Database, id: number) {
        this.db = db;
        this.id = id;
        this.initialized = false;
    }

    /*
     * Simple factory function to get team from database
     * Must be called before any other getters/setters
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
        } catch (e) {
            throw new ModelError(e);
        }
    }

    public getSubdomain() {
        if (this.initialized) {
            return this.subdomain;
        }

        throw new ModelError(ModelError.NO_INIT);
    }

}
