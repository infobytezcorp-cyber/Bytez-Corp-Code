// components/chat/AdminChatPanel.jsx
// Full-featured admin chat — sidebar with agent list + message window
// Design: Clean messenger-style (Messenger/Linear inspired) — functionality unchanged

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHistory, uploadFile,
  setActiveChat, clearUnread, setTyping,
} from "../../features/chatSlice";
import socket from "../../services/socket";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:          "#F4F6F8",
  card:        "#FFFFFF",
  sidebar:     "#FAFBFC",
  border:      "#EAECEF",
  borderLight: "#F0F2F5",
  text:        "#1A1D23",
  muted:       "#9DA3AE",
  sub:         "#6B7280",
  accent:      "#1A1D23",        // dark bubble (mine)
  accentText:  "#FFFFFF",
  accentSoft:  "#F0F2FF",
  green:       "#22C55E",
  greenSoft:   "#DCFCE7",
  red:         "#EF4444",
  font:        "'DM Sans', system-ui, -apple-system, sans-serif",
  radius:      "16px",
  radiusSm:    "10px",
  shadow:      "0 1px 3px rgba(0,0,0,.06)",
  shadowMd:    "0 4px 16px rgba(0,0,0,.08)",
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
const AVATAR_COLORS = [
  ["#1A1D23", "#fff"],
  ["#3B5BDB", "#fff"],
  ["#0EA5E9", "#fff"],
  ["#7C3AED", "#fff"],
  ["#059669", "#fff"],
  ["#D97706", "#fff"],
];
function getColor(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function Avatar({ name = "?", size = 38, online }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const [bg, fg] = getColor(name);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: fg, fontSize: size * 0.33, fontWeight: 600, fontFamily: T.font,
        letterSpacing: "0.02em",
      }}>
        {initials}
      </div>
      {online !== undefined && (
        <span style={{
          position: "absolute", bottom: 1, right: 1,
          width: size * 0.27, height: size * 0.27, borderRadius: "50%",
          background: online ? T.green : T.muted,
          border: "2px solid #fff",
        }} />
      )}
    </div>
  );
}

// ─── Icon components (inline SVG, no deps) ───────────────────────────────────
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconPaperclip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);
const IconSmile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 13s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.5 1.22 2 2 0 012.5 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const IconVideo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, isMine, onReact, onDelete, myId }) {
  const [hover, setHover]         = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showDel, setShowDel]     = useState(false);

  if (msg.deletedForSelf) return null;

  const withinDelete = Date.now() - new Date(msg.createdAt).getTime() < 5 * 60 * 1000;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        alignItems: isMine ? "flex-end" : "flex-start",
        marginBottom: 2, position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setShowEmoji(false); setShowDel(false); }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexDirection: isMine ? "row-reverse" : "row" }}>

        {/* Bubble */}
        <div style={{
          maxWidth: 380, padding: "10px 14px",
          background: isMine ? T.accent : T.card,
          color: isMine ? T.accentText : T.text,
          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          border: isMine ? "none" : `1px solid ${T.border}`,
          fontSize: 14, lineHeight: 1.55, fontFamily: T.font,
          boxShadow: T.shadow, position: "relative",
          wordBreak: "break-word",
        }}>
          {msg.fileUrl && msg.fileType === "image" && (
            <img
              src={msg.fileUrl} alt={msg.fileName}
              style={{ maxWidth: 240, maxHeight: 180, borderRadius: 10, display: "block", marginBottom: msg.text ? 8 : 0 }}
            />
          )}
          {msg.fileUrl && msg.fileType !== "image" && (
            <a href={msg.fileUrl} download={msg.fileName} style={{
              display: "flex", alignItems: "center", gap: 7, fontSize: 12,
              color: isMine ? "rgba(255,255,255,0.85)" : T.sub,
              marginBottom: msg.text ? 6 : 0, textDecoration: "none",
              background: isMine ? "rgba(255,255,255,0.1)" : T.bg,
              padding: "6px 10px", borderRadius: 8,
            }}>
              <IconPaperclip /> {msg.fileName || "File"}
            </a>
          )}
          {msg.text && <span style={{ display: "block" }}>{msg.text}</span>}

          <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, fontSize: 11, marginTop: 4, opacity: 0.55 }}>
            {timeStr(msg.createdAt)}
            {isMine && (
              <span style={{ fontSize: 11, letterSpacing: -1 }}>
                {msg.read ? "✓✓" : "✓"}
              </span>
            )}
          </span>
        </div>

        {/* Hover actions */}
        {hover && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <button
              onClick={() => setShowEmoji(v => !v)}
              style={{ ...iconBtn }}
              title="React"
            >
              <IconSmile />
            </button>
            {isMine && withinDelete && (
              <button
                onClick={() => setShowDel(v => !v)}
                style={{ ...iconBtn, color: T.red }}
                title="Delete"
              >
                <IconTrash />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reactions */}
      {msg.reactions?.length > 0 && (
        <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap", justifyContent: isMine ? "flex-end" : "flex-start" }}>
          {Object.entries(
            msg.reactions.reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]) => (
            <span
              key={emoji}
              onClick={() => onReact(msg._id, emoji)}
              style={{
                fontSize: 13, background: T.card,
                borderRadius: 99, padding: "2px 8px", cursor: "pointer",
                border: `1px solid ${T.border}`, boxShadow: T.shadow,
                userSelect: "none",
              }}
            >
              {emoji}{count > 1 ? <span style={{ fontSize: 11, marginLeft: 2, color: T.sub }}>{count}</span> : ""}
            </span>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", [isMine ? "right" : "left"]: 0,
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: "8px 10px", display: "flex", gap: 4,
          boxShadow: T.shadowMd, zIndex: 20,
        }}>
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => { onReact(msg._id, e); setShowEmoji(false); }}
              style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 8, transition: "transform 0.1s" }}
              onMouseEnter={ev => ev.currentTarget.style.transform = "scale(1.25)"}
              onMouseLeave={ev => ev.currentTarget.style.transform = "scale(1)"}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {showDel && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", right: 0,
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "12px 16px", boxShadow: T.shadowMd, zIndex: 20, minWidth: 190,
        }}>
          <p style={{ fontSize: 12, color: T.sub, margin: "0 0 10px", fontFamily: T.font }}>Delete this message?</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { onDelete(msg._id, false); setShowDel(false); }} style={{ ...smallBtn }}>For me</button>
            <button onClick={() => { onDelete(msg._id, true); setShowDel(false); }} style={{ ...smallBtn, background: T.red, color: "#fff", borderColor: T.red }}>For everyone</button>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn = {
  width: 28, height: 28, borderRadius: 8,
  border: `1px solid ${T.border}`, background: T.card,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  color: T.muted, transition: "background 0.12s, color 0.12s",
};
const smallBtn = {
  padding: "5px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
  background: T.card, fontSize: 12, fontWeight: 500, cursor: "pointer",
  fontFamily: T.font, color: T.sub, transition: "background 0.12s",
};

