import mongoose from "mongoose";
import { io } from "../../server.js";
import Call from "../models/Call.js";
import Agent from "../models/Agent.js";
import Contact from "../models/Contact.js";

export const createCall = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { number, type, contactId, autoAssign = true } = req.body;

    if (!number || !type) {
      throw new Error("Number and type are required");
    }

    // CONTACT LOGIC
    let contact;

    if (contactId) {
      contact = await Contact.findById(contactId).session(session);
    } else {
      contact = await Contact.findOne({ phone: number }).session(session);

      if (!contact) {
        const newContact = await Contact.create([{
          phone: number,
          name: "New Lead"
        }], { session });

        contact = newContact[0];
      }
    }

    // AGENT ASSIGNMENT
    let assignedAgent = null;

    if (autoAssign) {
      assignedAgent = await Agent.findOneAndUpdate(
        { status: "available" },
        {
          $set: {
            status: "busy",
            lastCallTime: new Date()
          }
        },
        {
          sort: { lastCallTime: 1 },
          returnDocument: "after",
          session
        }
      );
    }

    // CREATE CALL
    const newCall = await Call.create([{
      number,
      type,
      agent: assignedAgent?._id || null,
      contact: contact?._id || null,
      status: assignedAgent ? "assigned" : "incoming",
      autoAssign,
      startTime: assignedAgent ? new Date() : null
    }], { session });

    const call = newCall[0];

    await session.commitTransaction();
    session.endSession();

    // AUTO MISSED LOGIC (CORRECT PLACE)
    if (!assignedAgent) {
      setTimeout(async () => {
        try {
          const existingCall = await Call.findById(call._id);

          if (existingCall && existingCall.status === "incoming") {
            existingCall.status = "missed";
            await existingCall.save();

            console.log(" Call marked as MISSED:", call._id);

            global.io?.emit("callUpdated");
          }
        } catch (err) {
          console.error("Auto missed error:", err.message);
        }
      }, 20000); // 20 sec
    }

    //  REAL-TIME UPDATE
    global.io?.emit("callUpdated");

    res.status(200).json({
      success: true,
      data: call
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const assignCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid call ID"
      });
    }

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: "Agent ID is required"
      });
    }

    // 🔹 Check call
    const call = await Call.findById(id);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found"
      });
    }

    // 🔹 Assign agent
    call.agent = agentId;
    call.status = "assigned";
    call.startTime = new Date();

    await call.save();

    // 🔹 Update agent status
    await Agent.findByIdAndUpdate(agentId, {
      status: "busy",
      lastCallTime: new Date()
    });

    global.io?.emit("callUpdated");

    return res.status(200).json({
      success: true,
      data: call
    });

  } catch (error) {
    console.error("ASSIGN CALL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const endCall = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { remark } = req.body || {};

    // 🔹 Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid call ID");
    }

    const call = await Call.findById(id).session(session);

    if (!call) {
      throw new Error("Call not found");
    }

    if (call.status === "completed") {
      throw new Error("Call already ended");
    }

    // 🔹 Update call
    const endTime = new Date();
    call.status = "completed";
    call.endTime = endTime;

    let durationSec = 0;
    if (call.startTime) {
      durationSec = Math.floor(
        (endTime - new Date(call.startTime)) / 1000
      );
    }

    call.duration = durationSec;

    await call.save({ session });

    let agentId = call.agent;

    // 🔹 Free agent first
    if (agentId) {
      await Agent.findByIdAndUpdate(
        agentId,
        { $set: { status: "available" } },
        { session }
      );
    }

    // AUTO ASSIGN NEXT CALL
    if (agentId) {
      const nextCall = await Call.findOne({ status: "incoming" })
        .sort({ createdAt: 1 }) // FIFO queue
        .session(session);

      if (nextCall) {
        nextCall.agent = agentId;
        nextCall.status = "assigned";
        nextCall.startTime = new Date();

        await nextCall.save({ session });

        // Make agent busy again
        await Agent.findByIdAndUpdate(
          agentId,
          {
            status: "busy",
            lastCallTime: new Date()
          },
          { session }
        );

        console.log("AUTO ASSIGNED NEXT CALL:", nextCall._id);
      }
    }

    // 🔹 Push call log to contact
    if (call.contact && call.startTime) {
      await Contact.findByIdAndUpdate(
        call.contact,
        {
          $push: {
            callLogs: {
              agent: call.agent,
              calledAt: call.startTime,
              duration: durationSec,
              status: "completed",
              remark: remark || "",
              exotelSid: call.exotelSid || null
            }
          },
          $set: { status: "called" }
        },
        { session }
      );
    }

    // Commit transaction AFTER everything
    await session.commitTransaction();
    session.endSession();

    global.io?.emit("callUpdated");

    return res.status(200).json({
      success: true,
      data: call
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("END CALL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Unga callbackCall — contact field mattum add panninen, logic touch pannala
export const callbackCall = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid call ID format"
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldCall = await Call.findById(req.params.id).session(session);

    if (!oldCall) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Original call not found"
      });
    }

    if (oldCall.status === "callback_done") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Callback already done for this call"
      });
    }

    if (!["missed", "completed"].includes(oldCall.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Cannot callback a call with status: ${oldCall.status}`
      });
    }

    // Unga original atomic assign — touch pannala
    const assignedAgent = await Agent.findOneAndUpdate(
      { status: "available" },
      { $set: { status: "busy", lastCallTime: new Date() } },
      { sort: { lastCallTime: 1 }, returnDocument: "after", session }
    );

    await Call.findByIdAndUpdate(
      oldCall._id,
      { $set: { status: "callback_done" } },
      { session }
    );

    const [newCall] = await Call.create(
      [{
        number: oldCall.number,
        type: "outgoing",
        status: assignedAgent ? "assigned" : "missed",
        agent: assignedAgent?._id || null,
        contact: oldCall.contact || null,  // ← carry over contact
        startTime: new Date()
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    global.io?.emit("callUpdated");
    return res.status(201).json({
      success: true,
      message: assignedAgent
        ? "Callback initiated and agent assigned"
        : "Callback created but no agents available",
      data: {
        callbackCall: newCall,
        assignedAgent: assignedAgent
          ? { id: assignedAgent._id, name: assignedAgent.name }
          : null
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("callbackCall error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && { debug: error.message })
    });
  }
};


// Exotel webhook — call end aana Exotel இதை hit pannum — new addition
export const exotelWebhook = async (req, res) => {
  try {
    const { CallSid, Status, Direction } = req.body;

    if (!CallSid) {
      return res.status(400).json({ success: false, message: "CallSid missing" });
    }

    const call = await Call.findOne({ exotelSid: CallSid });

    if (!call) {
      // Exotel expects 200 always — so return 200 even if not found
      console.warn(`Webhook: Call not found for SID ${CallSid}`);
      return res.status(200).json({ success: false, message: "Call not found" });
    }

    if (Status === "completed" && call.status !== "completed") {
      // Reuse endCall logic — internal helper
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        call.status = "completed";
        call.endTime = new Date();
        await call.save({ session });

        if (call.agent) {
          await Agent.findByIdAndUpdate(
            call.agent,
            { $set: { status: "available" } },
            { session }
          );
        }

        if (call.contact) {
          const durationSec = Math.floor(
            (call.endTime - new Date(call.startTime)) / 1000
          );
          await Contact.findByIdAndUpdate(
            call.contact,
            {
              $push: {
                callLogs: {
                  agent: call.agent,
                  calledAt: call.startTime,
                  duration: durationSec,
                  status: "completed",
                  exotelSid: CallSid
                }
              },
              $set: { status: "called" }
            },
            { session }
          );
        }

        await session.commitTransaction();
        session.endSession();
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Webhook transaction error:", err);
      }
    }

    // Exotel always needs 200
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("exotelWebhook error:", error);
    return res.status(200).json({ success: false }); // Still 200 for Exotel
  }
};


// Unga original getAllCalls — touch pannala
export const getAllCalls = async (req, res) => {
  try {
    const calls = await Call.find()
      .populate("agent", "name status")
      .populate("contact", "name phone")   // ← contact name kooda show aagum
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: calls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyCallLogs = async (req, res) => {
  try {
    const agent = await Agent.findOne({ linkedUser: req.user._id });

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const { from, to } = req.query;

    const filter = { agent: agent._id };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const calls = await Call.find(filter)
      .populate("contact", "name phone")
      .sort({ createdAt: -1 })
      .limit(100);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCalls = calls.filter(c => new Date(c.createdAt) >= today);
    const answered   = calls.filter(c => c.status === "completed");
    const missed     = calls.filter(c => c.status === "missed");

    res.status(200).json({
      success: true,
      data: {
        calls,
        stats: {
          filtered: calls.length,
          today: todayCalls.length,
          answered: answered.length,
          missed: missed.length
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};