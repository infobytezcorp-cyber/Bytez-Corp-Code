import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';


// Async thunks
export const submitWorkUpdate = createAsyncThunk(
  'workUpdates/submitWorkUpdate',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await API.post(`/workupdates`, updateData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchStaffUpdates = createAsyncThunk(
  'workUpdates/fetchStaffUpdates',
  async ({ empId, status, limit = 20, skip = 0 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', limit);
      params.append('skip', skip);

      const response = await API.get(
        `/workupdates/staff/${empId}?${params}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchAllUpdates = createAsyncThunk(
  'workUpdates/fetchAllUpdates',
  async ({ 
    status = 'all', 
    staffEmpId, 
    startDate, 
    endDate, 
    limit = 50, 
    skip = 0 
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (staffEmpId) params.append('staffEmpId', staffEmpId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', limit);
      params.append('skip', skip);

      const response = await API.get(`/workupdates?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchMissedUpdateAlerts = createAsyncThunk(
  'workUpdates/fetchMissedUpdateAlerts',
  async ({ staffEmpId } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (staffEmpId) params.append('staffEmpId', staffEmpId);
      const response = await API.get(`/workupdates/alerts/missed?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const approveWorkUpdate = createAsyncThunk(
  'workUpdates/approveWorkUpdate',
  async ({ updateId, reviewedBy, remarks }, { rejectWithValue }) => {
    try {
      const response = await API.put(
        `/workupdates/${updateId}/approve`,
        { reviewedBy, remarks }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const rejectWorkUpdate = createAsyncThunk(
  'workUpdates/rejectWorkUpdate',
  async ({ updateId, reviewedBy, remarks }, { rejectWithValue }) => {
    try {
      const response = await API.put(
        `/workupdates/${updateId}/reject`,
        { reviewedBy, remarks }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchStaffAnalytics = createAsyncThunk(
  'workUpdates/fetchStaffAnalytics',
  async ({ empId, days = 7 }, { rejectWithValue }) => {
    try {
      const response = await API.get(
        `/workupdates/analytics/staff/${empId}?days=${days}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchDailyAnalytics = createAsyncThunk(
  'workUpdates/fetchDailyAnalytics',
  async ({ staffEmpId, date }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (staffEmpId) params.append('staffEmpId', staffEmpId);
      if (date) params.append('date', date);

      const response = await API.get(
        `/workupdates/analytics/daily?${params}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ NEW: Fetch staff dashboard with tasks + work updates
export const fetchStaffDashboard = createAsyncThunk(
  'workUpdates/fetchStaffDashboard',
  async ({ empId }, { rejectWithValue }) => {
    try {
      const response = await API.get(`/tasks/dashboard/staff/${empId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  // Staff personal updates
  staffUpdates: [],
  staffTotal: 0,

  // Admin view - all updates
  allUpdates: [],
  allTotal: 0,
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    missedHourlyUpdates: 0
  },
  missedAlerts: [],

  // ✅ NEW: Staff dashboard (tasks + work updates)
  staffDashboard: {
    tasks: [],
    workUpdates: [],
    summary: {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      totalWorkUpdates: 0,
      pendingUpdates: 0,
      approvedUpdates: 0,
      rejectedUpdates: 0
    }
  },

  // Analytics
  staffAnalytics: [],
  dailyAnalytics: [],

  // UI State
  loading: false,
  error: null,
  successMessage: null,
  selectedUpdate: null
};

const workUpdateSlice = createSlice({
  name: 'workUpdates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    setSelectedUpdate: (state, action) => {
      state.selectedUpdate = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Submit work update
    builder
      .addCase(submitWorkUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitWorkUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Work update submitted successfully';
        state.staffUpdates.unshift(action.payload);
      })
      .addCase(submitWorkUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to submit work update';
      });

    // Fetch staff updates
    builder
      .addCase(fetchStaffUpdates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffUpdates.fulfilled, (state, action) => {
        state.loading = false;
        state.staffUpdates = action.payload.data;
        state.staffTotal = action.payload.total;
      })
      .addCase(fetchStaffUpdates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch staff updates';
      });

    // Fetch all updates
    builder
      .addCase(fetchAllUpdates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUpdates.fulfilled, (state, action) => {
        state.loading = false;
        state.allUpdates = action.payload.data;
        state.allTotal = action.payload.total;
        state.stats = action.payload.stats;
        state.missedAlerts = action.payload.alerts || [];
      })
      .addCase(fetchAllUpdates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch updates';
      });

    // Approve update
    builder
      .addCase(approveWorkUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveWorkUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Work update approved';
        const idx = state.allUpdates.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) state.allUpdates[idx] = action.payload;
      })
      .addCase(approveWorkUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to approve update';
      });

    // Reject update
    builder
      .addCase(rejectWorkUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectWorkUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Work update rejected';
        const idx = state.allUpdates.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) state.allUpdates[idx] = action.payload;
      })
      .addCase(rejectWorkUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to reject update';
      });

    // Fetch staff analytics
    builder
      .addCase(fetchStaffAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStaffAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.staffAnalytics = action.payload.data;
      })
      .addCase(fetchStaffAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch analytics';
      });

    // Fetch daily analytics
    builder
      .addCase(fetchDailyAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDailyAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyAnalytics = action.payload.data;
      })
      .addCase(fetchDailyAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch daily analytics';
      });

    // ✅ NEW: Fetch staff dashboard
    builder
      .addCase(fetchStaffDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.staffDashboard = action.payload;
      })
      .addCase(fetchStaffDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch staff dashboard';
      });

    builder
      .addCase(fetchMissedUpdateAlerts.fulfilled, (state, action) => {
        state.missedAlerts = action.payload.data || [];
        state.stats.missedHourlyUpdates = action.payload.total || 0;
      })
      .addCase(fetchMissedUpdateAlerts.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to fetch missed hourly alerts';
      });
  }
});

export const { clearError, clearSuccess, setSelectedUpdate } = workUpdateSlice.actions;
export default workUpdateSlice.reducer;
