import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/agents");
      return res.data.data; // array எடு
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
      return res.data.data; // updated agent object எடு
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle break");
    }
  }
);

const agentSlice = createSlice({
  name: "agents",
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        //  Safety check — array இல்லன்னா empty array
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.list = []; // error வந்தாலும் crash ஆகாது
      })
      .addCase(toggleBreak.fulfilled, (state, action) => {
        // updateData.status = "available";
        const updated = action.payload;
        const idx = state.list.findIndex(a => a._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
      })
      .addCase(toggleBreak.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default agentSlice.reducer;