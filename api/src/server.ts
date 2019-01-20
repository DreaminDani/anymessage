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
import redis = require("redis");

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

const redisOptions = {
    host: 'redis',
    port: 6379
};
const publisherClient = redis.createClient(redisOptions);

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

    // todo move these to a /messages controller
    app.get('/update-stream', cors(corsOptions), function(req, res) {      
        var messageCount = 0;
        var subscriber = redis.createClient(redisOptions);
      
        subscriber.subscribe("updates");
      
        // In case we encounter an error...print it out to the console
        subscriber.on("error", function(err) {
          console.log("Redis " + err);
        });
      
        // When we receive a message from the redis connection
        subscriber.on("message", function(channel, message) {
            messageCount += 1; // Increment our message count
      
          res.write('id: ' + messageCount + '\n');
          res.write("data: " + message + '\n\n'); // Note the extra newline
        });
      
        //send headers for event-stream connection
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no',
          'Connection': 'keep-alive'
        });
        res.write('\n');

        const intervalId = setInterval(() => {
            res.write(`id: ${messageCount}\n`);
            res.write(`: keep alive ${Date.now()}\n\n`);
            messageCount += 1;
        }, 1000);
    
      
        // The 'close' event is fired when a user closes their browser window.
        // In that situation we want to make sure our redis channel subscription
        // is properly shut down to prevent memory leaks...and incorrect subscriber
        // counts to the channel.
        req.on("close", function() {
            clearInterval(intervalId);
          subscriber.unsubscribe();
          subscriber.quit();
        });
      });
      
      app.get('/fire-event/:event_name', cors(corsOptions), function(req, res) {
        publisherClient.publish( 'updates', ('"' + req.params.event_name + '" page visited') );
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('All clients have received "' + req.params.event_name + '"');
        res.end();
      });

    http.createServer(app).listen(process.env.API_PORT, () => {
        console.info(`API listening on ${process.env.API_PORT}`);
    });
});
