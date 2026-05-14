import { configureStore } from "@reduxjs/toolkit";
import enquiryReducer from "../features/enquirySlice";
import jobReducer from "../features/jobSlice";
import visitorReducer from "../features/visitorEnquirySlice";
import hrReducer from "../features/hrSlice";
import taskManagementReducer from "../features/taskManagementSlice";
import callReducer from "../features/callSlice";
import agentReducer from "../features/agentSlice";
import myAgentReducer from "../features/myAgentSlice";
import callsReducer from "../features/callSlice";
<<<<<<< HEAD
import twilioReducer from "../features/Twilioslice";
import chatReducer from "../features/chatSlice";
=======
import taskReportReducer from "../features/taskReportSlice";
>>>>>>> 37407dc37049a79f7632adc8b84729e75f200b4e

export const store = configureStore({
  reducer: {
    enquiry: enquiryReducer,
    jobs: jobReducer,
    visitorsEnquiry: visitorReducer,
    hr: hrReducer,
    taskManagement: taskManagementReducer,
    calls: callReducer,
    agents: agentReducer,
    myAgent: myAgentReducer,
<<<<<<< HEAD
    calls: callsReducer,
    twilio: twilioReducer,
    chat: chatReducer,
=======
     calls: callsReducer,
    taskReport: taskReportReducer,
>>>>>>> 37407dc37049a79f7632adc8b84729e75f200b4e
  }
});

export default store;