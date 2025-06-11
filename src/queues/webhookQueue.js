// src/queues/webhookQueue.js
const { Queue } = require("bullmq");
const Redis = require("ioredis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

// Log para depuração final
console.log("VERIFICAÇÃO FINAL: Conectando com a URL:", redisUrl);

// Esta configuração é a mais robusta para a Render
const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: {
    rejectUnauthorized: false // Opção importante para compatibilidade
  }
});

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