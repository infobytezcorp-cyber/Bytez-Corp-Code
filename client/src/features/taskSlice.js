// // src/features/taskSlice.js
// // ─── Store setup ─────────────────────────────────────────────────────────────
// // import taskReducer from './features/taskSlice'
// // configureStore: reducer: { hr: hrReducer, tasks: taskReducer }

// import { createSlice } from "@reduxjs/toolkit";

// const STORAGE_KEY = "staff_tasks_v1";

// const loadTasks = () => {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// };

// const saveTasks = (tasks) => {
//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
//   } catch {}
// };

// const initialState = {
//   tasks: loadTasks(),
//   staffSession: null,
//   // { empId, empName, empDept, empRole, empMobile, loginTime }
// };

// const taskSlice = createSlice({
//   name: "tasks",
//   initialState,
//   reducers: {
//     // Admin: assign a new task
//     addTask: (state, action) => {
//       const task = {
//         id: `TASK-${Date.now()}`,
//         title: "",
//         description: "",
//         priority: "Medium",
//         dueDate: "",
//         dueTime: "",
//         adminNotes: "",
//         assignedTo: "",       // empId
//         assignedToName: "",
//         assignedBy: "Admin",
//         status: "Pending",    // Pending | In Progress | Done | Rejected
//         attachments: [],      // [{ name, type, url(base64), size, uploadedBy, uploadedAt }]
//         staffRemark: "",
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         ...action.payload,
//       };
//       state.tasks.push(task);
//       saveTasks(state.tasks);
//     },

//     // Admin: update any task field
//     updateTask: (state, action) => {
//       const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
//       if (idx !== -1) {
//         state.tasks[idx] = {
//           ...state.tasks[idx],
//           ...action.payload,
//           updatedAt: new Date().toISOString(),
//         };
//         saveTasks(state.tasks);
//       }
//     },

//     // Admin: delete a task
//     deleteTask: (state, action) => {
//       state.tasks = state.tasks.filter((t) => t.id !== action.payload);
//       saveTasks(state.tasks);
//     },

//     // Staff: update task status
//     updateTaskStatus: (state, action) => {
//       const { taskId, status } = action.payload;
//       const idx = state.tasks.findIndex((t) => t.id === taskId);
//       if (idx !== -1) {
//         state.tasks[idx].status = status;
//         state.tasks[idx].updatedAt = new Date().toISOString();
//         saveTasks(state.tasks);
//       }
//     },

//     // Staff: add/update remark
//     updateStaffRemark: (state, action) => {
//       const { taskId, remark } = action.payload;
//       const idx = state.tasks.findIndex((t) => t.id === taskId);
//       if (idx !== -1) {
//         state.tasks[idx].staffRemark = remark;
//         state.tasks[idx].updatedAt = new Date().toISOString();
//         saveTasks(state.tasks);
//       }
//     },

//     // Staff/Admin: attach a file to a task
//     addAttachment: (state, action) => {
//       const { taskId, attachment } = action.payload;
//       const idx = state.tasks.findIndex((t) => t.id === taskId);
//       if (idx !== -1) {
//         state.tasks[idx].attachments = [
//           ...(state.tasks[idx].attachments || []),
//           attachment,
//         ];
//         state.tasks[idx].updatedAt = new Date().toISOString();
//         saveTasks(state.tasks);
//       }
//     },

//     // Remove a specific attachment
//     removeAttachment: (state, action) => {
//       const { taskId, attachIdx } = action.payload;
//       const idx = state.tasks.findIndex((t) => t.id === taskId);
//       if (idx !== -1) {
//         state.tasks[idx].attachments.splice(attachIdx, 1);
//         state.tasks[idx].updatedAt = new Date().toISOString();
//         saveTasks(state.tasks);
//       }
//     },

//     // Staff session
//     setStaffSession: (state, action) => {
//       state.staffSession = action.payload;
//     },
//     clearStaffSession: (state) => {
//       state.staffSession = null;
//     },
//   },
// });

