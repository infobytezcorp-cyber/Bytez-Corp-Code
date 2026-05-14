import { configureStore } from "@reduxjs/toolkit";
import enquiryReducer from "../features/enquirySlice";
import jobReducer  from "../features/jobSlice";
import visitorReducer from "../features/visitorEnquirySlice";
import hrReducer from "../features/hrSlice";
import taskManagementReducer from "../features/taskManagementSlice";
import callReducer from "../features/callSlice";
import agentReducer from "../features/agentSlice";
import myAgentReducer from "../features/myAgentSlice";
import callsReducer from "../features/callSlice";
import taskReportReducer from "../features/taskReportSlice";
import taskReducer from "../features/taskSlice";
import workUpdateReducer from "../features/workUpdateSlice";

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
    calls: callsReducer,
    taskReport: taskReportReducer,
    tasks: taskReducer,
    workUpdates: workUpdateReducer,
  }
});

export default store;
