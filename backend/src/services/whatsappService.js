import twilio from 'twilio';

// Read envs at call time so values injected after import are picked up
const sendWhatsAppMessage = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE;

  console.log('sendWhatsAppMessage env ->', { ACCOUNT_SID: !!accountSid, AUTH_TOKEN: !!authToken, WHATSAPP_FROM: !!whatsappFrom });

  if (!accountSid || !authToken || !whatsappFrom) {
    console.warn('Twilio creds or from number missing; skipping sendWhatsAppMessage');
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    const response = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${to}`,
      body: message,
    });

    console.log('sendWhatsAppMessage SID:', response.sid);
  } catch (error) {
    console.error('Error sending WhatsApp via API:', error && error.message ? error.message : error);
  }
};

export default sendWhatsAppMessage;