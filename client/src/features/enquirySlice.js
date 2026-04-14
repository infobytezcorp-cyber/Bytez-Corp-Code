import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Mock data for development
const mockEnquiryData = [
  {
    _id: '507f1f77bcf86cd799439011',
    elderName: 'Ramesh Kumar',
    familyName: 'Kumar Family',
    phone: '9876543210',
    email: 'ramesh@email.com',
    careType: 'Day Care',
    stage: 'New Enquiry',
    source: 'Website',
    createdAt: new Date('2024-10-04').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd799439012',
    elderName: 'Priya Sharma',
    familyName: 'Sharma Family',
    phone: '9765432109',
    email: 'priya@email.com',
    careType: 'Residential',
    stage: 'Contact',
    source: 'Telecaller',
    createdAt: new Date('2024-07-04').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd799439013',
    elderName: 'Rajesh Singh',
    familyName: 'Singh Family',
    phone: '9654321098',
    email: 'rajesh@email.com',
    careType: 'Live In',
    stage: 'Pitching',
    source: 'Referral',
    createdAt: new Date('2024-09-15').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd799439014',
    elderName: 'Anjali Patel',
    familyName: 'Patel Family',
    phone: '9543210987',
    email: 'anjali@email.com',
    careType: 'Full Time',
    stage: 'Pitching',
    source: 'Tawk.to',
    createdAt: new Date('2024-06-10').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd799439015',
    elderName: 'Vikram Rao',
    familyName: 'Rao Family',
    phone: '9432109876',
    email: 'vikram@email.com',
    careType: 'Part Time',
    stage: 'Enrolled',
    source: 'Website',
    createdAt: new Date('2024-08-20').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd799439016',
    elderName: 'Pooja Malhotra',
    familyName: 'Malhotra Family',
    phone: '9321098765',
    email: 'pooja@email.com',
    careType: 'Day Care',
    stage: 'New Enquiry',
    source: 'Website',
    createdAt: new Date('2024-09-01').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd799439017',
    elderName: 'Arvind Gupta',
    familyName: 'Gupta Family',
    phone: '9210987654',
    email: 'arvind@email.com',
    careType: 'Live In',
    stage: 'Contact',
    source: 'Telecaller',
    createdAt: new Date('2024-05-12').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd799439018',
    elderName: 'Meera Nair',
    familyName: 'Nair Family',
    phone: '9109876543',
    email: 'meera@email.com',
    careType: 'Residential',
    stage: 'Pitching',
    source: 'Referral',
    createdAt: new Date('2024-08-25').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd799439019',
    elderName: 'Suresh Iyer',
    familyName: 'Iyer Family',
    phone: '9098765432',
    email: 'suresh@email.com',
    careType: 'Full Time',
    stage: 'Enrolled',
    source: 'Website',
    createdAt: new Date('2024-07-30').toISOString(),
    timeline: []
  },
  {
    _id: '507f1f77bcf86cd79943901a',
    elderName: 'Divya Kumari',
    familyName: 'Kumari Family',
    phone: '8987654321',
    email: 'divya@email.com',
    careType: 'Part Time',
    stage: 'New Enquiry',
    source: 'Referral',
    createdAt: new Date('2024-09-18').toISOString(),
    timeline: []
  }
];

// Async Thunks
export const fetchEnquiries = createAsyncThunk(
  'enquiry/fetchEnquiries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/enquiries`);
      return response.data;
    } catch (error) {
      console.warn('Using mock data due to API error');
      return mockEnquiryData;
    }
  }
);

export const fetchEnquiryDetail = createAsyncThunk(
  'enquiry/fetchEnquiryDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/enquiries/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enquiry');
    }
  }
);

export const createEnquiry = createAsyncThunk(
  'enquiry/createEnquiry',
  async (enquiryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/enquiries`, enquiryData);
      return response.data;
    } catch (error) {
      // Fallback: Return enquiry with generated ID
      console.warn('Using local create due to API error');
      return {
        ...enquiryData,
        _id: 'temp_' + Date.now(),
        createdAt: new Date().toISOString(),
        timeline: []
      };
    }
  }
);

export const updateEnquiry = createAsyncThunk(
  'enquiry/updateEnquiry',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/enquiries/${id}`, data);
      return response.data;
    } catch (error) {
      // Fallback: Update mock data locally
      console.warn('Using local update due to API error');
      return {
        ...data,
        _id: id,
        createdAt: data.createdAt || new Date().toISOString()
      };
    }
  }
);

export const addEnquiryNote = createAsyncThunk(
  'enquiry/addEnquiryNote',
  async ({ id, note }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_URL}/enquiries/${id}/notes`, { note });
      return response.data;
    } catch (error) {
      // Fallback: Return enquiry with note added
      console.warn('Using local note addition due to API error');
      const state = getState();
      const enquiry = state.enquiry.selectedEnquiry;
      if (enquiry) {
        return {
          ...enquiry,
          timeline: [
            ...(enquiry.timeline || []),
            { event: note, date: new Date().toISOString() }
          ]
        };
      }
      return rejectWithValue('No enquiry selected');
    }
  }
);

const initialState = {
  enquiries: [],
  selectedEnquiry: null,
  loading: false,
  detailLoading: false,
  error: null,
  filters: {
    stage: null,
    source: null,
    searchTerm: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

const enquirySlice = createSlice({
  name: 'enquiry',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Enquiries
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.enquiries = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
        state.pagination.total = state.enquiries.length;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch enquiries';
        state.enquiries = mockEnquiryData;
      });

    // Fetch Enquiry Detail
    builder
      .addCase(fetchEnquiryDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchEnquiryDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedEnquiry = action.payload;
      })
      .addCase(fetchEnquiryDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });

    // Create Enquiry
    builder
      .addCase(createEnquiry.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.loading = false;
        state.enquiries.unshift(action.payload);
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Enquiry
    builder
      .addCase(updateEnquiry.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEnquiry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.enquiries.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.enquiries[index] = action.payload;
        }
        // Also update selectedEnquiry if it's the one being edited
        if (state.selectedEnquiry && state.selectedEnquiry._id === action.payload._id) {
          state.selectedEnquiry = action.payload;
        }
      })
      .addCase(updateEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Note to Enquiry
    builder
      .addCase(addEnquiryNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addEnquiryNote.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedEnquiry && state.selectedEnquiry._id === action.payload._id) {
          state.selectedEnquiry = action.payload;
        }
      })
      .addCase(addEnquiryNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearFilters, clearError, setPage } = enquirySlice.actions;
export default enquirySlice.reducer;
