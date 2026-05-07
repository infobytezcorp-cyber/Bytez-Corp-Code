import { configureStore } from "@reduxjs/toolkit";
import enquiryReducer from "../features/enquirySlice";
import jobReducer from "../features/jobSlice";
import visitorReducer from "../features/visitorEnquirySlice";
import callReducer from "../features/callSlice";
import agentReducer from "../features/agentSlice";
import myAgentReducer from "../features/myAgentSlice";
import callsReducer from "../features/callSlice";
import twilioReducer from "../features/Twilioslice";

export const store = configureStore({
  reducer: {
    enquiry: enquiryReducer,
    jobs: jobReducer,
    visitorsEnquiry: visitorReducer,
    calls: callReducer,
    agents: agentReducer,
    myAgent: myAgentReducer,
    calls: callsReducer,
    twilio: twilioReducer
  }
});

export default store;