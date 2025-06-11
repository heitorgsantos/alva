// src/queues/webhookQueue.js
const { Queue } = require("bullmq");
const Redis = require("ioredis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

// Let's create the connection options object
let redisConnection;

if (redisUrl) {
    console.log("Initializing Redis connection with URL:", redisUrl);
    // When using a `rediss://` URL from a provider like Render,
    // ioredis typically handles TLS automatically. However, explicitly
    // adding the tls object can resolve ambiguity.
    redisConnection = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        // Add this tls object to be explicit, especially if your URL is just redis://
        tls: {
            rejectUnauthorized: false // This can help bypass cert issues in some environments.
                                    // For high security, you might need to configure this properly.
        }
    });
} else {
    console.log("Initializing Redis connection with Host/Port");
    redisConnection = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        maxRetriesPerRequest: null,
    });
}


const webhookProcessingQueue = new Queue("webhook-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      count: 1000,
      age: 24 * 60 * 60,
    },
    removeOnFail: {
      count: 5000,
      age: 7 * 24 * 60 * 60,
    },
  },
});

module.exports = { webhookProcessingQueue, redisConnection };