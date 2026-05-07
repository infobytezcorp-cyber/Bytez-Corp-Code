import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // "offline" | "initializing" | "ready" | "incoming" | "on-call" | "calling" | "error"
  status:      "offline",
  deviceReady: false,
  call: null,       // { to?, from?, callSid?, accepted }
  incoming: null,   // { from, callSid }
};

const twilioSlice = createSlice({
  name: "twilio",
  initialState,
  reducers: {
    setDevice(state, action) {
      state.deviceReady = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setCall(state, action) {
      state.call = action.payload;
    },
    setIncoming(state, action) {
      state.incoming = action.payload;
    },
    // ✅ FIX: clearCall — deviceReady பார்த்து status set பண்றோம்
    // முன்னாடி: always "ready" set ஆகும் — device offline-ஆ இருந்தாலும்
    // இப்போ: deviceReady இருந்தா "ready", இல்லன்னா "offline"
    clearCall(state) {
      state.call     = null;
      state.incoming = null;
      state.status   = state.deviceReady ? "ready" : "offline";
    },
  },
});

export const { setDevice, setStatus, setCall, setIncoming, clearCall } =
  twilioSlice.actions;

// ── Selectors ──
export const selectTwilioStatus  = (state) => state.twilio.status;
export const selectIncomingCall  = (state) => state.twilio.incoming;
export const selectActiveCall    = (state) => state.twilio.call;
export const selectDeviceReady   = (state) => state.twilio.deviceReady;

export default twilioSlice.reducer;