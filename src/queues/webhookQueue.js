// src/queues/webhookQueue.js
const { Queue } = require("bullmq");
const Redis = require("ioredis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

// Log para depuração
console.log("Conectando com a URL:", redisUrl);

// Cria as opções de conexão
const connectionOptions = {
  maxRetriesPerRequest: null,
};

// Adiciona a configuração TLS SOMENTE se a URL for de produção (começar com rediss://)
if (redisUrl && redisUrl.startsWith("rediss://")) {
  console.log("Modo de produção detectado. Adicionando opções de TLS.");
  connectionOptions.tls = {
    rejectUnauthorized: false,
  };
}

const redisConnection = new Redis(redisUrl, connectionOptions);

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