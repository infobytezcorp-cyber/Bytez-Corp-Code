// components/chat/AdminChatPanel.jsx
// Full-featured admin chat — sidebar with agent list + message window

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHistory, uploadFile,
  setActiveChat, clearUnread, setTyping,
} from "../../features/chatSlice";
import socket from "../../services/socket";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        "#F5F7FA",
  card:      "#FFFFFF",
  border:    "#E8ECF0",
  text:      "#111827",
  muted:     "#9CA3AF",
  sub:       "#6B7280",
  accent:    "#4F6EF7",
  accentSoft:"#EEF1FE",
  green:     "#10B981",
  red:       "#EF4444",
  font:      "'Outfit', sans-serif",
  radius:    "12px",
  shadow:    "0 1px 4px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)",
};

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeStr(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function dateStr(iso) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name = "?", size = 36, online }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg,#4F6EF7,#6B8BFF)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: size * 0.35, fontWeight: 700, fontFamily: T.font,
      }}>
        {initials}
      </div>
      {online !== undefined && (
        <span style={{
          position: "absolute", bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28, borderRadius: "50%",
          background: online ? T.green : T.muted,
          border: "2px solid #fff",
        }} />
      )}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, isMine, onReact, onDelete, myId }) {
  const [hover, setHover]       = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showDel, setShowDel]   = useState(false);

  if (msg.deletedForSelf) return null;

  const withinDelete = Date.now() - new Date(msg.createdAt).getTime() < 5 * 60 * 1000;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        alignItems: isMine ? "flex-end" : "flex-start",
        marginBottom: 4, position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setShowEmoji(false); setShowDel(false); }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexDirection: isMine ? "row-reverse" : "row" }}>

        {/* Bubble */}
        <div style={{
          maxWidth: 340, padding: "9px 13px",
          background: isMine ? T.accent : T.card,
          color: isMine ? "#fff" : T.text,
          borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          border: isMine ? "none" : `1px solid ${T.border}`,
          fontSize: 13, lineHeight: 1.5, fontFamily: T.font,
          boxShadow: T.shadow, position: "relative",
          wordBreak: "break-word",
        }}>
          {/* File attachment */}
          {msg.fileUrl && msg.fileType === "image" && (
            <img
              src={msg.fileUrl} alt={msg.fileName}
              style={{ maxWidth: 220, maxHeight: 160, borderRadius: 8, display: "block", marginBottom: msg.text ? 6 : 0 }}
            />
          )}
          {msg.fileUrl && msg.fileType !== "image" && (
            <a href={msg.fileUrl} download={msg.fileName} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: isMine ? "#fff" : T.accent, marginBottom: msg.text ? 6 : 0 }}>
              📎 {msg.fileName || "File"}
            </a>
          )}
          {msg.text && <span>{msg.text}</span>}

          {/* Time + read tick */}
          <span style={{ display: "block", textAlign: "right", fontSize: 10, marginTop: 3, opacity: 0.65 }}>
            {timeStr(msg.createdAt)}
            {isMine && <span style={{ marginLeft: 4 }}>{msg.read ? "✓✓" : "✓"}</span>}
          </span>
        </div>

        {/* Action buttons on hover */}
        {hover && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <button
              onClick={() => setShowEmoji(v => !v)}
              style={{ ...iconBtn, fontSize: 14 }}
              title="React"
            >😊</button>
            {isMine && withinDelete && (
              <button
                onClick={() => setShowDel(v => !v)}
                style={{ ...iconBtn, color: T.red }}
                title="Delete"
              >🗑</button>
            )}
          </div>
        )}
      </div>

      {/* Reactions */}
      {msg.reactions?.length > 0 && (
        <div style={{ display: "flex", gap: 3, marginTop: 3, flexWrap: "wrap", justifyContent: isMine ? "flex-end" : "flex-start" }}>
          {Object.entries(
            msg.reactions.reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]) => (
            <span
              key={emoji}
              onClick={() => onReact(msg._id, emoji)}
              style={{ fontSize: 13, background: T.accentSoft, borderRadius: 99, padding: "1px 6px", cursor: "pointer", border: `1px solid ${T.border}` }}
            >
              {emoji} {count > 1 ? count : ""}
            </span>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{
          position: "absolute", bottom: "100%", [isMine ? "right" : "left"]: 0,
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "6px 8px", display: "flex", gap: 6, boxShadow: T.shadow, zIndex: 10,
        }}>
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => { onReact(msg._id, e); setShowEmoji(false); }}
              style={{ fontSize: 18, background: "none", border: "none", cursor: "pointer", padding: 2 }}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {showDel && (
        <div style={{
          position: "absolute", bottom: "100%", right: 0,
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "10px 14px", boxShadow: T.shadow, zIndex: 10, minWidth: 180,
        }}>
          <p style={{ fontSize: 12, color: T.sub, margin: "0 0 8px" }}>Delete this message?</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { onDelete(msg._id, false); setShowDel(false); }} style={{ ...smallBtn }}>For me</button>
            <button onClick={() => { onDelete(msg._id, true);  setShowDel(false); }} style={{ ...smallBtn, background: T.red, color: "#fff", borderColor: T.red }}>For everyone</button>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn = {
  width: 26, height: 26, borderRadius: 7,
  border: `1px solid ${T.border}`, background: T.card,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 12, color: T.muted,
};
const smallBtn = {
  padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.border}`,
  background: T.card, fontSize: 11, fontWeight: 600, cursor: "pointer",
  fontFamily: T.font, color: T.sub,
};

// ─── Message Window ───────────────────────────────────────────────────────────
function MessageWindow({ agent, myId, messages, loading, isTyping }) {
  const dispatch     = useDispatch();
  const [text, setText] = useState("");
  const bottomRef    = useRef(null);
  const typingTimer  = useRef(null);
  const fileRef      = useRef(null);
  const { uploading } = useSelector(s => s.chat);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark read when window opens / new messages arrive
  useEffect(() => {
    if (agent?._id) {
      socket.emit("chat:read", { senderId: agent._id });
      dispatch(clearUnread(agent._id));
    }
  }, [agent?._id, messages?.length]);

  const handleTyping = (val) => {
    setText(val);
    socket.emit("chat:typing", { receiverId: agent._id, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("chat:typing", { receiverId: agent._id, isTyping: false });
    }, 1500);
  };

  const send = useCallback(() => {
    if (!text.trim()) return;
    socket.emit("chat:send", { receiverId: agent._id, text: text.trim() });
    setText("");
    socket.emit("chat:typing", { receiverId: agent._id, isTyping: false });
  }, [text, agent?._id]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await dispatch(uploadFile(file)).unwrap();
    socket.emit("chat:send", {
      receiverId: agent._id,
      text: "",
      fileUrl:  result.fileUrl,
      fileName: result.fileName,
      fileType: result.fileType,
    });
    e.target.value = "";
  };

  const handleReact = (msgId, emoji) => {
    socket.emit("chat:react", { msgId, emoji, receiverId: agent._id });
  };
  const handleDelete = (msgId, forAll) => {
    socket.emit("chat:delete", { msgId, receiverId: agent._id, deleteForAll: forAll });
  };

  // Group messages by date
  const grouped = [];
  let lastDate = null;
  (messages || []).forEach(msg => {
    const d = dateStr(msg.createdAt);
    if (d !== lastDate) { grouped.push({ type: "date", label: d }); lastDate = d; }
    grouped.push({ type: "msg", msg });
  });

  if (!agent) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontFamily: T.font }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
        <p style={{ fontSize: 13 }}>Select an agent to start chatting</p>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: T.card, borderBottom: `1px solid ${T.border}`, boxShadow: T.shadow }}>
        <Avatar name={agent.name} size={38} online={agent.isOnline} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.font }}>{agent.name}</p>
          <p style={{ fontSize: 11, color: isTyping ? T.accent : (agent.isOnline ? T.green : T.muted), margin: 0, fontFamily: T.font }}>
            {isTyping ? "typing…" : agent.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: T.muted, fontSize: 13 }}>Loading messages…</div>
        ) : grouped.map((item, i) => (
          item.type === "date" ? (
            <div key={i} style={{ textAlign: "center", margin: "12px 0 6px" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, background: T.bg, padding: "2px 10px", borderRadius: 99 }}>{item.label}</span>
            </div>
          ) : (
            <Bubble
              key={item.msg._id}
              msg={item.msg}
              isMine={(item.msg.senderId?._id || item.msg.senderId) === myId}
              onReact={handleReact}
              onDelete={handleDelete}
              myId={myId}
            />
          )
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: "10px 16px", background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        {/* File attach */}
        <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ ...iconBtn, width: 34, height: 34, flexShrink: 0 }}
          title="Attach file"
        >
          📎
        </button>

        <input
          value={text}
          onChange={e => handleTyping(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message…"
          style={{
            flex: 1, padding: "9px 14px", borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.bg,
            fontSize: 13, fontFamily: T.font, outline: "none",
            color: T.text,
          }}
        />

        <button
          onClick={send}
          disabled={!text.trim()}
          style={{
            width: 36, height: 36, borderRadius: 10, border: "none",
            background: text.trim() ? T.accent : T.border,
            color: "#fff", fontSize: 16, cursor: text.trim() ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .15s", flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin Chat Panel ────────────────────────────────────────────────────
export default function AdminChatPanel({ myId, agents = [], onClose }) {
  const dispatch = useDispatch();
  const { conversations, unread, onlineUsers, typing, activeChat, loading } = useSelector(s => s.chat);
  const [search, setSearch] = useState("");

  const activeAgent = agents.find(a => a._id === activeChat);

  useEffect(() => {
    if (!activeChat && agents.length > 0) {
      const firstAgent = agents[0];
      dispatch(setActiveChat(firstAgent._id));
      dispatch(fetchHistory({ userId: firstAgent._id }));
    }
  }, [agents, activeChat, dispatch]);

  const selectAgent = (agent) => {
    dispatch(setActiveChat(agent._id));
    dispatch(fetchHistory({ userId: agent._id }));
  };

  useEffect(() => {
    if (activeChat) {
      dispatch(fetchHistory({ userId: activeChat }));
    }
  }, [activeChat, dispatch]);

  const filtered = agents.filter(a =>
    (a.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      display: "flex", height: "100%",
      background: T.card, fontFamily: T.font,
      borderRadius: T.radius, overflow: "hidden",
      border: `1px solid ${T.border}`, boxShadow: T.shadow,
    }}>

      {/* ── Left sidebar: agent list ── */}
      <div style={{ width: 260, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>Messages</p>
            {onClose && (
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.muted }}>✕</button>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.muted }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search agents…"
              style={{ width: "100%", padding: "7px 10px 7px 28px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, outline: "none", color: T.text, background: T.bg, boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Agent list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, color: T.muted, fontSize: 13, textAlign: "center" }}>
              No agents or telecallers available for chat.
            </div>
          ) : filtered.map(agent => {
            const isOnline  = onlineUsers.includes(agent._id);
            const unreadCnt = unread[agent._id] || 0;
            const isActive  = activeChat === agent._id;
            const lastMsg   = (conversations[agent._id] || []).at(-1);
            const isTypingNow = typing[agent._id];

            return (
              <div
                key={agent._id}
                onClick={() => selectAgent({ ...agent, isOnline })}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer",
                  background: isActive ? T.accentSoft : "transparent",
                  borderLeft: isActive ? `3px solid ${T.accent}` : "3px solid transparent",
                  transition: "background .15s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.bg; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Avatar name={agent.name} size={38} online={isOnline} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.name}</p>
                    {lastMsg && <span style={{ fontSize: 10, color: T.muted, flexShrink: 0, marginLeft: 4 }}>{timeStr(lastMsg.createdAt)}</span>}
                  </div>
                  <p style={{ fontSize: 11, color: isTypingNow ? T.accent : T.muted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {isTypingNow ? "typing…" : (lastMsg?.text || lastMsg?.fileName || (lastMsg ? "📎 File" : "No messages yet"))}
                  </p>
                </div>
                {unreadCnt > 0 && (
                  <span style={{ minWidth: 20, height: 20, borderRadius: 99, background: T.accent, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0 }}>
                    {unreadCnt}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: message window ── */}
      <MessageWindow
        agent={activeAgent ? { ...activeAgent, isOnline: onlineUsers.includes(activeAgent._id) } : null}
        myId={myId}
        messages={conversations[activeChat] || []}
        loading={loading}
        isTyping={!!typing[activeChat]}
      />
    </div>
  );
}