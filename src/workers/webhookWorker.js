// src/workers/webhookWorker.js
const { Worker } = require("bullmq");
// Import the shared Redis connection instance from your queue setup
const { redisConnection } = require("../queues/webhookQueue");
const { webHookCreateFieldsService } = require("../service/webHookCreateFieldsService");
require("dotenv").config();

console.log("Webhook worker is starting...");

const worker = new Worker(
  "webhook-processing",
  async (job) => {
    console.log(`Processing job ${job.id} for topic: ${job.data.topic}`);
    try {
      const result = await webHookCreateFieldsService(job.data);

      if (result.status >= 200 && result.status < 300) {
        console.log(`Job ${job.id} completed successfully: `, result.message);
        return result;
      } else {
        console.error(`Job ${job.id} processed with non-success status ${result.status}: `, result.message);
        const error = new Error(typeof result.message === 'string' ? result.message : JSON.stringify(result.message));
        error.status = result.status;
        throw error;
      }
    } catch (error) {
      console.error(`Job ${job.id} failed for topic ${job.data.topic}:`, error.message, error.status ? `Status: ${error.status}` : '');
      if (error.response && error.response.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      throw error;
    }
  },
  {
    // Use the imported shared connection instance
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || "5", 10),
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

worker.on("completed", (job, result) => {
  console.log(`Worker: Job ${job.id} has completed.`);
});

worker.on("failed", (job, err) => {
  console.error(`Worker: Job ${job.id} has failed with ${err.message}. Failed reason: ${job.failedReason}`);
});

console.log("Webhook worker started and listening for jobs...");

module.exports = { worker };