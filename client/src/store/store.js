import { configureStore } from "@reduxjs/toolkit";
import enquiryReducer from "../features/enquirySlice";
import jobReducer  from "../features/jobSlice";

export const store = configureStore({
  reducer: {
    enquiry: enquiryReducer,
    jobs: jobReducer,
  }
});

export default store;