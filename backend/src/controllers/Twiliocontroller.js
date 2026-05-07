import Call from "../models/Call.js";
import Agent from "../models/Agent.js";
import Contact from "../models/Contact.js";
import { io } from "../../server.js";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ─────────────────────────────────────────────────────────────
// TWILIO WEBHOOK — incoming call
// Route: POST /api/calls/webhook/twilio
// ─────────────────────────────────────────────────────────────
export const twilioWebhook = async (req, res) => {
  // Always respond with XML first — Twilio 15s timeout
  const xmlResponse = (msg = "") =>
    res.set("Content-Type", "text/xml").send(`<Response>${msg}</Response>`);

  try {
    const { CallSid, CallStatus, From, To } = req.body;

    console.log(`📞 Twilio webhook: ${CallStatus} | From: ${From} | CallSid: ${CallSid}`);

    if (!CallSid || !From) {
      console.error("❌ Missing CallSid or From");
      return xmlResponse();
    }

    // ── Incoming call started ──
    if (CallStatus === "ringing" || CallStatus === "in-progress") {

      // Duplicate check
      const existing = await Call.findOne({ exotelSid: CallSid });
      if (existing) {
        console.log(`⚠️ Duplicate CallSid ${CallSid} — skip`);
        return xmlResponse("<Hangup/>");
      }

      // ✅ upsert contact — no duplicate error
      let contact;
      try {
        contact = await Contact.findOneAndUpdate(
          { phone: From },
          { $setOnInsert: { phone: From, name: "New Lead" } },
          { upsert: true, new: true }
        );
        console.log(`👤 Contact: ${contact._id} | ${contact.name}`);
      } catch (contactErr) {
        console.error("❌ Contact upsert error:", contactErr.message);
        // Continue even without contact
        contact = null;
      }

      // Round-robin agent assign
      let agent = null;
      try {
        agent = await Agent.findOneAndUpdate(
          { status: "available" },
          { $set: { status: "busy", lastCallTime: new Date() } },
          { sort: { lastCallTime: 1 }, returnDocument: "after" }
        );
        console.log(agent ? `✅ Agent: ${agent.name}` : `📵 No available agents`);
      } catch (agentErr) {
        console.error("❌ Agent find error:", agentErr.message);
      }

      // Create call record
      try {
        const call = await Call.create({
          number:     From,
          type:       "incoming",
          exotelSid:  CallSid,
          agent:      agent?._id || null,
          assignedTo: agent?._id || null,
          contact:    contact?._id || null,
          status:     agent ? "assigned" : "missed",
          startTime:  new Date(),
        });
        console.log(`📝 Call created: ${call._id} | status: ${call.status}`);
        io?.emit("callUpdated");
      } catch (callErr) {
        console.error("❌ Call create error:", callErr.message);
      }

      return xmlResponse(`
        <Say voice="alice">Please wait, connecting you to an agent.</Say>
        <Pause length="2"/>
        <Hangup/>
      `);
    }

    // ── Call ended ──
    if (["completed", "no-answer", "busy", "failed"].includes(CallStatus)) {
      const call = await Call.findOne({ exotelSid: CallSid });

      if (call && call.status !== "completed") {
        const endTime = new Date();
        call.endTime  = endTime;
        call.duration = call.startTime
          ? Math.floor((endTime - new Date(call.startTime)) / 1000) : 0;
        call.status   = CallStatus === "completed" ? "completed" : "missed";
        await call.save();

        if (call.agent) {
          await Agent.findByIdAndUpdate(call.agent, { $set: { status: "available" } });
        }

        io?.emit("callUpdated");
        console.log(`📵 Call ended: ${call.status}`);
      }
    }

    return xmlResponse();

  } catch (error) {
    console.error("❌ Twilio webhook FATAL error:", error.message);
    console.error(error.stack);
    return xmlResponse("<Hangup/>");
  }
};

// ─────────────────────────────────────────────────────────────
// MAKE OUTGOING CALL — Telecaller callback button
// Route: POST /api/calls/outgoing (verifyToken)
// ─────────────────────────────────────────────────────────────
export const makeOutgoingCall = async (req, res) => {
  try {
    const { to, callId } = req.body;
    if (!to) return res.status(400).json({ success: false, message: "Phone number required" });

    const twilioCall = await twilioClient.calls.create({
      url:  `${process.env.BACKEND_URL}/api/calls/webhook/twilio-outgoing`,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    if (callId) {
      await Call.findByIdAndUpdate(callId, {
        $set: { status: "callback_done", callbackAt: new Date() }
      });
    }

    const agent   = await Agent.findOne({ linkedUser: req.user._id });
    const contact = await Contact.findOne({ phone: to });

    const newCall = await Call.create({
      number:     to,
      type:       "outgoing",
      exotelSid:  twilioCall.sid,
      agent:      agent?._id || null,
      assignedTo: agent?._id || null,
      contact:    contact?._id || null,
      status:     "assigned",
      startTime:  new Date(),
    });

    io?.emit("callUpdated");
    return res.status(200).json({ success: true, data: { call: newCall, twilioSid: twilioCall.sid } });

  } catch (error) {
    console.error("Outgoing call error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// TWILIO OUTGOING TWIML
// Route: POST /api/calls/webhook/twilio-outgoing
// ─────────────────────────────────────────────────────────────
export const twilioOutgoingTwiml = (req, res) => {
  return res.set("Content-Type", "text/xml").send(`
    <Response>
      <Say voice="alice">Connecting your call.</Say>
      <Dial timeout="30">
        <Number>${req.body.To}</Number>
      </Dial>
    </Response>
  `);
};