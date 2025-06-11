// src/queues/webhookQueue.js
const { Queue } = require("bullmq");
const Redis = require("ioredis"); // Import the ioredis library
require("dotenv").config();

// Determine the Redis connection options
const connectionOptions = process.env.REDIS_URL
  ? process.env.REDIS_URL // If REDIS_URL is provided, use it directly
  : { // Otherwise, use host and port
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
    };

console.log("Initializing Redis connection with:", connectionOptions);

// Create a single, reusable Redis connection instance
const redisConnection = new Redis(connectionOptions, {
    // This option is often needed for cloud Redis providers like Render
    maxRetriesPerRequest: null,
});

// Create the queue, passing the connection instance
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

// Export both the queue and the shared connection instance
module.exports = { webhookProcessingQueue, redisConnection };