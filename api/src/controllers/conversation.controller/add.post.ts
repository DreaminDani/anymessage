import { Response } from "express";
import { publisherClient } from "../../lib/redis-connection";
import {
    ConversationModel,
    IConversationRequest,
    ProviderModel,
    TeamModel,
    UserModel,
} from "../../models";

export const postAdd = async (req: IConversationRequest, res: Response) => {
    const user = new UserModel(req.app.get("db"), req.user.email);
    const userId = await user.init();

    if (user.exists()) {
        try {
            // check if user team has subscription
            // TODO getTeamId() should actually get ACTIVE teamId
            const team = new TeamModel(req.app.get("db"), user.getTeamId());
            await team.init();
            let outboundMessage = req.body.message;

            // only check for subscription if running with stripe
            let isSubscriber = true;
            if (process.env.STRIPE_SECRETKEY) {
                isSubscriber = await team.hasActiveSubscription();
            }

            if (!isSubscriber) {
                outboundMessage += " ~ sent with AnyMessage.io";
            }

            // init provider
            // TODO make client send integration name with provider
            const provider = new ProviderModel(req.app.get("db"), req.body.provider, "twilio", req.team.id);
            await provider.init();

            // send message via provider
            await provider.outbound(req.body.phoneNumber.toString(), outboundMessage);

            // init conversation model
            const conversation = new ConversationModel(req.app.get("db"), req.body.phoneNumber.toString(), req.team.id);
            await conversation.init();

            // update/create conversation in database
            let updatedConversation = [];
            if (conversation.exists()) {
                updatedConversation = await conversation.update(req.body.message, provider.getType(), userId);
            } else {
                updatedConversation = await conversation.create(
                    req.body.provider,
                    req.body.message,
                    provider.getType(),
                    userId,
                    req.team.id,
                );
            }

            publisherClient.publish(req.team.subdomain, JSON.stringify(updatedConversation[0]));

            res.status(200);
            res.json(updatedConversation);
        } catch (e) {
            console.error(e);
            res.status(e.status || 500);
            (e.status && e.message) ? res.json({ error: e.message }) : res.send();
        }
    } else {
        res.status(400);
        res.json({ error: "Requesting user does not exist. Please try logging in again." });
    }
};
