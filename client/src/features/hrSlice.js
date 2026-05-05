// import { createSlice } from "@reduxjs/toolkit";



// const HR_DEPT = {

//   homecare: {

//     label: "Home Care",

//     icon: "🏠",

//     color: "#0891b2",

//     services: [

//       "Home Nursing",

//       "Caregiver Visit",

//       "Physiotherapy",

//       "Palliative Care",

//       "Post-Surgery Care",

//     ],

//   },

//   healthcare: {

//     label: "Health Care",

//     icon: "🩺",

//     color: "#16a34a",

//     services: [

//       "In-Patient Nursing",

//       "Doctor Coordination",

//       "Pharmacy",

//       "Lab & Diagnostics",

//       "Emergency Response",

//     ],

//   },

//   calls: {

//     label: "Calls & Leads",

//     icon: "📞",

//     color: "#2d6be4",

//     services: [

//       "Inbound Call Handling",

//       "Lead Follow-up",

//       "Telecalling",

//       "Customer Support",

//       "WhatsApp Support",

//     ],

//   },

//   it: {

//     label: "IT Staffs",

//     icon: "💻",

//     color: "#7c3aed",

//     services: [

//       "Software Development",

//       "ERP Support",

//       "Network & IT Infra",

//       "Data & Analytics",

//       "Digital Marketing",

//     ],

//   },

//   nonit: {

//     label: "Non-IT Staffs",

//     icon: "🏢",

//     color: "#ea580c",

//     services: [

//       "Administration",

//       "HR & Recruitment",

//       "Accounts & Finance",

//       "Legal & Compliance",

//       "Purchase & Vendor",

//     ],

//   },

//   labour: {

//     label: "Labours",

//     icon: "🧹",

//     color: "#d97706",

//     services: [

//       "Housekeeping",

//       "Kitchen & Dietary",

//       "Security & Gate",

//       "Laundry",

//       "Maintenance & Repair",

//     ],

//   },

// };



// const INITIAL_EMPLOYEES = [

//   {

//     id: "EMP-HC-001",

//     name: "Kavitha Ramasamy",

//     mobile: "98765 43210",

//     dept: "homecare",

//     service: "Home Nursing",

//     role: "Senior Home Nurse",

//     shift: "Day (9am–6pm)",

//     status: "Present",

//     doj: "2023-06-15",

//     dob: "1990-04-12",

//     gender: "Female",

//     blood: "B+",

//     email: "kavitha.r@careplus.in",

//     aadhaar: "3456 7890 1234",

//     address: "12, Gandhi Nagar, RS Puram, Coimbatore - 641002",

//     salary: 22000,

//     manager: "Dr. Anand Kumar",

//     emptype: "Full-Time",

//     qual: "GNM Nursing",

//     emname: "Rajesh R.",

//     emmobile: "97654 32109",

//     emrel: "Spouse",

//     notes: "Expert in diabetic patient home care",

//   },

//   {

//     id: "EMP-HC-002",

//     name: "Meena Subramaniam",

//     mobile: "97654 32109",

//     dept: "homecare",

//     service: "Caregiver Visit",

//     role: "Sr. Caregiver",

//     shift: "Morning (6am–2pm)",

//     status: "Present",

//     doj: "2022-01-10",

//     dob: "1988-11-22",

//     gender: "Female",

//     blood: "O+",

//     email: "meena.s@careplus.in",

//     aadhaar: "4567 8901 2345",

//     address: "45, Bharathi Nagar, Saibaba Colony, Coimbatore - 641011",

//     salary: 18000,

//     manager: "Priya Nair",

//     emptype: "Full-Time",

//     qual: "Diploma Nursing",

//     emname: "Subramaniam M.",

//     emmobile: "96543 21098",

//     emrel: "Spouse",

//     notes: "Handles post-stroke patients",

//   },

//   {

//     id: "EMP-HC-003",

//     name: "Radha Murugesan",

//     mobile: "96543 21098",

//     dept: "homecare",

//     service: "Physiotherapy",

//     role: "Physiotherapist",

//     shift: "Day (9am–6pm)",

//     status: "WFH",

//     doj: "2024-03-01",

//     dob: "1992-07-08",

//     gender: "Female",

//     blood: "A+",

//     email: "radha.m@careplus.in",

//     aadhaar: "5678 9012 3456",

//     address: "78, Anna Nagar, Peelamedu, Coimbatore - 641004",

//     salary: 25000,

//     manager: "Dr. Priya Rajan",

//     emptype: "Full-Time",

//     qual: "B.Sc Physiotherapy",

//     emname: "Murugesan P.",

//     emmobile: "95432 10987",

//     emrel: "Parent",

//     notes: "",

//   },

