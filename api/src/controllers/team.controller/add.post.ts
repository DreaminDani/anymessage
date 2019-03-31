/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import { Response } from "express";
import { ITeamRequest, UserModel } from "../../models";

export const postAdd = async (req: ITeamRequest, res: Response) => {
  const member = new UserModel(req.app.get("db"), req.body.email);
  await member.init();

  let moreInfo;
  if (!member.exists()) {
    await member.create({
      iss: "invited",
      email: req.body.email,
      name: req.body.email,
    });
  } else {
    moreInfo = await member.getMetadata();
  }
  await member.setTeamId(req.team.id);

  if (moreInfo) {
    res.status(200);
    res.json(moreInfo);
  } else {
    res.status(200);
    res.json({ email: req.body.email });
  }
};
