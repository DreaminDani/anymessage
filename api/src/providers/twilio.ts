/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
// vendor imports
import twilio = require("twilio");

export function outbound(
    to: string,
    message: string,
    serviceNumber: string,
    accountSid: string,
    authToken: string,
    callback: (err: string, body?: any) => void,
) {
    const twilioREST = twilio(accountSid, authToken);
    // send the message
    twilioREST.messages.create({
        body: message,
        from: serviceNumber,
        to,
    }, (err, responseData) => {
        if (!err) {
            // console.info(responseData);
            callback(null);
        } else {
            console.error(err);
            callback(err.message);
        }
    });
}
