import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

const BASE = "/agents";

// ── Fetch my agent ─────────────────────────────────────────
export const fetchMyAgent = createAsyncThunk(
  "myAgent/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`${BASE}/me`);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch agent"
      );
    }
  }
);

// ── Toggle break ───────────────────────────────────────────
export const toggleMyBreak = createAsyncThunk(
  "myAgent/toggleBreak",
  async (agentId, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`${BASE}/${agentId}/break`);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle break"
      );
    }
  }
);

// ── Fetch my call ──────────────────────────────────────────
export const fetchMyCall = createAsyncThunk(
  "myAgent/fetchCall",
  async (agentId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(
        `/calls?agentId=${agentId}&status=assigned`
      );
      const calls = data.data ?? [];
      return calls.find((c) => c.status === "assigned") ?? null;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch call"
      );
    }
  }
);

// ── End call ───────────────────────────────────────────────
export const endMyCall = createAsyncThunk(
  "myAgent/endCall",
  async (callId, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/calls/${callId}/end`);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to end call"
      );
    }
  }
);

// ── Fetch my break logs (NEW 🔥) 
export const fetchMyLogs = createAsyncThunk(
  "myAgent/fetchLogs",
  async (agentId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/agents/break-logs/${agentId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch logs"
      );
    }
  }
);

// ── Slice ─
const myAgentSlice = createSlice({
  name: "myAgent",
  initialState: {
    agent: null,
    activeCall: null,
    logs: [], 
    loading: false,
    breakLoading: false,
    callLoading: false,
    logsLoading: false,
    error: null,
  },

  reducers: {
    clearMyAgent: (state) => {
      state.agent = null;
      state.activeCall = null;
      state.logs = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── fetchMyAgent ─────────────────────
      .addCase(fetchMyAgent.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMyAgent.fulfilled, (s, a) => {
        s.loading = false;
        s.agent = a.payload;
      })
      .addCase(fetchMyAgent.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ── toggle break ─────────────────────
      .addCase(toggleMyBreak.pending, (s) => {
        s.breakLoading = true;
        s.error = null;
      })
      .addCase(toggleMyBreak.fulfilled, (s, a) => {
        s.breakLoading = false;
        s.agent = a.payload;
      })
      .addCase(toggleMyBreak.rejected, (s, a) => {
        s.breakLoading = false;
        s.error = a.payload;
      })

      // ── fetch call ───────────────────────
      .addCase(fetchMyCall.pending, (s) => {
        s.callLoading = true;
      })
      .addCase(fetchMyCall.fulfilled, (s, a) => {
        s.callLoading = false;
        s.activeCall = a.payload;
      })
      .addCase(fetchMyCall.rejected, (s) => {
        s.callLoading = false;
        s.activeCall = null;
      })

      // ── end call ─────────────────────────
      .addCase(endMyCall.pending, (s) => {
        s.callLoading = true;
      })
      .addCase(endMyCall.fulfilled, (s) => {
        s.callLoading = false;
        s.activeCall = null;
      })
      .addCase(endMyCall.rejected, (s, a) => {
        s.callLoading = false;
        s.error = a.payload;
      })

      // ── fetch logs ───────────────────────
      .addCase(fetchMyLogs.pending, (s) => {
        s.logsLoading = true;
      })
      .addCase(fetchMyLogs.fulfilled, (s, a) => {
        s.logsLoading = false;
        s.logs = a.payload;
      })
      .addCase(fetchMyLogs.rejected, (s, a) => {
        s.logsLoading = false;
        s.error = a.payload;
      });
  },
});

export const { clearMyAgent } = myAgentSlice.actions;
export default myAgentSlice.reducer;