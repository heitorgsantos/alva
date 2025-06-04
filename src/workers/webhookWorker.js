const { Worker } = require("bullmq");
// const { webHookCreateFieldsService } = require("../services/webHookCreateFieldsService"); // Adjust path if needed
const { connection } = require("../queues/webhookQueue"); // Reuse connection options
const { webHookCreateFieldsService } = require("../service/webHookCreateFieldsService");
require("dotenv").config();

const worker = new Worker(
  "webhook-processing", // Must match the queue name
  async (job) => {
    console.log(`Processing job ${job.id} for topic: ${job.data.topic}`);
    try {
      // The job.data will be the 'data' object passed when the job was added
      // (which is req.body from the controller)
      const result = await webHookCreateFieldsService(job.data);

      // You might want to log the result or handle it based on the status
      if (result.status >= 200 && result.status < 300) {
        console.log(`Job ${job.id} completed successfully: `, result.message);
        return result; // Job successful
      } else {
        console.error(`Job ${job.id} processed with non-success status ${result.status}: `, result.message);
        // Decide if this should be treated as a failure that needs retry
        // For now, we'll let BullMQ's retry mechanism handle actual thrown errors.
        // If a specific status code from your service means "don't retry", handle here.
        // Throw an error to make BullMQ retry or mark as failed.
        const error = new Error(typeof result.message === 'string' ? result.message : JSON.stringify(result.message));
        error.status = result.status;
        throw error;
      }
    } catch (error) {
      console.error(`Job ${job.id} failed for topic ${job.data.topic}:`, error.message, error.status ? `Status: ${error.status}` : '');
      // Re-throw the error so BullMQ can handle retries/failure
      // The error object thrown by your service (e.g., { status: ..., message: ... })
      // will be available in job.failedReason
      if (error.response && error.response.data) { // HubSpot specific error structure
        throw new Error(JSON.stringify(error.response.data));
      }
      throw error;
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || "5", 10), // Process 5 jobs concurrently
    limiter: { // Optional: Rate limiting
      max: 10, // Max 10 jobs
      duration: 1000, // per 1 second (adjust based on HubSpot API limits)
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

module.exports = { worker }; // Export if you need to manage it elsewhere