//   {

//     id: "EMP-IT-001",

//     name: "Arun Vijay",

//     mobile: "81098 76543",

//     dept: "it",

//     service: "Software Development",

//     role: "Full Stack Developer",

//     shift: "Day (9am–6pm)",

//     status: "WFH",

//     doj: "2024-07-01",

//     dob: "1995-02-14",

//     gender: "Male",

//     blood: "A+",

//     email: "arun.v@careplus.in",

//     aadhaar: "1234 0987 6543",

//     address: "78, Kovaipudur, Coimbatore - 641042",

//     salary: 45000,

//     manager: "IT Manager",

//     emptype: "Full-Time",

//     qual: "B.E Computer Science",

//     emname: "Vijay K.",

//     emmobile: "80987 65432",

//     emrel: "Parent",

//     notes: "Manages ERP modules",

//   },

//   {

//     id: "EMP-NIT-001",

//     name: "Rajaram Subramanian",

//     mobile: "77654 32109",

//     dept: "nonit",

//     service: "Administration",

//     role: "Office Administrator",

//     shift: "Day (9am–6pm)",

//     status: "Present",

//     doj: "2019-04-01",

//     dob: "1978-11-08",

//     gender: "Male",

//     blood: "B+",

//     email: "rajaram.s@careplus.in",

//     aadhaar: "5678 4321 0987",

//     address: "23, Town Hall Road, Coimbatore - 641001",

//     salary: 28000,

//     manager: "CEO",

//     emptype: "Full-Time",

//     qual: "B.Com",

//     emname: "Subramanian K.",

//     emmobile: "76543 21098",

//     emrel: "Spouse",

//     notes: "10+ years experience",

//   },

//   {

//     id: "EMP-CL-001",

//     name: "Anand Krishnan",

//     mobile: "86543 21098",

//     dept: "calls",

//     service: "Inbound Call Handling",

//     role: "Senior Telecaller",

//     shift: "Day (9am–6pm)",

//     status: "Present",

//     doj: "2025-06-01",

//     dob: "1998-01-15",

//     gender: "Male",

//     blood: "O+",

//     email: "anand.k2@careplus.in",

//     aadhaar: "6789 0123 4567",

//     address: "45, Vadavalli, Coimbatore - 641041",

//     salary: 12000,

//     manager: "CRM Manager",

//     emptype: "Full-Time",

//     qual: "B.Com",

//     emname: "Krishnan M.",

//     emmobile: "85432 10987",

//     emrel: "Parent",

//     notes: "Top performer 92% call score",

//   },

// ];



// const hrSlice = createSlice({

//   name: "hr",

//   initialState: {

//     employees: INITIAL_EMPLOYEES,

//     activeDept: "all",

//     activeService: "all",

//     searchTerm: "",

//     statusFilter: "all",

//     empTypeFilter: "all",

//     selectedEmployee: null,

//     isAddModalOpen: false,

//     isViewModalOpen: false,

//   },

//   reducers: {

//     setActiveDept: (state, action) => {

//       state.activeDept = action.payload;

//       state.activeService = "all";

//     },

//     setActiveService: (state, action) => {

//       state.activeService = action.payload;

//     },

//     setSearchTerm: (state, action) => {

//       state.searchTerm = action.payload;

//     },

//     setStatusFilter: (state, action) => {

//       state.statusFilter = action.payload;

//     },

//     setEmpTypeFilter: (state, action) => {

//       state.empTypeFilter = action.payload;

//     },

//     setSelectedEmployee: (state, action) => {

//       state.selectedEmployee = action.payload;

//     },

//     openAddModal: (state) => {

//       state.isAddModalOpen = true;

//     },

//     closeAddModal: (state) => {

//       state.isAddModalOpen = false;

//     },

//     openViewModal: (state) => {

//       state.isViewModalOpen = true;

//     },

//     closeViewModal: (state) => {

//       state.isViewModalOpen = false;

//     },

//     addEmployee: (state, action) => {

//       state.employees.push(action.payload);

//     },

//     updateEmployee: (state, action) => {

//       const index = state.employees.findIndex(

//         (emp) => emp.id === action.payload.id

//       );

//       if (index !== -1) {

//         state.employees[index] = action.payload;

//       }

//     },

//     deleteEmployee: (state, action) => {

//       state.employees = state.employees.filter(

//         (emp) => emp.id !== action.payload

//       );

//     },

//   },

// });



// export const HR_DEPT_CONFIG = HR_DEPT;

// export const {

//   setActiveDept,

//   setActiveService,

//   setSearchTerm,

//   setStatusFilter,

//   setEmpTypeFilter,

//   setSelectedEmployee,

//   openAddModal,

//   closeAddModal,

