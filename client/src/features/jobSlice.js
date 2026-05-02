import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;


// FETCH JOB ENQUIRIES
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async () => {
    const res = await axios.get(`${API}/api/userdetails/job`);
    return res.data;
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    data: [],
    loading: false
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchJobs.rejected, (state) => {
        state.loading = false;
      });
  }
});

export default jobSlice.reducer;