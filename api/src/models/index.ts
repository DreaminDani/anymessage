export class ModelError extends Error {
    public static NO_INIT: string = "You must first run \".init()\" for this model method";
    public status: number;
    constructor(message: string, status?: number) {
        super(message);
        this.status = status;
    }
}

export * from "./user.model";
export * from "./team.model";
export * from "./conversation.model";
