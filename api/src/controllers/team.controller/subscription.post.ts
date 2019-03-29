/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Request, Response } from "express";
import { createCustomer, updateSubscription } from "../../lib/StripeService";
import { ModelError, TeamModel, UserModel } from "../../models";

export const postSubscription = async (req: Request, res: Response) => {
    const { cus_id, token, team_url } = req.body;
    try {
        let customer = cus_id;
        if (!customer && !team_url) {
            throw new ModelError("team_url required if cus_id not passed", 400);
        } else if (!customer) {
            const user = new UserModel(req.app.get("db"), req.user.email);
            await user.init();
            const teamId = await user.inTeam(team_url); // will throw 403 if user does not have access
            const team = new TeamModel(req.app.get("db"), teamId);
            await team.init();
            customer = team.getCustomerID();

            if (!customer) {
                // if customer doesn't already exist, create one!
                customer = await createCustomer(team.getSubdomain(), teamId, token);
                // associate customer id with team
                await team.setCustomerID(customer);
            }
        }

        // TODO attach webhooks?
        await updateSubscription(customer, token);
        res.status(200).end();
    } catch (e) {
        console.error(e);
        res.status(e.status || 500);
        (e.status && e.message) ? res.json({ error: e.message }) : res.send();
    }
}