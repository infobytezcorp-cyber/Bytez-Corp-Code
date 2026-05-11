import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

// Async thunks 

export const fetchHistory = createAsyncThunk(
  "chat/fetchHistory",
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/chat/history/${userId}?page=${page}&limit=40`);
      return { userId, messages: data.messages, page };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchUnread = createAsyncThunk("chat/fetchUnread", async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get("/chat/unread");
    return data.unread; // { senderId: count }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const uploadFile = createAsyncThunk(
  "chat/uploadFile",
  async (file, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await API.post("/chat/upload", form);
      return data; // { fileUrl, fileName, fileType }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Slice definition

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    // conversations: { [userId]: Message[] }
    conversations: {},
    // unread: { [userId]: count }
    unread:        {},
    // onlineUsers: Set stored as array for Redux serialization
    onlineUsers:   [],
    // typing: { [userId]: bool }
    typing:        {},
    notifications: [],
    activeChat:    null,   // userId of open chat window
    loading:       false,
    uploading:     false,
    error:         null,
  },
  reducers: {
    setActiveChat(state, { payload }) {
      state.activeChat = payload;
      // Clear unread when opening chat
      if (payload) delete state.unread[payload];
    },
    receiveMessage(state, { payload: msg }) {
      const other =
        msg.senderId._id === state.activeChat || msg.senderId === state.activeChat
          ? msg.senderId._id || msg.senderId
          : msg.receiverId;
      const key = msg.senderId._id || msg.senderId;
      const convKey = key === state.activeChat ? key : msg.senderId._id || msg.senderId;

      // Determine conversation key (the other person)
      const meId = msg.receiverId; // we'll normalise below
      [msg.senderId._id || msg.senderId, msg.receiverId].forEach(uid => {
        const id = uid?.toString?.() ?? uid;
        if (!state.conversations[id]) state.conversations[id] = [];
      });

      // Add to the correct conversation bucket
      const sId = msg.senderId._id?.toString() || msg.senderId?.toString();
      const rId = msg.receiverId?.toString();
      const bucketKey = sId === state.activeChat || rId === state.activeChat
        ? state.activeChat
        : sId;

      if (!state.conversations[bucketKey]) state.conversations[bucketKey] = [];
      // Avoid duplicates
      const exists = state.conversations[bucketKey].some(m => m._id === msg._id);
      if (!exists) state.conversations[bucketKey].push(msg);
    },
    incomingUnread(state, { payload: { fromId } }) {
      if (fromId !== state.activeChat) {
        state.unread[fromId] = (state.unread[fromId] || 0) + 1;
      }
    },
    setOnlineUsers(state, { payload }) {
      state.onlineUsers = payload;
    },
    setTyping(state, { payload: { senderId, isTyping } }) {
      state.typing[senderId] = isTyping;
    },
    addNotification(state, { payload }) {
      state.notifications.unshift(payload);
      if (state.notifications.length > 50) state.notifications.pop();
    },
    markNotificationRead(state, { payload: id }) {
      if (id === "all") {
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
      } else {
        const notif = state.notifications.find(n => n.id === id);
        if (notif) notif.read = true;
      }
    },
    markNotificationsFromUserRead(state, { payload: userId }) {
      state.notifications = state.notifications.map(n => (
        n.fromId === userId && n.type === "message" ? { ...n, read: true } : n
      ));
    },
    updateReactions(state, { payload: { msgId, reactions } }) {
      Object.values(state.conversations).forEach(msgs => {
        const m = msgs.find(m => m._id === msgId);
        if (m) m.reactions = reactions;
      });
    },
    deleteMessage(state, { payload: { msgId, forAll } }) {
      Object.keys(state.conversations).forEach(uid => {
        if (forAll) {
          state.conversations[uid] = state.conversations[uid].filter(m => m._id !== msgId);
        } else {
          const m = state.conversations[uid].find(m => m._id === msgId);
          if (m) m.deletedForSelf = true;
        }
      });
    },
    clearUnread(state, { payload: userId }) {
      delete state.unread[userId];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchHistory.pending,  (state) => { state.loading = true; })
      .addCase(fetchHistory.fulfilled, (state, { payload: { userId, messages } }) => {
        state.loading = false;
        state.conversations[userId] = messages;
      })
      .addCase(fetchHistory.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload;
      })
      .addCase(fetchUnread.fulfilled, (state, { payload }) => {
        state.unread = { ...state.unread, ...payload };
      })
      .addCase(uploadFile.pending,    (state) => { state.uploading = true; })
      .addCase(uploadFile.fulfilled,  (state) => { state.uploading = false; })
      .addCase(uploadFile.rejected,   (state) => { state.uploading = false; });
  },
});

export const {
  setActiveChat, receiveMessage, incomingUnread,
  setOnlineUsers, setTyping, addNotification,
  markNotificationRead, markNotificationsFromUserRead,
  updateReactions, deleteMessage, clearUnread,
} = chatSlice.actions;

export default chatSlice.reducer;