//   openViewModal,

//   closeViewModal,

//   addEmployee,

//   updateEmployee,

//   deleteEmployee,

// } = hrSlice.actions;



// export default hrSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://f541-2406-7400-ff03-8921-fdc4-8fb7-ba-bf24.ngrok-free.app';

// export const HR_DEPT_CONFIG = {
//   homecare: { label: "Home Care", icon: "🏠", color: "#0891b2", services: ["Home Nursing", "Caregiver Visit", "Physiotherapy", "Palliative Care", "Post-Surgery Care"] },
//   healthcare: { label: "Health Care", icon: "🩺", color: "#16a34a", services: ["In-Patient Nursing", "Doctor Coordination", "Pharmacy", "Lab & Diagnostics", "Emergency Response"] },
//   calls: { label: "Calls & Leads", icon: "📞", color: "#2d6be4", services: ["Inbound Call Handling", "Lead Follow-up", "Telecalling", "Customer Support", "WhatsApp Support"] },
//   it: { label: "IT Staffs", icon: "💻", color: "#7c3aed", services: ["Software Development", "ERP Support", "Network & IT Infra", "Data & Analytics", "Digital Marketing"] },
//   nonit: { label: "Non-IT Staffs", icon: "🏢", color: "#ea580c", services: ["Administration", "HR & Recruitment", "Accounts & Finance", "Legal & Compliance", "Purchase & Vendor"] },
//   labour: { label: "Labours", icon: "🧹", color: "#d97706", services: ["Housekeeping", "Kitchen & Dietary", "Security & Gate", "Laundry", "Maintenance & Repair"] },
// };

export const HR_DEPT_CONFIG = {
  homecare: {
    label: "Home Care",
    icon: "🏠",
    color: "#0891b2",
    services: [
      "Home Nursing 12/7",
      "Home Nursing 24/7",
      "Patient Care Attender 12/7",
      "Patient Care Attender 24/7",
      "Cook 12/7",
      "Cook 24/7",
      "Baby Sitter 12/7",
      "Maid Staff 12/7",
      "Maid Staff 24/7",
      "Caregiver Visit",
      "Physiotherapy",
      "Palliative Care",
      "Post-Surgery Care",
    ],
  },
  healthcare: {
    label: "Health Care",
    icon: "🩺",
    color: "#16a34a",
    services: [
      "Emergency Nurse 12/7",
      "Emergency Nurse 24/7",
      "Old Age Home",
      "Doctor @ Home",
      "Ambulance Service",
      "Home Sample Collection",
      "Diploma Nurse 24/7",
      "Diploma Nurse 12/7",
      "Elder Care Service 24/7",
      "In-Patient Nursing",
      "Pharmacy",
      "Lab & Diagnostics",
    ],
  },
  calls: {
    label: "Calls & Leads",
    icon: "📞",
    color: "#2d6be4",
    services: [
      "Inbound Call Handling",
      "Lead Follow-up",
      "Telecalling",
      "Customer Support",
      "WhatsApp Support",
    ],
  },
  it: {
    label: "IT Staffs",
    icon: "💻",
    color: "#7c3aed",
    services: [
      "Software Development",
      "ERP Support",
      "Network & IT Infra",
      "Data & Analytics",
      "Digital Marketing",
    ],
  },
  nonit: {
    label: "Non-IT Staffs",
    icon: "🏢",
    color: "#ea580c",
    services: [
      "Administration",
      "HR & Recruitment",
      "Accounts & Finance",
      "Legal & Compliance",
      "Purchase & Vendor",
    ],
  },
  labour: {
    label: "Labours",
    icon: "🧹",
    color: "#d97706",
    services: [
      "Housekeeping",
      "Kitchen & Dietary",
      "Security & Gate",
      "Laundry",
      "Maintenance & Repair",
    ],
  },
};

// Fallback data if API fails
const INITIAL_EMPLOYEES = [
  { id: "EMP-HC-001", name: "Kavitha Ramasamy", mobile: "98765 43210", dept: "homecare", service: "Home Nursing", role: "Senior Home Nurse", shift: "Day (9am–6pm)", status: "Present", doj: "2023-06-15", dob: "1990-04-12", gender: "Female", blood: "B+", email: "kavitha.r@careplus.in", aadhaar: "3456 7890 1234", address: "12, Gandhi Nagar, RS Puram, Coimbatore - 641002", salary: 22000, manager: "Dr. Anand Kumar", emptype: "Full-Time", qual: "GNM Nursing", emname: "Rajesh R.", emmobile: "97654 32109", emrel: "Spouse", notes: "Expert in diabetic patient home care" }
];

// --- Async Thunks ---