// export const {
//   addTask,
//   updateTask,
//   deleteTask,
//   updateTaskStatus,
//   updateStaffRemark,
//   addAttachment,
//   removeAttachment,
//   setStaffSession,
//   clearStaffSession,
// } = taskSlice.actions;

// export default taskSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "staff_tasks_v1";
const SESSION_KEY = "staff_session_v1";

const normalizeTask = (task) => ({
  ...task,
  id: task?.id || task?._id || `TK-${Date.now()}`,
});

const findTaskIndex = (tasks, taskId) =>
  tasks.findIndex((t) => {
    const normalizedTarget = String(taskId || "").trim();
    return (
      String(t.id || "").trim() === normalizedTarget ||
      String(t._id || "").trim() === normalizedTarget
    );
  });

const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const tasks = raw ? JSON.parse(raw) : [];
    return Array.isArray(tasks) ? tasks.map(normalizeTask) : [];
  } catch (err) {
    console.warn("Failed to load tasks from localStorage:", err);
    return [];
  }
};

const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn("Failed to save tasks to localStorage:", err);
  }
};

const loadStaffSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to load staff session from localStorage:", err);
    return null;
  }
};

const saveStaffSession = (session) => {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (err) {
    console.warn("Failed to save staff session to localStorage:", err);
  }
};

const initialState = {
  tasks: loadTasks(),
  staffSession: loadStaffSession(),
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Session Management
    setStaffSession: (state, action) => {
      state.staffSession = action.payload;
      saveStaffSession(action.payload);
    },
    clearStaffSession: (state) => {
      state.staffSession = null;
      saveStaffSession(null);
    },
    setTasks: (state, action) => {
      state.tasks = Array.isArray(action.payload)
        ? action.payload.map(normalizeTask)
        : [];
      saveTasks(state.tasks);
    },

    // Task Operations
    addTask: (state, action) => {
      const newTask = {
        ...action.payload,
        id: `TK-${Date.now()}`,
        status: "Pending",
        createdAt: new Date().toISOString(),
        staffRemark: "",
      };
      state.tasks.unshift(newTask);
      saveTasks(state.tasks);
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => {
        const target = String(action.payload || "").trim();
        return ![
          String(t.id || "").trim(),
          String(t._id || "").trim(),
        ].includes(target);
      });
      saveTasks(state.tasks);
    },
    updateTask: (state, action) => {
      const index = findTaskIndex(state.tasks, action.payload.id);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload,
        };
        saveTasks(state.tasks);
      }
    },

    // Staff-Specific Updates
    updateTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      const index = findTaskIndex(state.tasks, taskId);
      if (index !== -1) {
        state.tasks[index].status = status;
        saveTasks(state.tasks);
      }
    },
    updateStaffRemark: (state, action) => {
      const { taskId, remark } = action.payload;
      const index = findTaskIndex(state.tasks, taskId);
      if (index !== -1) {
        state.tasks[index].staffRemark = remark;
        saveTasks(state.tasks);
      }
    },

    // Attachment Logic
    addAttachment: (state, action) => {
      const { taskId, attachment } = action.payload;
      const index = findTaskIndex(state.tasks, taskId);
      if (index !== -1) {
        if (!state.tasks[index].attachments) state.tasks[index].attachments = [];
        state.tasks[index].attachments.push(attachment);
        saveTasks(state.tasks);
      }
    },
    removeAttachment: (state, action) => {
      const { taskId, attachIdx } = action.payload;
      const index = findTaskIndex(state.tasks, taskId);
      if (index !== -1 && state.tasks[index].attachments) {
        state.tasks[index].attachments.splice(attachIdx, 1);
        saveTasks(state.tasks);
      }
    },
  },
});

export const {
  setStaffSession,
  clearStaffSession,
  setTasks,
  addTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
  updateStaffRemark,
  addAttachment,
  removeAttachment,
} = taskSlice.actions;

export default taskSlice.reducer;