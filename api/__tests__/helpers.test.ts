/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
// import "jest";
// import { verifyOutboundMessage } from "../src/models";

// test("a well-formed body is returned", done => {
//     const req = {
//         body: {
//             message: "test",
//             phoneNumber: 123456789,
//         },
//     };
//     function callback(err: string, body: any) {
//         expect(body).toBe(req.body);
//         done();
//     }

//     verifyOutboundMessage(req, callback);
// });

// test("an error is in the callback when the message is missing", done => {
//     const req = {
//         body: {
//             phoneNumber: 123456789,
//         },
//     };
//     function callback(err: string, body: any) {
//         expect(err).toBe("message is required");
//         done();
//     }
//     verifyOutboundMessage(req, callback);
// });

// test("an error is in the callback when the phoneNumber is missing", done => {
//     const req = {
//         body: {
//             message: "test",
//         },
//     };
//     function callback(err: string, body: any) {
//         expect(err).toBe("phoneNumber is required");
//         done();
//     }
//     verifyOutboundMessage(req, callback);
// });

// test("an error is in the callback when the phoneNumber is not a number", done => {
//     const req = {
//         body: {
//             message: "test",
//             phoneNumber: "test",
//         },
//     };
//     function callback(err: string, body: any) {
//         expect(err).toBe("phoneNumber must only contain numbers [0-9]");
//         done();
//     }
//     verifyOutboundMessage(req, callback);
// });
