const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message,
    });

    console.log("Message SID:", response.sid);
  } catch (error) {
    console.error("Error sending WhatsApp:", error.message);
  }
};

module.exports = sendWhatsAppMessage;