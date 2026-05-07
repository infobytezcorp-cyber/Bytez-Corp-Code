import { createSlice } from '@reduxjs/toolkit';

const INITIAL_TASKS = [
  {
    _id: 'tmp1',
    clientId: 'ENQ0001',
    elderName: 'Test Client 1',
    phone: '9876543210',
    careType: 'Day Care',
    taskStatus: 'In Progress',
    assignedTo: null,
    assignedToName: 'Kamali',
    assignedToId: 'EMP-CL-M3210'
  },
  {
    _id: 'tmp2',
    clientId: 'ENQ0002',
    elderName: 'Test Client 2',
    phone: '9765432109',
    careType: 'Residential',
    taskStatus: 'Unassigned',
    assignedTo: null,
    assignedToName: null,
    assignedToId: null
  }
];

const taskReportSlice = createSlice({
  name: 'taskReport',
  initialState: {
    list: INITIAL_TASKS,
  },
  reducers: {
    setTaskReport: (state, action) => {
      state.list = action.payload;
    },
    addDummyTask: (state, action) => {
      state.list.unshift(action.payload);
    }
  }
});

export const { setTaskReport, addDummyTask } = taskReportSlice.actions;
export default taskReportSlice.reducer;
