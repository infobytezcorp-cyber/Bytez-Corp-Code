import { useEffect, useRef, useCallback } from "react";
import { Device } from "@twilio/voice-sdk";
import { useDispatch } from "react-redux";
import {
    setDevice,
    setCall,
    setStatus,
    setIncoming,
    clearCall,
} from "../../../features/Twilioslice";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
    : "http://localhost:8000/api";

export const useTwilio = () => {
    const dispatch = useDispatch();
    const deviceRef = useRef(null);
    const callRef = useRef(null);
    const dispatchRef = useRef(dispatch);

    useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);

    const handleCallEnded = useRef(() => {
        callRef.current = null;
        dispatchRef.current(clearCall());
        console.log("📴 Call ended — ready");
    });

    // ─────────────────────────────────────────────
    // Token fetch helper
    // ─────────────────────────────────────────────
    const fetchToken = useCallback(async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/calls/token`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) throw new Error("Token fetch failed");
        return data.token;
    }, []);

    // ─────────────────────────────────────────────
    // 1. Init Device
    // ─────────────────────────────────────────────
    const initDevice = useCallback(async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("🎤 Mic permission granted");
            dispatchRef.current(setStatus("initializing"));

            const twilioToken = await fetchToken();

            // Destroy old device + clear old interval
            if (deviceRef.current) {
                if (deviceRef.current._refreshInterval) {
                    clearInterval(deviceRef.current._refreshInterval);
                }
                deviceRef.current.destroy();
                deviceRef.current = null;
                // ✅ FIX: destroy பண்ண deviceReady false பண்ணு
                dispatchRef.current(setDevice(false));
            }

            const device = new Device(twilioToken, {
                logLevel: "warn",
                codecPreferences: ["opus", "pcmu"],
                enableRingingState: true,
            });

            // ✅ Token auto-refresh every 45 minutes
            const refreshInterval = setInterval(async () => {
                try {
                    const newToken = await fetchToken();
                    if (deviceRef.current) {
                        deviceRef.current.updateToken(newToken);
                        console.log("🔄 Token refreshed successfully");
                    }
                } catch (err) {
                    console.error("Token refresh failed:", err.message);
                }
            }, 45 * 60 * 1000);

            device._refreshInterval = refreshInterval;
            deviceRef.current = device;

            // ✅ FIX: "registered" event-ல மட்டும் setDevice(true) + setStatus("ready")
            // முன்னாடி: device.register() call பண்ணின உடனே setDevice(true) — race condition
            // இப்போ: Twilio confirm பண்ணினதும் மட்டும் ready
            device.on("registered", () => {
                console.log("✅ Twilio Device registered");
                dispatchRef.current(setDevice(true));
                dispatchRef.current(setStatus("ready"));
            });

            device.on("error", (err) => {
                console.error("❌ Device error:", err.message, "| code:", err.code);
                // ✅ AccessTokenInvalid → auto re-init
                if (err.code === 20101 || err.code === 31205) {
                    console.log("🔄 Token invalid — re-initializing device in 2s...");
                    setTimeout(() => initDevice(), 2000);
                } else {
                    dispatchRef.current(setStatus("error"));
                }
            });

            device.on("unregistered", () => {
                console.log("📴 Device unregistered");
                // ✅ FIX: unregistered ஆனா deviceReady false
                dispatchRef.current(setDevice(false));
                dispatchRef.current(setStatus("offline"));
            });

            device.on("incoming", (incomingCall) => {
                console.log("📞 Incoming! From:", incomingCall.parameters.From);
                callRef.current = incomingCall;

                dispatchRef.current(setIncoming({
                    from: incomingCall.parameters.From || "Unknown",
                    callSid: incomingCall.parameters.CallSid || "",
                }));
                dispatchRef.current(setCall({
                    from: incomingCall.parameters.From || "Unknown",
                    callSid: incomingCall.parameters.CallSid || "",
                    accepted: false,
                }));
                dispatchRef.current(setStatus("incoming"));

                incomingCall.on("cancel",     () => handleCallEnded.current());
                incomingCall.on("disconnect", () => handleCallEnded.current());
                incomingCall.on("reject",     () => handleCallEnded.current());
            });

            // ✅ FIX: register() பண்றோம் — "registered" event வரும் வரை wait
            // முன்னாடி: register() கீழே உடனே setDevice(true) — wrong
            device.register();

        } catch (err) {
            console.error("initDevice error:", err.message);
            dispatchRef.current(setStatus("error"));
            dispatchRef.current(setDevice(false));
            throw err; // ✅ TelecallerPage handleEnableCalls catch-க்கு bubble
        }
    }, [fetchToken]);

    // ─────────────────────────────────────────────
    // 2. Accept
    // ─────────────────────────────────────────────
    const acceptCall = useCallback(() => {
        if (!callRef.current) return;
        try {
            callRef.current.accept();
            dispatchRef.current(setCall({
                from:    callRef.current.parameters.From,
                callSid: callRef.current.parameters.CallSid,
                accepted: true,
            }));
            dispatchRef.current(setStatus("on-call"));
            // ✅ FIX: accept பண்ணினதும் disconnect listener சேர்
            callRef.current.on("disconnect", () => handleCallEnded.current());
            console.log("✅ Call accepted");
        } catch (err) {
            console.error("Accept error:", err.message);
        }
    }, []);

    // ─────────────────────────────────────────────
    // 3. Reject
    // ─────────────────────────────────────────────
    const rejectCall = useCallback(() => {
        if (!callRef.current) return;
        callRef.current.reject();
        handleCallEnded.current();
    }, []);

    // ─────────────────────────────────────────────
    // 4. Outgoing call
    // ─────────────────────────────────────────────
    const makeCall = useCallback(async (toNumber) => {
        if (!deviceRef.current) return;
        try {
            dispatchRef.current(setStatus("calling"));
            const outgoingCall = await deviceRef.current.connect({
                params: { To: toNumber },
            });
            callRef.current = outgoingCall;
            dispatchRef.current(setCall({ to: toNumber, accepted: true }));
            outgoingCall.on("disconnect", () => handleCallEnded.current());
            outgoingCall.on("cancel",     () => handleCallEnded.current());
        } catch (err) {
            console.error("makeCall error:", err.message);
            dispatchRef.current(setStatus("ready"));
        }
    }, []);

    // ─────────────────────────────────────────────
    // 5. Hang up
    // ─────────────────────────────────────────────
    const hangUp = useCallback(() => {
        if (callRef.current) {
            callRef.current.disconnect();
            callRef.current = null;
        }
        handleCallEnded.current();
    }, []);

    // ─────────────────────────────────────────────
    // 6. Mute
    // ─────────────────────────────────────────────
    const toggleMute = useCallback((mute) => {
        if (!callRef.current) return;
        callRef.current.mute(mute);
    }, []);

    // ─────────────────────────────────────────────
    // Cleanup on unmount
    // ─────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (deviceRef.current) {
                if (deviceRef.current._refreshInterval) {
                    clearInterval(deviceRef.current._refreshInterval);
                }
                deviceRef.current.destroy();
                deviceRef.current = null;
            }
        };
    }, []);

    return { acceptCall, rejectCall, makeCall, hangUp, toggleMute, initDevice };
};