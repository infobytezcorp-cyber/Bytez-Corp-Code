import { configureStore } from "@reduxjs/toolkit";
import enquiryReducer from "../features/enquirySlice";

export const store = configureStore({
  reducer: {
    enquiry: enquiryReducer,
  }
});

export default store;