import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/agents");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch agents");
    }
  }
);

export const toggleBreak = createAsyncThunk(
  "agents/toggleBreak",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.put(`/agents/${id}/break`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle break");
    }
  }
);

// ✅ FIX 1: "agendId" typo → "agentId"
// ✅ FIX 2: "/api/agents/..." → "/agents/..." (API instance already has base URL)
// ✅ FIX 3: res.data → res.data.data (backend { success: true, data: agent } return பண்றது)
export const forceLogout = createAsyncThunk(
  "agents/forceLogout",
  async (agentId, { rejectWithValue }) => {
    try {
      const res = await API.patch(`/agents/${agentId}/force-logout`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to force logout");
    }
  }
);

const agentSlice = createSlice({
  name: "agents",
  initialState: {
    list:    [],
    loading: false,
    error:   null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.list    = [];
      })
      .addCase(toggleBreak.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.list.findIndex(a => a._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
      })
      .addCase(toggleBreak.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(forceLogout.fulfilled, (state, action) => {
        const idx = state.list.findIndex(a => a._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(forceLogout.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default agentSlice.reducer;