import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// 🔥 FETCH VISITOR ENQUIRIES
export const fetchVisitorsEnquiry = createAsyncThunk(
  "visitorEnquiry/fetch",
  async () => {
    const res = await axios.get(`${API}/api/userdetails/visitor`);
    return res.data;
  }
);

const visitorEnquirySlice = createSlice({
  name: "visitorEnquiry",
  initialState: {
    data: [],
    loading: false
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitorsEnquiry.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVisitorsEnquiry.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchVisitorsEnquiry.rejected, (state) => {
        state.loading = false;
      });
  }
});

export default visitorEnquirySlice.reducer;