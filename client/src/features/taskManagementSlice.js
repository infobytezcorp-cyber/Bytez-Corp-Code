import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

// Thunks
export const fetchEnrolledEnquiries = createAsyncThunk(
  "taskManagement/fetchEnrolledEnquiries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/enquiries?stage=Enrolled");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const fetchStaffList = createAsyncThunk(
  "taskManagement/fetchStaffList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/hr");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const assignTask = createAsyncThunk(
  'taskManagement/assignTask',
  async ({ enquiryId, staffId, durationHours, duration }, { rejectWithValue }) => {
    try {
      const response = await API.post(`/enquiries/${enquiryId}/assign`, {
        staffId,
        durationHours,
        duration,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const completeTask = createAsyncThunk(
  'taskManagement/completeTask',
  async ({ enquiryId }, { rejectWithValue }) => {
    try {
      const response = await API.post(`/enquiries/${enquiryId}/complete`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const reopenTask = createAsyncThunk(
  'taskManagement/reopenTask',
  async ({ enquiryId }, { rejectWithValue }) => {
    try {
      const response = await API.post(`/enquiries/${enquiryId}/reopen`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  enrolledEnquiries: [],
  staffList: [],
  loading: false,
  error: null,
};

const taskManagementSlice = createSlice({
  name: "taskManagement",
  initialState,
    reducers: {
    updateEnquiryAssignment: (state, action) => {
        const { enquiryId, staffId, duration, taskStatus } = action.payload;
        const enquiry = state.enrolledEnquiries.find((e) => e._id === enquiryId);
        if (enquiry) {
        if (staffId !== undefined) enquiry.assignedTo = staffId;
        if (duration !== undefined) enquiry.duration = duration;
        if (taskStatus !== undefined) enquiry.taskStatus = taskStatus;
        }
    },
},
  extraReducers: (builder) => {
    // Fetch Enrolled Enquiries
    builder
      .addCase(fetchEnrolledEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrolledEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledEnquiries = action.payload;
      })
      .addCase(fetchEnrolledEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Staff List
    builder
      .addCase(fetchStaffList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffList.fulfilled, (state, action) => {
        state.loading = false;
        state.staffList = action.payload;
      })
      .addCase(fetchStaffList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Assign Task
    builder
      .addCase(assignTask.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(assignTask.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.enrolledEnquiries.findIndex(e => e._id === updated._id);
        if (idx !== -1) state.enrolledEnquiries[idx] = updated;
      })
      .addCase(assignTask.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Complete Task
    builder
      .addCase(completeTask.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.enrolledEnquiries.findIndex(e => e._id === updated._id);
        if (idx !== -1) state.enrolledEnquiries[idx] = updated;
      })
      .addCase(completeTask.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Reopen Task
    builder
      .addCase(reopenTask.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(reopenTask.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const idx = state.enrolledEnquiries.findIndex(e => e._id === updated._id);
        if (idx !== -1) state.enrolledEnquiries[idx] = updated;
      })
      .addCase(reopenTask.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { updateEnquiryAssignment } = taskManagementSlice.actions;
export default taskManagementSlice.reducer;


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const API = import.meta.env.VITE_API_URL;
// axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

// // Thunks - இங்கே URL-ஐ /api/tasks என மாற்றியுள்ளேன் ✅
// export const fetchEnrolledEnquiries = createAsyncThunk(
//   "taskManagement/fetchEnrolledEnquiries",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API}/api/tasks`); 
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const fetchStaffList = createAsyncThunk(
//   "taskManagement/fetchStaffList",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API}/api/hr`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// const initialState = {
//   enrolledEnquiries: [],
//   staffList: [],
//   loading: false,
//   error: null,
// };

// const taskManagementSlice = createSlice({
//   name: "taskManagement",
//   initialState,
//   reducers: {
//     updateEnquiryAssignment: (state, action) => {
//       const { enquiryId, staffId, duration, taskStatus } = action.payload;
//       const enquiry = state.enrolledEnquiries.find((e) => e._id === enquiryId);
//       if (enquiry) {
//         if (staffId !== undefined) enquiry.assignedTo = staffId;
//         if (duration !== undefined) enquiry.duration = duration;
//         if (taskStatus !== undefined) enquiry.taskStatus = taskStatus;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchEnrolledEnquiries.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchEnrolledEnquiries.fulfilled, (state, action) => {
//         state.loading = false;
//         state.enrolledEnquiries = action.payload;
//       })
//       .addCase(fetchEnrolledEnquiries.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(fetchStaffList.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchStaffList.fulfilled, (state, action) => {
//         state.loading = false;
//         state.staffList = action.payload;
//       })
//       .addCase(fetchStaffList.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { updateEnquiryAssignment } = taskManagementSlice.actions;
// export default taskManagementSlice.reducer;