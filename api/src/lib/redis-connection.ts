
import redis = require("redis");

const redisOptions = {
    host: 'redis',
    port: 6379
};

export const publisherClient = redis.createClient(redisOptions);

export const eventSubscription = (channel: string, req: any, res: any) => {
    var messageCount = 0;
    var subscriber = redis.createClient(redisOptions);
    
    subscriber.subscribe(channel);
    subscriber.on("error", function(err) {
        console.error("Redis " + err);
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
};