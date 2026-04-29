import { configureStore } from "@reduxjs/toolkit";
import enquiryReducer from "../features/enquirySlice";
import jobReducer  from "../features/jobSlice";
import visitorReducer from "../features/visitorEnquirySlice";
import hrReducer from "../features/hrSlice";
import taskManagementReducer from "../features/taskManagementSlice";

export const store = configureStore({
  reducer: {
    enquiry: enquiryReducer,
    jobs: jobReducer,
    visitorsEnquiry: visitorReducer,
    hr: hrReducer,
    taskManagement: taskManagementReducer,
  }
});

export default store;