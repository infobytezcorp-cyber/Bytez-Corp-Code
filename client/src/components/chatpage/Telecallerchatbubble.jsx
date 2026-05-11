// components/chat/TelecallerChatBubble.jsx
// Floating chat bubble for telecallers — add once in App.jsx / layout

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistory, uploadFile, setActiveChat, clearUnread } from "../../features/chatSlice";
import socket from "../../services/socket";

const T = {
  bg:        "#F5F7FA",
  card:      "#FFFFFF",
  border:    "#E8ECF0",
  text:      "#111827",
  muted:     "#9CA3AF",
  accent:    "#4F6EF7",
  accentSoft:"#EEF1FE",
  green:     "#10B981",
  red:       "#EF4444",
  font:      "'Outfit', sans-serif",
  shadow:    "0 4px 24px rgba(0,0,0,0.13)",
};

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function timeStr(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Mini Avatar ──────────────────────────────────────────────────────────────
function Avatar({ name = "?", size = 32 }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#4F6EF7,#6B8BFF)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.36, fontWeight: 700, fontFamily: T.font, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Mini Bubble ──────────────────────────────────────────────────────────────
function MiniBubble({ msg, isMine, onReact, onDelete }) {
  const [hover, setHover] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  if (msg.deletedForSelf) return null;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", marginBottom: 3 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setShowEmoji(false); }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, flexDirection: isMine ? "row-reverse" : "row", position: "relative" }}>
        <div style={{
          maxWidth: 220, padding: "7px 11px",
          background: isMine ? T.accent : T.card,
          color: isMine ? "#fff" : T.text,
          borderRadius: isMine ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
          border: isMine ? "none" : `1px solid ${T.border}`,
          fontSize: 12, lineHeight: 1.5, fontFamily: T.font,
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
          wordBreak: "break-word",
        }}>
          {msg.fileUrl && msg.fileType === "image" && (
            <img src={msg.fileUrl} alt={msg.fileName} style={{ maxWidth: 160, borderRadius: 6, display: "block", marginBottom: msg.text ? 4 : 0 }} />
          )}
          {msg.fileUrl && msg.fileType !== "image" && (
            <a href={msg.fileUrl} download={msg.fileName} style={{ fontSize: 11, color: isMine ? "#fff" : T.accent }}>
              📎 {msg.fileName}
            </a>
          )}
          {msg.text && <span>{msg.text}</span>}
          <span style={{ display: "block", textAlign: "right", fontSize: 9, marginTop: 2, opacity: 0.6 }}>
            {timeStr(msg.createdAt)}
            {isMine && <span style={{ marginLeft: 3 }}>{msg.read ? "✓✓" : "✓"}</span>}
          </span>
        </div>

        {hover && (
          <button
            onClick={() => setShowEmoji(v => !v)}
            style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            😊
          </button>
        )}

        {showEmoji && (
          <div style={{
            position: "absolute", bottom: "100%", [isMine ? "right" : "left"]: 0,
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
            padding: "5px 7px", display: "flex", gap: 5, boxShadow: T.shadow, zIndex: 20,
          }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { onReact(msg._id, e); setShowEmoji(false); }}
                style={{ fontSize: 16, background: "none", border: "none", cursor: "pointer", padding: 1 }}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reactions */}
      {msg.reactions?.length > 0 && (
        <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap", justifyContent: isMine ? "flex-end" : "flex-start" }}>
          {Object.entries(
            msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})
          ).map(([emoji, count]) => (
            <span key={emoji} onClick={() => onReact(msg._id, emoji)}
              style={{ fontSize: 11, background: T.accentSoft, borderRadius: 99, padding: "0 5px", cursor: "pointer", border: `1px solid ${T.border}` }}>
              {emoji}{count > 1 ? ` ${count}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Bubble Component ────────────────────────────────────────────────────
export default function TelecallerChatBubble({ myId, adminId, adminName = "Admin", open: openProp, onToggle }) {
  const dispatch   = useDispatch();
  const { conversations, unread, typing, loading, uploading } = useSelector(s => s.chat);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpenState = (value) => {
    if (openProp !== undefined) {
      onToggle?.(value);
    } else {
      setInternalOpen(value);
    }
  };
  const toggleOpen = () => setOpenState(!open);
  const [text, setText]   = useState("");
  const bottomRef         = useRef(null);
  const typingTimer        = useRef(null);
  const fileRef            = useRef(null);

  const messages   = conversations[adminId] || [];
  const totalUnread = unread[adminId] || 0;
  const isTyping   = typing[adminId];

  useEffect(() => {
    if (open) {
      dispatch(fetchHistory({ userId: adminId }));
      dispatch(setActiveChat(adminId));
      socket.emit("chat:read", { senderId: adminId });
      dispatch(clearUnread(adminId));
    }
  }, [open, adminId, dispatch]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  const handleTyping = (val) => {
    setText(val);
    socket.emit("chat:typing", { receiverId: adminId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("chat:typing", { receiverId: adminId, isTyping: false });
    }, 1500);
  };

  const send = useCallback(() => {
    if (!text.trim()) return;
    socket.emit("chat:send", { receiverId: adminId, text: text.trim() });
    setText("");
    socket.emit("chat:typing", { receiverId: adminId, isTyping: false });
  }, [text, adminId]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await dispatch(uploadFile(file)).unwrap();
    socket.emit("chat:send", { receiverId: adminId, ...res, text: "" });
    e.target.value = "";
  };

  const handleReact  = (msgId, emoji) => socket.emit("chat:react",  { msgId, emoji, receiverId: adminId });
  const handleDelete = (msgId, forAll) => socket.emit("chat:delete", { msgId, receiverId: adminId, deleteForAll: forAll });

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, fontFamily: T.font }}>

      {/* ── Chat window ── */}
      {open && (
        <div style={{
          position: "absolute", bottom: 64, right: 0,
          width: 320, height: 480,
          background: T.card, borderRadius: 16,
          border: `1px solid ${T.border}`, boxShadow: T.shadow,
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "slideUp .2s ease",
        }}>
          <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.accent, color: "#fff" }}>
            <Avatar name={adminName} size={34} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{adminName}</p>
              <p style={{ fontSize: 10, margin: 0, opacity: 0.85 }}>
                {isTyping ? "typing…" : "Admin"}
              </p>
            </div>
            <button onClick={() => setOpenState(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 6px", display: "flex", flexDirection: "column", gap: 2, background: T.bg }}>
            {loading ? (
              <p style={{ textAlign: "center", color: T.muted, fontSize: 12 }}>Loading…</p>
            ) : messages.length === 0 ? (
              <p style={{ textAlign: "center", color: T.muted, fontSize: 12, marginTop: 40 }}>Say hello 👋</p>
            ) : messages.map(msg => (
              <MiniBubble
                key={msg._id}
                msg={msg}
                isMine={(msg.senderId?._id || msg.senderId) === myId}
                onReact={handleReact}
                onDelete={handleDelete}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "8px 10px", background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", gap: 6, alignItems: "center" }}>
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 14 }}>
              📎
            </button>
            <input
              value={text}
              onChange={e => handleTyping(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Message admin…"
              style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, outline: "none", color: T.text, background: T.bg }}
            />
            <button onClick={send} disabled={!text.trim()}
              style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: text.trim() ? T.accent : T.border, color: "#fff", cursor: text.trim() ? "pointer" : "not-allowed", fontSize: 14 }}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ── Floating bubble button ── */}
      <button
        onClick={toggleOpen}
        style={{
          width: 52, height: 52, borderRadius: "50%",
          background: open ? T.text : T.accent,
          border: "none", color: "#fff", fontSize: 22,
          cursor: "pointer", boxShadow: T.shadow,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s ease", transform: open ? "scale(0.92)" : "scale(1)",
          position: "relative",
        }}
      >
        {open ? "✕" : "💬"}

        {/* Unread badge */}
        {!open && totalUnread > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            minWidth: 18, height: 18, borderRadius: 99,
            background: T.red, color: "#fff",
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", border: "2px solid #fff",
            animation: "pulse 1.5s infinite",
          }}>
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }`}</style>
    </div>
  );
}