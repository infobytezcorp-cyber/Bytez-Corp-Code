import express from 'express';
import twilio from 'twilio';
import Enquiry from '../models/Enquiry.js';
import WhatsAppLead from '../models/WhatsAppLead.js';
import sendWhatsAppMessage from '../services/whatsappService.js';

const router = express.Router();

// Helper to parse the filled form
function parseTemplate(text) {
  const nameMatch = text.match(/Name[:\s]*([^\n\r]+)/i);
  const serviceMatch = text.match(/Service[:\s]*([^\n\r]+)/i);
  const contactMatch = text.match(/Contact[:\s]*([^\n\r]+)/i);
  
  if (!nameMatch || !serviceMatch) return null;
  
  return {
    elderName: nameMatch[1].trim(),
    careType: serviceMatch[1].trim(),
    contact: contactMatch ? contactMatch[1].trim() : ''
  };
}

router.post('/whatsapp/webhook', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    // Debug logging: headers + body
    console.log('--- Twilio Webhook Received ---');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body:', JSON.stringify(req.body));

    const fromRaw = req.body.From || '';
    const text = (req.body.Body || '').trim();
    const phone = String(fromRaw).replace(/\D/g, '');
    const twiml = new twilio.twiml.MessagingResponse();

    if (!phone) return res.status(400).send('Missing phone');

    // 1. Handle Sandbox Activation or Greeting
    if (text.toLowerCase().includes('pictured-had') || /^(hi|hello|hey)$/i.test(text)) {
      // Create or update a WhatsAppLead document to track the conversation
      let leadDoc = await WhatsAppLead.findOne({ phone }).sort({ createdAt: -1 });
      if (!leadDoc) {
        leadDoc = new WhatsAppLead({ phone, elderName: 'Pending...', source: 'WhatsApp', timeline: [], });
      }
      leadDoc.timeline.push({ event: 'greeting', text, date: new Date().toISOString() });
      await leadDoc.save();

      twiml.message(
        "HI Welcome to *Thatha Patti Elders Foundation*! 🙏\n\n" +
        "To help us provide the best care, please answer a few questions.\n\n" +
        "Please *copy, fill, and send* the form below:\n\n" +
        "Name: \n" +
        "Service: (HomeCare / Health Care) \n" +
        "Contact: "
      );
      // Attempt API fallback send as well
      sendWhatsAppMessage(phone, "HI Welcome to Thatha Patti Elders Foundation!\n\nPlease copy, fill, and send:\nName:\nService: (HomeCare / Health Care)\nContact:");
      return res.type('text/xml').send(twiml.toString());
    }

    // 2. Handle Template Submission
    const parsed = parseTemplate(text);
    if (parsed) {
      let leadDoc = await WhatsAppLead.findOne({ phone }).sort({ createdAt: -1 });
      if (!leadDoc) {
        leadDoc = new WhatsAppLead({ phone, timeline: [] });
      }

      leadDoc.elderName = parsed.elderName;
      leadDoc.careType = parsed.careType;
      leadDoc.contact = parsed.contact || '';
      leadDoc.notes = `Incoming template: ${text}`;
      leadDoc.timeline.push({ event: 'template_filled', text, date: new Date().toISOString() });
      await leadDoc.save();

      twiml.message("Thanks! Your details have been saved. Our agent will contact you shortly.");
      // Fallback API send
      sendWhatsAppMessage(phone, "Thanks! Your details have been saved. Our agent will contact you shortly.");
      return res.type('text/xml').send(twiml.toString());
    }

    // 3. Fallback if they send something else while in Step 1
    let activeLead = await WhatsAppLead.findOne({ phone }).sort({ createdAt: -1 });
    if (activeLead && activeLead.timeline && activeLead.timeline.length > 0) {
      twiml.message("Please use the format below to send your details:\n\nName: \nService: \nContact: ");
      return res.type('text/xml').send(twiml.toString());
    }

    // Default Fallback
    twiml.message("Welcome! Type 'Hi' to start the registration process.");
    return res.type('text/xml').send(twiml.toString());

  } catch (err) {
    console.error('Twilio Webhook Error:', err);
    res.status(500).send('Error');
  }
});

export default router;