// ─── Message Window ───────────────────────────────────────────────────────────
function MessageWindow({ agent, myId, messages, loading, isTyping }) {
  const dispatch        = useDispatch();
  const [text, setText] = useState("");
  const bottomRef       = useRef(null);
  const typingTimer     = useRef(null);
  const fileRef         = useRef(null);
  const { uploading }   = useSelector(s => s.chat);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleReact  = (msgId, emoji) => socket.emit("chat:react",  { msgId, emoji, receiverId: agent._id });
  const handleDelete = (msgId, forAll) => socket.emit("chat:delete", { msgId, receiverId: agent._id, deleteForAll: forAll });

  const grouped = [];
  let lastDate = null;
  (messages || []).forEach(msg => {
    const d = dateStr(msg.createdAt);
    if (d !== lastDate) { grouped.push({ type: "date", label: d }); lastDate = d; }
    grouped.push({ type: "msg", msg });
  });

  if (!agent) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
        <p style={{ fontSize: 14, color: T.muted, fontFamily: T.font }}>Select a conversation</p>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, minWidth: 0 }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", background: T.card,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={agent.name} size={40} online={agent.isOnline} />
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: 0, fontFamily: T.font }}>{agent.name}</p>
            <p style={{ fontSize: 12, margin: 0, fontFamily: T.font, display: "flex", alignItems: "center", gap: 4 }}>
              {isTyping ? (
                <span style={{ color: "#3B5BDB", fontStyle: "italic" }}>typing…</span>
              ) : agent.isOnline ? (
                <>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, display: "inline-block" }} />
                  <span style={{ color: T.green, fontWeight: 500 }}>Active now</span>
                </>
              ) : (
                <span style={{ color: T.muted }}>Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Header action icons */}
        <div style={{ display: "flex", gap: 4 }}>
          {[IconPhone, IconVideo, IconInfo].map((Icon, i) => (
            <button key={i} style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1px solid ${T.border}`, background: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: T.muted, transition: "background 0.12s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 3 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: T.muted, fontSize: 13, fontFamily: T.font }}>Loading…</div>
        ) : grouped.map((item, i) => (
          item.type === "date" ? (
            <div key={i} style={{ textAlign: "center", margin: "14px 0 8px" }}>
              <span style={{
                fontSize: 11, fontWeight: 600, color: T.muted,
                background: T.bg, padding: "3px 12px", borderRadius: 99,
                textTransform: "uppercase", letterSpacing: "0.06em",
                fontFamily: T.font,
              }}>
                {item.label}
              </span>
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

      {/* ── Input bar ── */}
      <div style={{
        padding: "12px 20px 16px",
        background: T.card,
        borderTop: `1px solid ${T.border}`,
      }}>
        {/* Placeholder name hint */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 10,
          background: T.bg, borderRadius: 14, border: `1px solid ${T.border}`,
          padding: "10px 14px",
        }}>
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} />

          <textarea
            value={text}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${agent.name.split(" ")[0]}…`}
            rows={1}
            style={{
              flex: 1, border: "none", background: "transparent", resize: "none",
              fontSize: 14, fontFamily: T.font, outline: "none",
              color: T.text, lineHeight: 1.5, padding: 0,
              maxHeight: 100, overflowY: "auto",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ ...inputIconBtn }}
              title="Attach file"
            >
              <IconPaperclip />
            </button>
            <button style={{ ...inputIconBtn }} title="Emoji">
              <IconSmile />
            </button>
            <button
              onClick={send}
              disabled={!text.trim()}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 10, border: "none",
                background: text.trim() ? T.accent : T.border,
                color: text.trim() ? "#fff" : T.muted,
                fontSize: 13, fontWeight: 600, fontFamily: T.font,
                cursor: text.trim() ? "pointer" : "not-allowed",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              Send <IconSend />
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <p style={{ fontSize: 11, color: T.muted, margin: "6px 0 0 4px", fontFamily: T.font }}>
          ↵ to send · ⇧↵ new line
        </p>
      </div>
    </div>
  );
}