// 1. Fetch Employees (GET)
export const fetchEmployees = createAsyncThunk(
  "hr/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Fetching employees from:", `${API_URL}/api/hr`);
      const response = await axios.get(`${API_URL}/api/hr`);
      console.log("✅ API Response received:", response.data);
      
      // Normalize data: MongoDB '_id' can conflict with frontend 'id'
      const normalizedData = response.data.map(emp => ({
        ...emp,
        id: emp.id || emp._id
      }));
      console.log("✅ Normalized employees:", normalizedData.length, "employees loaded");
      return normalizedData;
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      // Return mock data as fallback
      console.log("📦 Using fallback data:", INITIAL_EMPLOYEES.length, "employees");
      return INITIAL_EMPLOYEES;
    }
  }
);

// 2. Add Employee (POST)
export const addEmployeeAsync = createAsyncThunk(
  "hr/addEmployee",
  async (empData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/hr`, empData);
      return {
        ...response.data,
        id: response.data.id || response.data._id
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 3. Update Employee (PUT)
export const updateEmployeeAsync = createAsyncThunk(
  "hr/updateEmployee",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/api/hr/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 4. Delete Employee (DELETE)
export const deleteEmployeeAsync = createAsyncThunk(
  "hr/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/hr/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(id);
    }
  }
);

export const softDeleteEmployeeAsync = createAsyncThunk(
  "hr/softDeleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      // Use PATCH endpoint to deactivate employee (soft delete)
      const response = await axios.patch(`${API_URL}/api/hr/${id}/deactivate`);
      return id; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 5. Fetch Ex-Employees (isActive = false)
export const fetchExEmployees = createAsyncThunk(
  "hr/fetchExEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/hr/ex-employees/list`);
      return response.data.map(emp => ({
        ...emp,
        id: emp.id || emp._id
      }));
    } catch (error) {
      console.error("❌ Fetch Ex-Employees Error:", error.message);
      return [];
    }
  }
);

const hrSlice = createSlice({
  name: "hr",
  initialState: {
    employees: [],
    exEmployees: [],
    loading: false,
    error: null,
    activeDept: "all",
    activeService: "all",
    searchTerm: "",
    statusFilter: "all",
    empTypeFilter: "all",
    selectedEmployee: null,
    isAddModalOpen: false,
    isViewModalOpen: false,
    viewMode: "active", // 'active' or 'ex'
  },
  reducers: {
    setActiveDept: (state, action) => {
      state.activeDept = action.payload;
      state.activeService = "all";
    },
    setActiveService: (state, action) => { state.activeService = action.payload; },
    setSearchTerm: (state, action) => { state.searchTerm = action.payload; },
    setStatusFilter: (state, action) => { state.statusFilter = action.payload; },
    setEmpTypeFilter: (state, action) => { state.empTypeFilter = action.payload; },
    setSelectedEmployee: (state, action) => { state.selectedEmployee = action.payload; },
    openAddModal: (state) => { state.isAddModalOpen = true; },
    closeAddModal: (state) => { state.isAddModalOpen = false; },
    openViewModal: (state) => { state.isViewModalOpen = true; },
    closeViewModal: (state) => { state.isViewModalOpen = false; },
    setViewMode: (state, action) => { state.viewMode = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        // If API returns empty but we have fallback data, use it
        const employees = action.payload && action.payload.length > 0 
          ? action.payload 
          : INITIAL_EMPLOYEES;
        state.employees = employees;
        console.log("📊 Setting employees in state:", employees.length, "employees");
      })
      .addCase(fetchEmployees.rejected, (state) => {
        state.loading = false;
        state.employees = INITIAL_EMPLOYEES; // Fallback to mock
      })
      // Add Employee
      .addCase(addEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload); // Instantly add to table
        state.error = null;
      })
      .addCase(addEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add employee";
      })
      // Update Employee
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      // Delete Employee
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
      })
      .addCase(softDeleteEmployeeAsync.fulfilled, (state, action) => {
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
      })
      // Fetch Ex-Employees
      .addCase(fetchExEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.exEmployees = action.payload;
      })
      .addCase(fetchExEmployees.rejected, (state) => {
        state.loading = false;
        state.exEmployees = [];
      });
  },
});

export const {
  setActiveDept,
  setActiveService,
  setSearchTerm,
  setStatusFilter,
  setEmpTypeFilter,
  setSelectedEmployee,
  openAddModal,
  closeAddModal,
  openViewModal,
  closeViewModal,
  setViewMode,
} = hrSlice.actions;

// Aliases for older component imports
export { 
  addEmployeeAsync as addEmployee, 
  updateEmployeeAsync as updateEmployee, 
  deleteEmployeeAsync as deleteEmployee 
};

export default hrSlice.reducer;