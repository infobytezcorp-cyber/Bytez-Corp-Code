import mongoose from "mongoose";
import Agent from "../models/Agent.js";
import { io } from "../../server.js"; 

// ─── Create agent ─────────────────────────────────────────────
export const createAgent = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Agent name is required" });
    }

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const existing = await Agent.findOne({ linkedUser: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Agent already exists for this user" });
    }

    const agent = await Agent.create({
      name: name.trim(),
      status: "offline", // ✅ FIX 1: was "available" — caused Agent 4 to show online without login
      lastCallTime: null,
      linkedUser: req.user._id
    });

    res.status(201).json({ success: true, data: agent });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login agent ─────────────────────────────────────────────
// ✅ FIX 2: This function was completely missing — loginTime never set, loginHistory never pushed
export const loginAgent = async (req, res) => {
  try {
    const userId = req.user._id;

    const agent = await Agent.findOne({ linkedUser: userId });

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    if (agent.status !== "offline") {
      return res.status(400).json({ success: false, message: "Agent already logged in" });
    }

    agent.status = "available";
    agent.loginTime = new Date();

    await agent.save();

    res.json({ success: true, data: agent });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ─── Logout agent ─────────────────────────────────────────────
export const logoutAgent = async (req, res) => {
  try {
    const userId = req.user._id;

    const agent = await Agent.findOne({ linkedUser: userId });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (!agent.loginTime) {
      return res.status(400).json({ message: "Agent not logged in" });
    }

    if (agent.status === "offline") {
      return res.status(400).json({ message: "Agent already logged out" });
    }

    const now = new Date();
    const diff = Math.max(0, now - new Date(agent.loginTime));
    const durationMinutes = Math.floor(diff / 1000 / 60);

    // ✅ Push complete session to loginHistory
    agent.loginHistory.push({
      loginTime: agent.loginTime,
      logoutTime: now,        // ← this is why logout time wasn't showing
      durationMinutes
    });

    // Reset fields
    agent.loginTime = null;
    agent.status = "offline";
    agent.breakStartTime = null;

    await agent.save();

    res.json({ success: true });

  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};

// ─── Toggle break ─────────────────────────────────────────────
export const toggleBreak = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid agent ID" });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    if (agent.status === "busy") {
      return res.status(400).json({ success: false, message: "Agent is on a call" });
    }

    const updateData = {};
    let breakLogEntry = null;

    if (agent.status === "break") {
      if (!agent.breakStartTime) {
        console.warn(`Agent ${id} breakStartTime missing — resetting`);
        updateData.status = "available";
        updateData.breakStartTime = null;
      } else {
        const now = new Date();
        const breakDurationMs = now - new Date(agent.breakStartTime);

        if (breakDurationMs < 0) {
          updateData.status = "available";
          updateData.breakStartTime = null;
        } else {
          const breakDurationMinutes = Math.floor(breakDurationMs / 1000 / 60);
          const safeMinutes = Math.min(breakDurationMinutes, 24 * 60);

          updateData.status = "available";
          updateData.breakStartTime = null;
          updateData.totalBreakMinutes = (agent.totalBreakMinutes || 0) + safeMinutes;

          breakLogEntry = {
            breakStart: agent.breakStartTime,
            breakEnd: now,
            durationMinutes: safeMinutes
          };
        }
      }
    } else {
      if (agent.status !== "available") {
        return res.status(400).json({ success: false, message: `Cannot start break from status: ${agent.status}` });
      }
      updateData.status = "break";
      updateData.breakStartTime = new Date();
    }

    const updated = await Agent.findByIdAndUpdate(
      id,
      {
        $set: updateData,
        ...(breakLogEntry && { $push: { breakLogs: breakLogEntry } })
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!updated) {
      return res.status(500).json({ success: false, message: "Failed to update agent" });
    }

    return res.status(200).json({ success: true, data: updated });

  } catch (error) {
    console.error("toggleBreak error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Get all agents ───────────────────────────────────────────
export const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get break logs ───────────────────────────────────────────
export const getBreakLogs = async (req, res) => {
  try {
    const agents = await Agent.find({}, "name totalBreakMinutes breakStartTime status breakLogs");
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get my agent ─────────────────────────────────────────────
export const getMyAgent = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const agent = await Agent.findOne({ linkedUser: req.user._id });

    if (!agent) {
      return res.status(404).json({ success: false, message: "No agent profile linked to your account" });
    }

    res.json({ success: true, data: agent });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Link user to agent ───────────────────────────────────────
export const linkUserToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { linkedUser } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid agent ID" });
    }

    const updated = await Agent.findByIdAndUpdate(
      id,
      { $set: { linkedUser: linkedUser ?? null } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    res.json({ success: true, data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forceLogoutAgent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid agent ID" });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.status === "offline") {
      return res.status(400).json({ message: "Agent already offline" });
    }

    if (!agent.loginTime) {
      return res.status(400).json({ message: "Agent has no active login session" });
    }

    const now = new Date();
    const diff = Math.max(0, now - new Date(agent.loginTime));
    const durationMinutes = Math.floor(diff / 1000 / 60);

    //
    agent.loginHistory.push({
      loginTime: agent.loginTime,
      logoutTime: now,
      durationMinutes,
    });

    // If agent was on break, also push break log for the ongoing break
    if (agent.status === "break" && agent.breakStartTime) {
      const breakDurationMs = now - new Date(agent.breakStartTime);
      const breakDurationMinutes = Math.max(0, Math.floor(breakDurationMs / 1000 / 60));

      agent.breakLogs.push({
        breakStart: agent.breakStartTime,
        breakEnd: now,
        durationMinutes: breakDurationMinutes,
      });

      agent.totalBreakMinutes = (agent.totalBreakMinutes || 0) + breakDurationMinutes;
    }

    // Reset fields to log out the agent
    agent.loginTime = null;
    agent.status = "offline";
    agent.breakStartTime = null;

    await agent.save();

    // Emit socket event to notify all clients about the forced logout
    io.emit("force-logout", { agentId: agent._id.toString() });

    res.json({ success: true, data: agent }); // Return updated agent data for UI update
  } catch (err) {
    console.error("Force logout error:", err);
    res.status(500).json({ message: "Force logout failed" });
  }
};