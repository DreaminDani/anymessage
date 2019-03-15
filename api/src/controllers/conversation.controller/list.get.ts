import { Response } from "express";
import {
    ConversationModel,
    ITeamRequest,
} from "../../models";

export const getList = async (req: ITeamRequest, res: Response) => {
    try {
        const conversations = await ConversationModel.getConversationsByTeam(req.app.get("db"), req.team.id);
        res.status(200);
        res.json(conversations);
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({ error: e.message }) : res.send();
    }
};
