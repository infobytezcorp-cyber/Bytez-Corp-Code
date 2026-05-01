import mongoose from "mongoose";
import Agent from "../models/Agent.js";

// ─── Create agent ─────────────────────────────────────────────
export const createAgent = async (req, res) => {
  try {
    const { name } = req.body;

    // validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Agent name is required"
      });
    }

    // check user exists?
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // check if agent already exists for this user
    const existing = await Agent.findOne({ linkedUser: req.user._id });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Agent already exists for this user"
      });
    }

    // create agent with auto link
    const agent = await Agent.create({
      name: name.trim(),
      status: "available",
      lastCallTime: null,
      linkedUser: req.user._id   // AUTO LINK
    });

    res.status(201).json({
      success: true,
      data: agent
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── Toggle break ────

export const toggleBreak = async (req, res) => {
  try {
    const { id } = req.params;

    // ── Validate ID ─────────────────────────
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID"
      });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }

    // ── Prevent break during call ──────
    if (agent.status === "busy") {
      return res.status(400).json({
        success: false,
        message: "Agent is on a call"
      });
    }

    const updateData = {};
    let breakLogEntry = null;

    //  END BREAK
    if (agent.status === "break") {

      if (!agent.breakStartTime) {
        console.warn(`Agent ${id} breakStartTime missing — resetting`);

        updateData.status = "available";
        updateData.breakStartTime = null;

      } else {
        const breakStartTime = agent.breakStartTime;
        const now = new Date();

        const breakDurationMs = now - new Date(breakStartTime);

        // Safety check
        if (breakDurationMs < 0) {
          console.warn(`Negative break duration for agent ${id}`);

          updateData.status = "available";
          updateData.breakStartTime = null;

        } else {
          const breakDurationMinutes = Math.floor(breakDurationMs / 1000 / 60);

          //  Max limit protection (1 day)
          const MAX_BREAK_MINUTES = 24 * 60;
          const safeMinutes = Math.min(breakDurationMinutes, MAX_BREAK_MINUTES);

          updateData.status = "available";
          updateData.breakStartTime = null;

          //  total break tracker
          updateData.totalBreakMinutes =
            (agent.totalBreakMinutes || 0) + safeMinutes;

          //  Create log entry (SAFE)
          breakLogEntry = {
            breakStart: breakStartTime,
            breakEnd: now,
            durationMinutes: safeMinutes
          };
        }
      }

      // =========================================================
      //  START BREAK
      // =========================================================
    } else {

      if (agent.status !== "available") {
        return res.status(400).json({
          success: false,
          message: `Cannot start break from status: ${agent.status}`
        });
      }

      updateData.status = "break";
      updateData.breakStartTime = new Date();
    }

    //  FINAL UPDATE
    const updated = await Agent.findByIdAndUpdate(
      id,
      {
        $set: updateData,
        ...(breakLogEntry && {
          $push: { breakLogs: breakLogEntry }
        })
      },
      {
        returnDocument: "after", //  FIXED (no deprecation)
        runValidators: true
      }
    );

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Failed to update agent"
      });
    }

    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error("toggleBreak error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && {
        debug: error.message
      })
    });
  }
};

// ─── Get all agents (admin dashboard) ────────────────────────
export const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get break logs (admin time logs tab) ────────────────────
export const getBreakLogs = async (req, res) => {
  try {
    const agents = await Agent.find(
      {},
      "name totalBreakMinutes breakStartTime status breakLogs"
    );
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get MY agent record (agent's own dashboard) ─────────────
export const getMyAgent = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const agent = await Agent.findOne({ linkedUser: req.user._id });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "No agent profile linked to your account"
      });
    }

    res.json({ success: true, data: agent });

  } catch (error) {
    console.error("getMyAgent error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && { debug: error.message })
    });
  }
};

// ─── Link user to agent (admin use) ──────────────────────────
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

    const now = new Date();

    const diff = Math.max(0, now - new Date(agent.loginTime));
    const durationMinutes = Math.floor(diff / 1000 / 60);

    // push history
    agent.loginHistory.push({
      loginTime: agent.loginTime,
      logoutTime: now,
      durationMinutes
    });

    // reset fields
    agent.loginTime = null;
    agent.status = "offline";

    await agent.save();

    res.json({ success: true });

  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};