/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import jwt = require("express-jwt");
import jwksRsa = require("jwks-rsa");

/**
 * Generate allowed RegExp for use in cors requests
 */
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
