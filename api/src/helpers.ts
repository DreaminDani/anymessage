/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import * as Express from "express";
import jwt = require("express-jwt");
import jwksRsa = require("jwks-rsa");
import { ITeamRequest } from "./custom";

// tslint:disable-next-line
const jwtAuthz = require("express-jwt-authz");

// takes a jsonparsed request and verifies it has all the data necessary to run
// conversation_id, message, username
export function verifyOutboundMessage(request: any, callback: (err: string, body?: any) => void) {
    if (!request.body.phoneNumber || request.body.phoneNumber.length < 1) {
        return callback("phoneNumber is required");
    }

    // check if message is formatted correctly
    if (!request.body.message || request.body.message.length < 1) {
        return callback("message is required");
    }

    // check that phone number is a number
    if (!/^\d+$/.test(request.body.phoneNumber)) {
        return callback("phoneNumber must only contain numbers [0-9]");
    }

    return callback(null, request.body); // todo sanitize message before returning string
}

export function verifyTeamName(request: any, callback: (err: string, body?: any) => void) {
    if (!request.body.newURL) {
        return callback("newURL is required");
    }

    if (!/^[0-9a-z\-]+$/.test(request.body.newURL)) {
        return callback("newURL can only conatain lowercase letters, numbers and dashes");
    }

    return callback(null, request.body);
}

export function getAllowedExpression(hostname: string) {
    const pieces = hostname.split("."); // ["anymessage", "io"]
    return new RegExp(`${pieces[0]}\.${pieces[1]}$`); // /anymessage\.io$/
}

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
export const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
        rateLimit: true,
    }),

    // Validate the audience and the issuer.
    algorithms: ["RS256"],
    audience: process.env.AUTH0_CLIENTID,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
});

export const verifySubdomain = (req: ITeamRequest, res: Express.Response, next: Express.NextFunction) => {
    const subdomain = (req.headers.origin as string).split("://")[1].split(".")[0];
    if (subdomain && subdomain !== "www") {
        // look up subdomain and check if id matches user team_id
        req.app.get("db").query(
            `SELECT teams.id FROM users
                LEFT JOIN teams
                ON users.team_id = teams.id
                WHERE teams.subdomain = $1
                AND users.email = $2`,
            [subdomain, req.user.email],
        ).then((data: any[]) => {
            // return an unauthorized if user is not found
            if (data.length === 0) {
                res.status(403).end();
            } else {
                // set team.id and team.subdomain for future requests to use
                const id = data[0].id;
                req.team = { id, subdomain };
                next();
            }
        }).catch((err: string) => {
            console.error(err);
            res.status(500).end();
        });
    } else {
        next();
    }
};
