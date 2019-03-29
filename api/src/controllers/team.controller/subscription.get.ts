/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Response } from "express";
import { getFundingSource } from "../../lib/StripeService";
import { ITeamRequest, TeamModel } from "../../models";

export const getSubscription = async (req: ITeamRequest, res: Response) => {
    const team = new TeamModel(req.app.get("db"), req.team.id);
    await team.init();

    const customer = team.getCustomerID();
    if (customer) {
        const source = await getFundingSource(customer);
        res.status(200);
        res.json(source);
    } else {
        res.status(200);
        res.json({});
    }
}