/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
// rest client imports
import cors = require("cors");
import express = require("express");
import helmet = require("helmet");
import http = require("http");
import massive = require("massive");

import { getAllowedExpression } from "./helpers";

// helpers and controllers
import {
    ConversationController,
    InboundController,
    IntegrationController,
    TeamController,
    UserController,
} from "./controllers";

// init & middleware
const app = express();

massive({
    database: process.env.POSTGRES_DATABASE,
    host: process.env.DB_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    user: process.env.POSTGRES_USER,
}).then(instance => {

    // share the DB instance
    app.set("db", instance);

    // helmet for standard security
    app.use(helmet());

    const corsOptions = {
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        origin: (process.env.UI_HOSTNAME)
                ? getAllowedExpression(process.env.UI_HOSTNAME)
                : "http://localhost:3000",
    };

    // init controllers
    app.use("/conversation", cors(corsOptions), ConversationController);
    app.use("/integration", cors(corsOptions), IntegrationController);
    app.use("/team", cors(corsOptions), TeamController);
    app.use("/user", cors(corsOptions), UserController);
    app.use("/inbound", InboundController);

    http.createServer(app).listen(process.env.API_PORT, () => {
        console.info(`API listening on ${process.env.API_PORT}`);
    });
});
