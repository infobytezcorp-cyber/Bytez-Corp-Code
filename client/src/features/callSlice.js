import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

// ───────── FETCH ALL CALLS ─────────
export const fetchCalls = createAsyncThunk(
  "calls/fetchCalls",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/calls");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch calls"
      );
    }
  }
);

// ───────── CALLBACK ─────────
export const callbackCall = createAsyncThunk(
  "calls/callbackCall",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`/calls/${id}/callback`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to callback"
      );
    }
  }
);

// ───────── START CALL ─────────
export const startCall = createAsyncThunk(
  "calls/startCall",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.put(`/calls/${id}/start`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to start call"
      );
    }
  }
);

// ───────── END CALL ─────────
export const endCall = createAsyncThunk(
  "calls/endCall",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.put(`/calls/${id}/end`, {});
      return res.data.data; // full updated call
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to end call"
      );
    }
  }
);

// ───────── ASSIGN CALL ─────────
export const assignCall = createAsyncThunk(
  "calls/assignCall",
  async ({ id, agentId }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/calls/${id}/assign`, { agentId });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to assign call"
      );
    }
  }
);

// ───────── SLICE ─────────
const callSlice = createSlice({
  name: "calls",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // ───────── FETCH CALLS ─────────
      .addCase(fetchCalls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalls.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchCalls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.list = [];
      })

      // ───────── CALLBACK ─────────
      .addCase(callbackCall.pending, (state) => {
        state.loading = true;
      })
      .addCase(callbackCall.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;

        if (data?.callbackCall) {
          state.list.unshift(data.callbackCall);
        }
      })
      .addCase(callbackCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ───────── START CALL ─────────
      .addCase(startCall.pending, (state) => {
        state.loading = true;
      })
      .addCase(startCall.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;
        const index = state.list.findIndex(
          (c) => c._id === updated._id
        );

        if (index !== -1) {
          state.list[index] = updated;
        }
      })
      .addCase(startCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ───────── ASSIGN CALL ─────────
      .addCase(assignCall.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignCall.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;
        const index = state.list.findIndex(
          (c) => c._id === updated._id
        );

        if (index !== -1) {
          state.list[index] = updated;
        }
      })
      .addCase(assignCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ───────── END CALL ─────────
      .addCase(endCall.pending, (state) => {
        state.loading = true;
      })
      .addCase(endCall.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;
        const index = state.list.findIndex(
          (c) => c._id === updated._id
        );

        if (index !== -1) {
          state.list[index] = updated;
        }
      })
      .addCase(endCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default callSlice.reducer;