const inputIconBtn = {
  width: 32, height: 32, borderRadius: 8,
  border: "none", background: "transparent",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  color: T.muted, transition: "background 0.12s, color 0.12s",
};

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

  // "You" entry at bottom of sidebar
  const meAgent = { _id: myId, name: "You", isMe: true };

  return (
    <div style={{
      display: "flex", height: "100%",
      background: T.card, fontFamily: T.font,
      borderRadius: T.radius, overflow: "hidden",
      border: `1px solid ${T.border}`, boxShadow: T.shadowMd,
    }}>

      {/* ── Left sidebar ── */}
      <div style={{
        width: 280, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", flexShrink: 0,
        background: T.sidebar,
      }}>
        {/* Sidebar header */}
        <div style={{ padding: "18px 18px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 2px", fontFamily: T.font }}>
                INBOX
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: 0, fontFamily: T.font }}>Messages</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted }}
              >
                <IconClose />
              </button>
            )}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted, pointerEvents: "none" }}>
              <IconSearch />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search agents…"
              style={{
                width: "100%", padding: "8px 10px 8px 30px",
                borderRadius: 10, border: `1px solid ${T.border}`,
                fontSize: 13, fontFamily: T.font, outline: "none",
                color: T.text, background: T.card, boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#3B5BDB"}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
        </div>

        {/* Agent list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, color: T.muted, fontSize: 13, textAlign: "center", fontFamily: T.font }}>
              No agents found.
            </div>
          ) : filtered.map(agent => {
            const isOnline    = onlineUsers.includes(agent._id);
            const unreadCnt   = unread[agent._id] || 0;
            const isActive    = activeChat === agent._id;
            const lastMsg     = (conversations[agent._id] || []).at(-1);
            const isTypingNow = typing[agent._id];
            const preview     = isTypingNow
              ? "typing…"
              : (lastMsg?.text || lastMsg?.fileName || (lastMsg ? "📎 File" : "No messages yet"));

            return (
              <div
                key={agent._id}
                onClick={() => selectAgent({ ...agent, isOnline })}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", cursor: "pointer",
                  background: isActive ? "#EEF2FF" : "transparent",
                  borderLeft: isActive ? "3px solid #3B5BDB" : "3px solid transparent",
                  transition: "background .12s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.borderLight; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Avatar name={agent.name} size={40} online={isOnline} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: unreadCnt ? 700 : 500, color: T.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.font }}>
                      {agent.name}
                    </p>
                    {lastMsg && (
                      <span style={{ fontSize: 11, color: unreadCnt ? "#3B5BDB" : T.muted, flexShrink: 0, marginLeft: 4, fontWeight: unreadCnt ? 600 : 400, fontFamily: T.font }}>
                        {timeStr(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: isTypingNow ? "#3B5BDB" : T.muted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.font, fontStyle: isTypingNow ? "italic" : "normal" }}>
                    {preview}
                  </p>
                </div>
                {unreadCnt > 0 && (
                  <span style={{
                    minWidth: 20, height: 20, borderRadius: 99,
                    background: "#3B5BDB", color: "#fff",
                    fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 5px", flexShrink: 0, fontFamily: T.font,
                  }}>
                    {unreadCnt}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* "You" entry at bottom */}
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name="You" size={36} online={true} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0, fontFamily: T.font }}>You</p>
              <p style={{ fontSize: 11, color: T.green, margin: "1px 0 0", fontFamily: T.font, display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} />
                Available
              </p>
            </div>
          </div>
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