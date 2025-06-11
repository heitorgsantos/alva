// src/controllers/webHookCreateFieldsController.js
const { webhookProcessingQueue } = require("../queues/webhookQueue"); // Ajuste o caminho se necessário

const webHookCreateFieldsController = async (req, res) => {
  try {
    const jobData = req.body;

    console.log(jobData)
    return res
      .status(200)
      .json({ message: "Webhook received and queued for processing." });

    if (!jobData || !jobData.topic || !jobData.event) {
      return res.status(400).json({
        message: "Invalid webhook data: topic and event are required.",
      });
    }

    await webhookProcessingQueue.add(`webhook-${jobData.topic}`, jobData);

    console.log(
      `Webhook event for topic "${jobData.topic}" queued for processing.`
    );
    return res
      .status(202)
      .json({ message: "Webhook received and queued for processing." });
  } catch (error) {
    console.error("Error adding webhook event to queue:", error);
    return res.status(500).json({ message: "Failed to queue webhook event." });
  }
};

module.exports = { webHookCreateFieldsController };
