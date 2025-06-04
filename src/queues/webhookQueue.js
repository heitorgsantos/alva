const { Queue } = require("bullmq");
require("dotenv").config();

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  // password: process.env.REDIS_PASSWORD, // Uncomment if you have a password
};

// Define a queue named 'webhook-processing'
const webhookProcessingQueue = new Queue("webhook-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3, // Number of times to retry a failed job
    backoff: {
      type: "exponential",
      delay: 5000, // Delay for the first retry in ms (5 seconds)
    },
    removeOnComplete: {
      count: 1000, // Keep up to 1000 successful jobs
      age: 24 * 60 * 60, // Keep successful jobs for up to 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep up to 5000 failed jobs
      age: 7 * 24 * 60 * 60, // Keep failed jobs for up to 7 days
    },
  },
});

module.exports = { webhookProcessingQueue, connection };