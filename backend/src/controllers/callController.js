import mongoose from "mongoose";
import Call from "../models/Call.js";
import Agent from "../models/Agent.js";
import Contact from "../models/Contact.js";
import { io } from "../../server.js";

// ─────────────────────────────────────────────────────────────
// REBALANCE — new agent login ஆனா pending incoming calls assign
// ─────────────────────────────────────────────────────────────
export async function rebalanceCalls() {
  try {
    const incomingCalls = await Call.find({ status: "incoming" }).sort({ createdAt: 1 });
    if (incomingCalls.length === 0) return;

    for (const call of incomingCalls) {
      const agent = await Agent.findOneAndUpdate(
        { status: "available" },
        { $set: { status: "busy", lastCallTime: new Date() } },
        { sort: { lastCallTime: 1 }, returnDocument: "after" }
      );
      if (!agent) break;

      await Call.findByIdAndUpdate(call._id, {
        $set: { agent: agent._id, assignedTo: agent._id, status: "assigned", startTime: new Date() }
      });
      console.log(`✅ Rebalanced → ${agent.name}`);
    }

    io?.emit("callUpdated");
  } catch (err) {
    console.error("rebalanceCalls error:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// 1HR MISSED CALL ALERT
// ─────────────────────────────────────────────────────────────
export function startMissedCallAlerts() {
  setInterval(async () => {
    try {
      const missedCalls = await Call.find({ status: "missed" })
        .populate("assignedTo", "name").sort({ createdAt: 1 });
      if (missedCalls.length === 0) return;

      const map = {};
      for (const c of missedCalls) {
        const name = c.assignedTo?.name || "Unassigned";
        const id   = c.assignedTo?._id?.toString() || "unassigned";
        if (!map[id]) map[id] = { name, count: 0 };
        map[id].count++;
      }
      for (const [agentId, info] of Object.entries(map)) {
        io?.emit("missed-call-alert", {
          agentId, agentName: info.name, count: info.count,
          message: `${info.name} கிட்ட ${info.count} missed call clear ஆகல`,
        });
      }
    } catch (err) {
      console.error("Missed call alert error:", err.message);
    }
  }, 60 * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────
// CREATE CALL
//
// FLOW:
//   available agent இருக்கா?
//     YES → agent "busy" + call "assigned"  (live call)
//     NO  → all busy → round-robin "missed" (callback வேணும்)
//     NO agents → "incoming" → 20s later auto-process
// ─────────────────────────────────────────────────────────────
export const createCall = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { number, type, contactId, autoAssign = true } = req.body;
    if (!number || !type) throw new Error("Number and type are required");

    // Contact
    let contact;
    if (contactId) {
      contact = await Contact.findById(contactId).session(session);
    } else {
      contact = await Contact.findOne({ phone: number }).session(session);
      if (!contact) {
        const [c] = await Contact.create([{ phone: number, name: "New Lead" }], { session });
        contact = c;
      }
    }

    let assignedAgent = null;
    let callStatus    = "incoming";

    if (autoAssign) {
      // Try available agent first
      assignedAgent = await Agent.findOneAndUpdate(
        { status: "available" },
        { $set: { status: "busy", lastCallTime: new Date() } },
        { sort: { lastCallTime: 1 }, returnDocument: "after", session }
      );

      if (assignedAgent) {
        callStatus = "assigned";
        console.log(`📞 Live call → ${assignedAgent.name}`);
      } else {
        // All busy — round-robin missed assignment
        const busyAgent = await Agent.findOne({ status: "busy" })
          .sort({ lastCallTime: 1 }).session(session);

        if (busyAgent) {
          assignedAgent = busyAgent;
          callStatus    = "missed";
          await Agent.findByIdAndUpdate(
            busyAgent._id,
            { $set: { lastCallTime: new Date() } },
            { session }
          );
          console.log(`📵 All busy → missed assigned to ${busyAgent.name}`);
        } else {
          callStatus = "incoming";
          console.log("⚠️ No agents online");
        }
      }
    }

    const [call] = await Call.create([{
      number,
      type,
      agent:      assignedAgent?._id || null,
      assignedTo: assignedAgent?._id || null,
      contact:    contact?._id || null,
      status:     callStatus,
      autoAssign,
      startTime:  assignedAgent ? new Date() : null,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Auto-process truly unassigned calls after 20s
    if (callStatus === "incoming") {
      setTimeout(async () => {
        try {
          const existing = await Call.findById(call._id);
          if (!existing || existing.status !== "incoming") return;

          const agent = await Agent.findOneAndUpdate(
            { status: "available" },
            { $set: { status: "busy", lastCallTime: new Date() } },
            { sort: { lastCallTime: 1 }, returnDocument: "after" }
          );

          if (agent) {
            existing.status = "assigned"; existing.agent = agent._id;
            existing.assignedTo = agent._id; existing.startTime = new Date();
          } else {
            const anyAgent = await Agent.findOne().sort({ lastCallTime: 1 });
            existing.status = "missed";
            existing.agent      = anyAgent?._id || null;
            existing.assignedTo = anyAgent?._id || null;
            existing.startTime  = new Date();
            if (anyAgent) await Agent.findByIdAndUpdate(anyAgent._id, { $set: { lastCallTime: new Date() } });
          }

          await existing.save();
          io?.emit("callUpdated");
        } catch (err) {
          console.error("Auto-miss error:", err.message);
        }
      }, 20000);
    }

    io?.emit("callUpdated");
    res.status(200).json({ success: true, data: call });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// END CALL — agent free + next incoming auto-assign
// ─────────────────────────────────────────────────────────────
export const endCall = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id }     = req.params;
    const { remark } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid call ID");

    const call = await Call.findById(id).session(session);
    if (!call)                       throw new Error("Call not found");
    if (call.status === "completed") throw new Error("Already ended");

    const endTime     = new Date();
    const durationSec = call.startTime
      ? Math.floor((endTime - new Date(call.startTime)) / 1000) : 0;

    call.status = "completed"; call.endTime = endTime; call.duration = durationSec;
    await call.save({ session });

    if (call.agent) {
      // Free agent
      await Agent.findByIdAndUpdate(call.agent, { $set: { status: "available" } }, { session });

      // Auto-assign next incoming
      const next = await Call.findOne({ status: "incoming" }).sort({ createdAt: 1 }).session(session);
      if (next) {
        next.agent = call.agent; next.assignedTo = call.agent;
        next.status = "assigned"; next.startTime = new Date();
        await next.save({ session });
        await Agent.findByIdAndUpdate(call.agent, { $set: { status: "busy", lastCallTime: new Date() } }, { session });
        console.log(`✅ Next incoming auto-assigned`);
      }
    }

    if (call.contact && call.startTime) {
      await Contact.findByIdAndUpdate(call.contact, {
        $push: { callLogs: { agent: call.agent, calledAt: call.startTime, duration: durationSec, status: "completed", remark: remark || "" } },
        $set:  { status: "called" }
      }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    io?.emit("callUpdated");
    return res.status(200).json({ success: true, data: call });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ASSIGN CALL — Admin manual
// ─────────────────────────────────────────────────────────────
export const assignCall = async (req, res) => {
  try {
    const { id } = req.params; const { agentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid call ID" });
    if (!agentId)
      return res.status(400).json({ success: false, message: "Agent ID required" });

    const call = await Call.findById(id);
    if (!call) return res.status(404).json({ success: false, message: "Call not found" });

    call.agent = agentId; call.assignedTo = agentId;
    call.status = "missed"; call.startTime = new Date();
    await call.save();

    await Agent.findByIdAndUpdate(agentId, { $set: { lastCallTime: new Date() } });

    io?.emit("callUpdated");
    return res.status(200).json({ success: true, data: call });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// MARK CALLBACK DONE — Telecaller button
// ─────────────────────────────────────────────────────────────
export const markCallbackDone = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid call ID" });

    const agent = await Agent.findOne({ linkedUser: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

    const call = await Call.findById(id);
    if (!call) return res.status(404).json({ success: false, message: "Call not found" });

    if (call.assignedTo?.toString() !== agent._id.toString())
      return res.status(403).json({ success: false, message: "Not your call" });
    if (call.status === "callback_done")
      return res.status(400).json({ success: false, message: "Already done" });

    call.status = "callback_done"; call.callbackAt = new Date();
    await call.save();

    io?.emit("callUpdated");
    return res.status(200).json({ success: true, data: call });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// CALLBACK CALL — Admin side
// ─────────────────────────────────────────────────────────────
export const callbackCall = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ success: false, message: "Invalid call ID" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const oldCall = await Call.findById(req.params.id).session(session);
    if (!oldCall) { await session.abortTransaction(); session.endSession(); return res.status(404).json({ success: false, message: "Not found" }); }
    if (oldCall.status === "callback_done") { await session.abortTransaction(); session.endSession(); return res.status(400).json({ success: false, message: "Already done" }); }

    const agent = await Agent.findOneAndUpdate(
      { status: "available" },
      { $set: { status: "busy", lastCallTime: new Date() } },
      { sort: { lastCallTime: 1 }, returnDocument: "after", session }
    );

    await Call.findByIdAndUpdate(oldCall._id, { $set: { status: "callback_done" } }, { session });

    const [newCall] = await Call.create([{
      number: oldCall.number, type: "outgoing",
      status: agent ? "assigned" : "missed",
      agent: agent?._id || null, assignedTo: agent?._id || null,
      contact: oldCall.contact || null, startTime: new Date(),
    }], { session });

    await session.commitTransaction(); session.endSession();
    io?.emit("callUpdated");
    return res.status(201).json({ success: true, data: { callbackCall: newCall } });
  } catch (error) {
    await session.abortTransaction(); session.endSession();
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET ALL CALLS — Admin
// ─────────────────────────────────────────────────────────────
export const getAllCalls = async (req, res) => {
  try {
    const { date, status, agentId } = req.query;
    const filter = {};
    if (date) {
      const start = new Date(date); start.setHours(0,0,0,0);
      const end   = new Date(date); end.setHours(23,59,59,999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    if (status)  filter.status = status;
    if (agentId) filter.agent  = agentId;

    const calls = await Call.find(filter)
      .populate("agent",      "name status")
      .populate("assignedTo", "name")
      .populate("contact",    "name phone")
      .sort({ createdAt: -1 }).limit(200);

    res.status(200).json({ success: true, data: calls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET MY MISSED CALLS — Telecaller
// ─────────────────────────────────────────────────────────────
export const getMyMissedCalls = async (req, res) => {
  try {
    const agent = await Agent.findOne({ linkedUser: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

    const { date } = req.query;
    const filter   = { assignedTo: agent._id, status: "missed" };
    if (date) {
      const start = new Date(date); start.setHours(0,0,0,0);
      const end   = new Date(date); end.setHours(23,59,59,999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const calls = await Call.find(filter).populate("contact", "name phone").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: calls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET MY CALL LOGS — Telecaller
// ─────────────────────────────────────────────────────────────
export const getMyCallLogs = async (req, res) => {
  try {
    const agent = await Agent.findOne({ linkedUser: req.user._id });
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

    const { from, to } = req.query;
    const filter = { agent: agent._id };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   { const d = new Date(to); d.setHours(23,59,59,999); filter.createdAt.$lte = d; }
    }

    const calls = await Call.find(filter).populate("contact", "name phone").sort({ createdAt: -1 }).limit(100);
    const today = new Date(); today.setHours(0,0,0,0);
    const todayCalls = calls.filter(c => new Date(c.createdAt) >= today);

    res.status(200).json({
      success: true,
      data: {
        calls,
        stats: {
          filtered: calls.length, today: todayCalls.length,
          answered: calls.filter(c => c.status === "completed").length,
          missed:   calls.filter(c => c.status === "missed").length,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// EXOTEL WEBHOOK
// ─────────────────────────────────────────────────────────────
export const exotelWebhook = async (req, res) => {
  try {
    const { CallSid, Status } = req.body;
    if (!CallSid) return res.status(400).json({ success: false, message: "CallSid missing" });

    const call = await Call.findOne({ exotelSid: CallSid });
    if (!call) return res.status(200).json({ success: false, message: "Not found" });

    if (Status === "completed" && call.status !== "completed") {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        call.status = "completed"; call.endTime = new Date();
        await call.save({ session });
        if (call.agent) await Agent.findByIdAndUpdate(call.agent, { $set: { status: "available" } }, { session });
        if (call.contact) {
          const dur = Math.floor((call.endTime - new Date(call.startTime)) / 1000);
          await Contact.findByIdAndUpdate(call.contact, {
            $push: { callLogs: { agent: call.agent, calledAt: call.startTime, duration: dur, status: "completed", exotelSid: CallSid } },
            $set:  { status: "called" }
          }, { session });
        }
        await session.commitTransaction(); session.endSession();
      } catch (err) {
        await session.abortTransaction(); session.endSession();
      }
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(200).json({ success: false });
  }
};