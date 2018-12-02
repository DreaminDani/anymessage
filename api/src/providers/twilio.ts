/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import twilio = require("twilio");

export async function outbound(
    to: string,
    message: string,
    serviceNumber: string,
    accountSid: string,
    authToken: string,
) {
    const twilioREST = twilio(accountSid, authToken);
    // send the message
    return new Promise((resolve, reject) => {
        twilioREST.messages.create({
            body: message,
            from: serviceNumber,
            to,
        }, (err, responseData) => {
            if (!err) {
                resolve(responseData);
            } else {
                reject(err.message);
            }
        });
    });
}
