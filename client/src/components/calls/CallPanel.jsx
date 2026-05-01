import { useDispatch, useSelector } from "react-redux";
import { assignCall, endCall, fetchCalls } from "../../features/callSlice";
import { fetchAgents } from "../../features/agentSlice";
import { useEffect, useState, useRef } from "react";
import socket from "../../services/socket";
import toast from "react-hot-toast";

export default function CallPanel({ agents }) {
  const dispatch = useDispatch();

  // 🔥 Persist mode
  const [manualMode, setManualMode] = useState(() => {
    return localStorage.getItem("manualMode") === "true";
  });

  const toggleMode = () => {
    const newValue = !manualMode;
    setManualMode(newValue);
    localStorage.setItem("manualMode", newValue);
  };

  const calls = useSelector(state => state.calls.list || []);

  // 🔥 Track previous incoming count
  const prevIncomingCount = useRef(0);

  // 🔹 filters
  const incoming = calls.filter(c => c.status === "incoming");
  const active = calls.filter(
    c => c.status === "assigned" || c.status === "in_progress"
  );

  // ✅ INITIAL SYNC (avoid first-load toast issue)
  useEffect(() => {
    prevIncomingCount.current = incoming.length;
  }, []);

  // 🔥 SOCKET HANDLER (FINAL CLEAN VERSION)
  useEffect(() => {
    const handler = async () => {
      console.log("⚡ Real-time update");

      const res = await dispatch(fetchCalls());
      dispatch(fetchAgents());

      const updatedCalls = Array.isArray(res.payload)
        ? res.payload
        : [];

      const incomingCalls = updatedCalls.filter(
        c => c.status === "incoming"
      );

      // ✅ Only show toast for NEW incoming calls
      if (
        incomingCalls.length > prevIncomingCount.current &&
        incomingCalls.length > 0
      ) {
        const latestCall = incomingCalls[0];

        toast.success(
          `📞 Call from ${latestCall?.contact?.name || latestCall?.number}`
        );
      }

      prevIncomingCount.current = incomingCalls.length;
    };

    socket.on("callUpdated", handler);

    return () => {
      socket.off("callUpdated", handler);
    };
  }, [dispatch]);

  return (
    <div className="space-y-6">

      {/* 🔥 MODE TOGGLE */}
      <div className="flex justify-end">
        <button
          onClick={toggleMode}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            manualMode
              ? "bg-orange-500 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          {manualMode ? "Manual Mode" : "Auto Mode"}
        </button>
      </div>

      {/* 📞 Incoming Calls */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3">Incoming Calls</h2>

        {incoming.length === 0 && (
          <p className="text-sm text-gray-400">No incoming calls</p>
        )}

        {incoming.map(call => (
          <div key={call._id} className="border p-2 mb-2 rounded">
            <p className="font-medium">
              {call.contact?.name || call.number}
            </p>

            {manualMode ? (
              <select
                onChange={(e) =>
                  dispatch(assignCall({
                    id: call._id,
                    agentId: e.target.value
                  }))
                }
                className="border px-2 py-1 mt-2"
              >
                <option>Select Agent</option>
                {agents.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-green-600 mt-2">
                Auto assigning enabled ⚡
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 Active Calls */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3">Active Calls</h2>

        {active.length === 0 && (
          <p className="text-sm text-gray-400">No active calls</p>
        )}

        {active.map(call => (
          <div key={call._id} className="border p-2 mb-2 rounded">
            <p className="font-medium">
              {call.contact?.name || call.number}
            </p>

            <button
              onClick={() => dispatch(endCall(call._id))}
              className="bg-red-500 text-white px-3 py-1 rounded mt-2"
            >
              End Call
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}