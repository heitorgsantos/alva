const { webhookProcessingQueue } = require("../queues/webhookQueue"); // Adjust path

const webHookCreateFieldsController = async (req, res) => {
  try {
    const jobData = req.body; // This is the { topic, event }

    if (!jobData || !jobData.topic || !jobData.event) {
      return res
        .status(400)
        .json({
          message: "Invalid webhook data: topic and event are required.",
        });
    }

    // Add a job to the queue
    // The job name can be descriptive, e.g., based on the topic
    await webhookProcessingQueue.add(`webhook-${jobData.topic}`, jobData);

    console.log(
      `Webhook event for topic "${jobData.topic}" queued for processing.`
    );
    // Respond quickly to the webhook sender
    return res
      .status(202)
      .json({ message: "Webhook received and queued for processing." });
  } catch (error) {
    console.error("Error adding webhook event to queue:", error);
    // This error is if adding to queue fails (e.g., Redis down)
    return res.status(500).json({ message: "Failed to queue webhook event." });
  }
};

module.exports = { webHookCreateFieldsController };
