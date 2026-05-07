import Call from "../models/Call.js";
import Agent from "../models/Agent.js";
import Contact from "../models/Contact.js";
import { io } from "../../server.js";
import twilio from "twilio";
const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

// ─────────────────────────────────────────────────────────────
// GENERATE ACCESS TOKEN
// Route: GET /api/calls/token (verifyToken)
// ─────────────────────────────────────────────────────────────
export const generateToken = (req, res) => {
  try {
    const identity = req.user._id.toString();

    const token = new AccessToken(
      process.env.TWILIO_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity, ttl: 3600 }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);
    console.log(`🔑 Token generated for: ${identity}`);

    return res.status(200).json({
      success: true,
      token: token.toJwt(),
      identity,
    });
  } catch (error) {
    console.error("Token generation error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// TWILIO WEBHOOK — incoming call
// Route: POST /api/calls/webhook/twilio
// ─────────────────────────────────────────────────────────────
export const twilioWebhook = async (req, res) => {
  const xmlResponse = (msg = "") =>
    res.set("Content-Type", "text/xml").send(`<Response>${msg}</Response>`);

  try {
    const { CallSid, CallStatus, From, To } = req.body;
    console.log(`📞 Twilio webhook: ${CallStatus} | From: ${From} | CallSid: ${CallSid}`);

    if (!CallSid || !From) return xmlResponse();

    if (
      !CallStatus ||
      CallStatus === "initiated" ||
      CallStatus === "ringing" ||
      CallStatus === "in-progress"
    ) {
      // Duplicate check by CallSid
      const existingBySid = await Call.findOne({ exotelSid: CallSid });
      if (existingBySid) {
        console.log(`⚠️ Duplicate CallSid — skip`);
        return xmlResponse("<Hangup/>");
      }

      // 15s duplicate guard
      const recentDup = await Call.findOne({
        number: From,
        createdAt: { $gte: new Date(Date.now() - 15000) },
      });
      if (recentDup) {
        console.log(`⚠️ Recent duplicate — skip`);
        return xmlResponse();
      }

      // Upsert contact
      let contact = null;
      try {
        contact = await Contact.findOneAndUpdate(
          { phone: From },
          { $setOnInsert: { phone: From, name: "New Lead" } },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("Contact upsert error:", err.message);
      }

      // ── STEP 1: Available agent ──
      // ✅ FIX: linkedUser populate சேர்த்தோம்
      // முன்னாடி: populate இல்லாம — assignedAgent.linkedUser = raw ObjectId
      // Twilio identity = req.user._id (User collection _id)
      // Agent.linkedUser = User._id reference
      // இரண்டும் match ஆகணும் — populate பண்ணி confirm பண்றோம்
      let assignedAgent = null;
      let callStatus = "incoming";

      assignedAgent = await Agent.findOneAndUpdate(
        { status: "available" },
        { $set: { status: "ringing", lastCallTime: new Date() } },
        { sort: { lastCallTime: 1 }, returnDocument: "after" }
      ).populate("linkedUser", "_id"); // ✅ FIX: _id மட்டும் போதும்

      if (assignedAgent) {
        callStatus = "ringing";
        console.log(`📞 Ringing → ${assignedAgent.name}`);
      } else {
        // ── STEP 2: All busy — round-robin missed ──
        const busyAgent = await Agent.findOne({ status: "busy" })
          .sort({ lastCallTime: 1 })
          .populate("linkedUser", "_id"); // ✅ FIX

        if (busyAgent) {
          assignedAgent = busyAgent;
          callStatus = "missed";
          await Agent.findByIdAndUpdate(busyAgent._id, { $set: { lastCallTime: new Date() } });
          console.log(`📵 All busy → missed → ${busyAgent.name}`);
        } else {
          callStatus = "incoming";
          console.log("⚠️ No agents — auto-process in 20s");
        }
      }

      const call = await Call.create({
        number: From,
        type: "incoming",
        exotelSid: CallSid,
        agent: assignedAgent?._id || null,
        assignedTo: assignedAgent?._id || null,
        contact: contact?._id || null,
        status: callStatus,
        autoAssign: false,
        startTime: assignedAgent && callStatus === "assigned" ? new Date() : null,
      });
      console.log(`📝 Call created: ${call._id} | status: ${call.status}`);
      io?.emit("callUpdated");

      // ── 20s auto-process ──
      if (callStatus === "incoming") {
        setTimeout(async () => {
          try {
            const existing = await Call.findById(call._id);
            if (!existing || existing.status !== "incoming") return;

            const agent = await Agent.findOneAndUpdate(
              { status: "available" },
              { $set: { status: "busy", lastCallTime: new Date() } },
              { sort: { lastCallTime: 1 }, returnDocument: "after" }
            ).populate("linkedUser", "_id"); // ✅ FIX

            if (agent) {
              existing.status = "assigned"; existing.agent = agent._id;
              existing.assignedTo = agent._id; existing.startTime = new Date();
              console.log(`✅ Auto-assigned after 20s → ${agent.name}`);
            } else {
              const anyAgent = await Agent.findOne().sort({ lastCallTime: 1 });
              existing.status = "missed";
              existing.agent = anyAgent?._id || null;
              existing.assignedTo = anyAgent?._id || null;
              existing.startTime = new Date();
              if (anyAgent) await Agent.findByIdAndUpdate(anyAgent._id, { $set: { lastCallTime: new Date() } });
            }
            await existing.save();
            io?.emit("callUpdated");
          } catch (err) {
            console.error("Auto-miss error:", err.message);
          }
        }, 20000);
      }

      // ── TwiML Response ──
      // ✅ FIX: linkedUser._id (populated object) அல்லது raw ObjectId — இரண்டையும் handle
      if (assignedAgent?.linkedUser) {
        // linkedUser populated object-ஆ இருந்தா ._id, raw ObjectId-ஆ இருந்தா directly
        const agentIdentity =
          (assignedAgent.linkedUser._id
            ? assignedAgent.linkedUser._id.toString()
            : assignedAgent.linkedUser.toString());

        console.log(`📲 Dialing browser client: ${agentIdentity}`);

        if (callStatus === "ringing") {
          io?.emit("incomingCall", {
            callId: call._id,
            agentId: assignedAgent._id,
            agentName: assignedAgent.name,
            phone: From,
            customerName: contact?.name || "Unknown",
          });
        }

        return xmlResponse(`
          <Dial callerId="${To}"
                record="record-from-answer"
                recordingStatusCallback="${process.env.BACKEND_URL}/api/calls/webhook/recording"
                recordingStatusCallbackMethod="POST">
            <Client>${agentIdentity}</Client>
          </Dial>
        `);
      }

      return xmlResponse(`<Hangup/>`);
    }

    // ── Call ended ──
    if (["completed", "no-answer", "busy", "failed"].includes(CallStatus)) {
      const call = await Call.findOne({ exotelSid: CallSid });
      if (call && call.status !== "completed") {
        const endTime = new Date();
        call.endTime = endTime;
        call.duration = call.startTime
          ? Math.floor((endTime - new Date(call.startTime)) / 1000) : 0;
        call.status = CallStatus === "completed" ? "completed" : "missed";
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
    console.error("❌ Twilio webhook FATAL:", error.message);
    return xmlResponse("<Hangup/>");
  }
};

// ─────────────────────────────────────────────────────────────
// RECORDING WEBHOOK
// Route: POST /api/calls/webhook/recording
// ─────────────────────────────────────────────────────────────
export const recordingWebhook = async (req, res) => {
  try {
    const { CallSid, RecordingSid, RecordingUrl, RecordingDuration, RecordingStatus } = req.body;
    console.log(`🎙️ Recording webhook: ${RecordingStatus} | CallSid: ${CallSid}`);

    if (RecordingStatus !== "completed") return res.sendStatus(200);

    const fullUrl = RecordingUrl.replace(
      "https://",
      `https://${process.env.TWILIO_SID}:${process.env.TWILIO_AUTH}@`
    ) + ".mp3";

    const call = await Call.findOneAndUpdate(
      { exotelSid: CallSid },
      {
        $set: {
          recordingUrl: fullUrl,
          recordingSid: RecordingSid,
          recordingDuration: parseInt(RecordingDuration) || 0,
        }
      },
      { new: true }
    );

    if (call) {
      console.log(`✅ Recording saved for call: ${call._id}`);
      io?.emit("callUpdated");
    } else {
      console.warn(`⚠️ Call not found for CallSid: ${CallSid}`);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Recording webhook error:", error.message);
    return res.sendStatus(200);
  }
};

// ─────────────────────────────────────────────────────────────
// MAKE OUTGOING CALL
// Route: POST /api/calls/outgoing (verifyToken)
// ─────────────────────────────────────────────────────────────
export const makeOutgoingCall = async (req, res) => {
  try {
    const { to, callId } = req.body;
    if (!to) return res.status(400).json({ success: false, message: "Phone number required" });

    const twilioCall = await twilioClient.calls.create({
      url: `${process.env.BACKEND_URL}/api/calls/webhook/twilio-outgoing`,
      to,
      from: process.env.TWILIO_PHONE,
      record: true,
      recordingStatusCallback: `${process.env.BACKEND_URL}/api/calls/webhook/recording`,
    });

    if (callId) {
      await Call.findByIdAndUpdate(callId, { $set: { status: "callback_done", callbackAt: new Date() } });
    }

    const agent = await Agent.findOne({ linkedUser: req.user._id });
    const contact = await Contact.findOne({ phone: to });

    const newCall = await Call.create({
      number: to,
      type: "outgoing",
      exotelSid: twilioCall.sid,
      agent: agent?._id || null,
      assignedTo: agent?._id || null,
      contact: contact?._id || null,
      status: "assigned",
      startTime: new Date(),
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
  const To = req.body.To;
  console.log(`📲 Outgoing TwiML → To: ${To}`);

  return res.set("Content-Type", "text/xml").send(`
    <Response>
      <Say voice="alice">Connecting your call.</Say>
      <Dial timeout="30"
            record="record-from-answer"
            recordingStatusCallback="${process.env.BACKEND_URL}/api/calls/webhook/recording"
            recordingStatusCallbackMethod="POST">
        <Number>${To}</Number>
      </Dial>
    </Response>
  `);
};