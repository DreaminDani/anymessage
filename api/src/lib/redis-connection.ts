import redis = require("redis");
let redisConnection = redis; // use redis by default

const redisOptions = {
    host: `${(process.env.NODE_ENV === "test") ? "localhost" : "redis"}`,
    port: 6379,
};

// used for testing to shim real redis
export function injectClient(redisMock: any) {
    redisConnection = redisMock;
}

export const createPublisherClient = () => {
    return redisConnection.createClient(redisOptions);
};

export const eventSubscription = (channel: string, req: any, res: any) => {
    let messageCount = 0;
    const subscriber = redisConnection.createClient(redisOptions);

    subscriber.subscribe(channel);
    subscriber.on("error", (err) => {
        console.error("Redis " + err);
    });

    // When we receive a message from the redis connection
    subscriber.on("message", (channel, message) => {
        messageCount += 1; // Increment our message count

        res.write("id: " + messageCount + "\n");
        res.write("data: " + message + "\n\n"); // Note the extra newline
    });

    // send headers for event-stream connection
    res.writeHead(200, {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "X-Accel-Buffering": "no",
    });
    res.write("\n");

    const intervalId = setInterval(() => {
        res.write(`id: ${messageCount}\n`);
        res.write(`: keep alive ${Date.now()}\n\n`);
        messageCount += 1;
    }, 1000);

    // The 'close' event is fired when a user closes their browser window.
    // In that situation we want to make sure our redis channel subscription
    // is properly shut down to prevent memory leaks...and incorrect subscriber
    // counts to the channel.
    req.on("close", () => {
        clearInterval(intervalId);
        subscriber.unsubscribe();
        subscriber.quit();
    });
};
