// src/queues/webhookQueue.js
const { Queue } = require("bullmq");
require("dotenv").config();

// Função para obter a configuração de conexão do Redis
const getRedisConnectionConfig = () => {
  console.log("process.env.REDIS_URL", process.env.REDIS_URL)
  if (process.env.REDIS_URL) {
    console.log("Using REDIS_URL for connection:", process.env.REDIS_URL); // Log para debug
    return process.env.REDIS_URL;
  }
  console.log("Using REDIS_HOST/PORT for connection."); // Log para debug
  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  };
};

const redisConnectionConfig = getRedisConnectionConfig();

const webhookProcessingQueue = new Queue("webhook-processing", {
  connection: redisConnectionConfig,
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

// Exporta a fila e a configuração de conexão para ser usada pelo worker
module.exports = { webhookProcessingQueue, redisConnectionConfig };