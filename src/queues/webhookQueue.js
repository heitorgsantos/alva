const { Queue } = require("bullmq");
require("dotenv").config();

const getRedisConnectionConfig = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
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
