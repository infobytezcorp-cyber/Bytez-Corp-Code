import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistory, setActiveChat, clearUnread, markNotificationsFromUserRead } from "../../features/chatSlice";
import socket from "../../services/socket";

const T = {
  bg:         "#F5F7FA",
  card:       "#FFFFFF",
  border:     "#E8ECF0",
  borderSoft: "#F0F3F6",
  text:       "#111827",
  sub:        "#374151",
  muted:      "#9CA3AF",
  accent:     "#4F6EF7",
  accentSoft: "#EEF1FE",
  green:      "#10B981",
  greenSoft:  "#D1FAE5",
  amber:      "#F59E0B",
  amberSoft:  "#FEF3C7",
  red:        "#EF4444",
  redSoft:    "#FEE2E2",
  font:       "'Outfit', sans-serif",
  shadow:     "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
};

function timeStr(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)  return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

function Avatar({ name = "?", size = 36 }) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg,#4F6EF7,#818CF8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.36, fontWeight: 700, fontFamily: T.font,
    }}>
      {initials}
    </div>
  );
}

function MiniInput({ receiverId, onSent }) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    socket.emit("chat:send", { receiverId, text: text.trim() });
    setText("");
    onSent?.();
  };
  return (
    <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderTop: `1px solid ${T.border}`, background: T.card }}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") send(); }}
        placeholder="Reply…"
        style={{
          flex: 1, padding: "7px 11px", borderRadius: 8,
          border: `1px solid ${T.border}`, fontSize: 12,
          fontFamily: T.font, outline: "none", background: T.bg, color: T.text,
        }}
      />
      <button
        onClick={send}
        disabled={!text.trim()}
        style={{
          width: 32, height: 32, borderRadius: 8, border: "none",
          background: text.trim() ? T.accent : T.border,
          color: "#fff", cursor: text.trim() ? "pointer" : "default",
          fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >➤</button>
    </div>
  );
}

function ChatThread({ agent, messages, unreadCount, isOnline, isTyping, myId, onOpen }) {
  const lastMsg = messages?.at(-1);
  const isUnread = unreadCount > 0;

  return (
    <div
      onClick={() => onOpen(agent)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", cursor: "pointer",
        borderBottom: `1px solid ${T.borderSoft}`,
        transition: "background .15s",
        background: isUnread ? T.accentSoft : T.card,
      }}
      onMouseEnter={e => e.currentTarget.style.background = T.bg}
      onMouseLeave={e => e.currentTarget.style.background = isUnread ? T.accentSoft : T.card}
    >
      <div style={{ position: "relative" }}>
        <Avatar name={agent.name} size={38} />
        <span style={{
          position: "absolute", bottom: 1, right: 1,
          width: 10, height: 10, borderRadius: "50%",
          background: isOnline ? T.green : T.muted,
          border: "2px solid #fff",
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, fontWeight: isUnread ? 700 : 600, color: T.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent.name}
          </p>
          <span style={{ fontSize: 10, color: T.muted, flexShrink: 0, marginLeft: 6 }}>
            {lastMsg ? timeStr(lastMsg.createdAt) : ""}
          </span>
        </div>
        <p style={{ fontSize: 11, color: isTyping ? T.accent : T.muted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {isTyping
            ? "typing…"
            : lastMsg
              ? ((lastMsg.senderId?._id || lastMsg.senderId) === myId ? "You: " : "") + (lastMsg.text || (lastMsg.fileUrl ? "📎 File" : ""))
              : "No messages yet"}
        </p>
      </div>
      {isUnread && (
        <span style={{
          minWidth: 18, height: 18, borderRadius: 99,
          background: T.accent, color: "#fff",
          fontSize: 10, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 5px", flexShrink: 0,
        }}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}

function NotifItem({ notif, onRead }) {
  const icons = {
    missed_call: { icon: "📵", bg: T.redSoft,   color: T.red   },
    break_alert: { icon: "⚠️", bg: T.amberSoft, color: T.amber },
    agent_login: { icon: "✅", bg: T.greenSoft,  color: T.green },
    message:     { icon: "💬", bg: T.accentSoft, color: T.accent },
    system:      { icon: "🔔", bg: T.bg,         color: T.muted },
  };
  const s = icons[notif.type] || icons.system;

  return (
    <div
      onClick={() => onRead(notif.id)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "11px 14px", cursor: "pointer",
        borderBottom: `1px solid ${T.borderSoft}`,
        background: notif.read ? T.card : T.accentSoft,
        transition: "background .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = T.bg}
      onMouseLeave={e => e.currentTarget.style.background = notif.read ? T.card : T.accentSoft}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: s.bg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 16,
      }}>
        {s.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: notif.read ? 500 : 700, color: T.text, margin: "0 0 2px", lineHeight: 1.4 }}>
          {notif.title}
        </p>
        <p style={{ fontSize: 11, color: T.muted, margin: 0, lineHeight: 1.4 }}>{notif.body}</p>
      </div>
      <span style={{ fontSize: 10, color: T.muted, flexShrink: 0, marginTop: 1 }}>{timeStr(notif.time)}</span>
    </div>
  );
}

export default function NotificationChatDropdown({ myId, agents = [], notifications = [], onMarkNotifRead, onOpenFullChat }) {
  const dispatch = useDispatch();
  const { conversations, unread, onlineUsers, typing } = useSelector(s => s.chat);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");
  const [openThread, setOpenThread] = useState(null);

  const dropRef = useRef(null);

  const totalChatUnread = Object.values(unread).reduce((s, n) => s + n, 0);
  const unreadNotifs    = notifications.filter(n => !n.read).length;
  const totalBadge      = totalChatUnread + unreadNotifs;

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
        setOpenThread(null);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const openChat = (agent) => {
    dispatch(setActiveChat(agent._id));
    dispatch(fetchHistory({ userId: agent._id }));
    dispatch(clearUnread(agent._id));
    dispatch(markNotificationsFromUserRead(agent._id));
    socket.emit("chat:read", { senderId: agent._id });
    setOpenThread(agent);
  };

  const handleOpenFull = () => {
    setOpen(false);
    setOpenThread(null);
    onOpenFullChat?.();
  };

  const handleMarkRead = (id) => {
    onMarkNotifRead?.(id);
  };

  const handleMarkAll = () => {
    onMarkNotifRead?.("all");
  };

  return (
    <div ref={dropRef} style={{ position: "relative", fontFamily: T.font }}>
      <button
        onClick={() => { setOpen(v => !v); setOpenThread(null); setActiveTab("notifications"); }}
        style={{
          position: "relative",
          width: 36, height: 36, borderRadius: 10,
          border: `1px solid ${T.border}`,
          background: open ? T.accentSoft : T.card,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all .15s",
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={open ? T.accent : T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {totalBadge > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 16, height: 16, borderRadius: 99,
            background: T.red, color: "#fff",
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px", border: "2px solid #fff",
          }}>
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 360, maxHeight: 520,
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, boxShadow: T.shadow,
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "dropIn .18s ease",
          zIndex: 100,
        }}>
          <style>{`
            @keyframes dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
          `}</style>

          {openThread ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: `1px solid ${T.border}`, background: T.card }}>
                <button
                  onClick={() => setOpenThread(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.muted, padding: 0, lineHeight: 1 }}
                >←</button>
                <Avatar name={openThread.name} size={30} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{openThread.name}</p>
                  <p style={{ fontSize: 10, color: onlineUsers.includes(openThread._id) ? T.green : T.muted, margin: 0 }}>
                    {typing[openThread._id] ? "typing…" : onlineUsers.includes(openThread._id) ? "Online" : "Offline"}
                  </p>
                </div>
                <button
                  onClick={handleOpenFull}
                  style={{ fontSize: 10, fontWeight: 600, color: T.accent, background: T.accentSoft, border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontFamily: T.font }}
                >
                  Open full ↗
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4, background: T.bg, maxHeight: 320 }}>
                {(conversations[openThread._id] || []).length === 0 ? (
                  <p style={{ textAlign: "center", color: T.muted, fontSize: 12, marginTop: 40 }}>No messages yet. Say hi 👋</p>
                ) : (conversations[openThread._id] || []).map(msg => {
                  const isMine = (msg.senderId?._id || msg.senderId) === myId;
                  return (
                    <div key={msg._id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: 220, padding: "7px 11px",
                        background: isMine ? T.accent : T.card,
                        color: isMine ? "#fff" : T.text,
                        borderRadius: isMine ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                        border: isMine ? "none" : `1px solid ${T.border}`,
                        fontSize: 12, lineHeight: 1.5, wordBreak: "break-word",
                      }}>
                        {msg.fileUrl && <p style={{ fontSize: 11, margin: "0 0 3px" }}>📎 {msg.fileName}</p>}
                        {msg.text}
                        <span style={{ display: "block", textAlign: "right", fontSize: 9, opacity: 0.6, marginTop: 2 }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {isMine && <span style={{ marginLeft: 3 }}>{msg.read ? " ✓✓" : " ✓"}</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <MiniInput receiverId={openThread._id} onSent={() => {}} />
            </>
          ) : (
            <>
              <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.card }}>
                {[
                  { id: "notifications", label: "Notifications", badge: unreadNotifs },
                  { id: "chat",          label: "Messages",      badge: totalChatUnread },
                ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1, padding: "11px 0", border: "none", background: "transparent",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        color: isActive ? T.accent : T.muted, fontFamily: T.font,
                        borderBottom: isActive ? `2px solid ${T.accent}` : "2px solid transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all .15s",
                      }}
                    >
                      {tab.label}
                      {tab.badge > 0 && (
                        <span style={{
                          minWidth: 16, height: 16, borderRadius: 99,
                          background: isActive ? T.accent : T.red,
                          color: "#fff", fontSize: 9, fontWeight: 700,
                          display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
                        }}>
                          {tab.badge > 9 ? "9+" : tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {activeTab === "notifications" && (
                <div style={{ overflowY: "auto", maxHeight: 400 }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "48px 20px", textAlign: "center" }}>
                      <p style={{ fontSize: 28, marginBottom: 8 }}>🔔</p>
                      <p style={{ fontSize: 12, color: T.muted }}>No notifications yet</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map(n => (
                        <NotifItem key={n.id} notif={n} onRead={handleMarkRead} />
                      ))}
                      <div style={{ padding: "10px 14px", textAlign: "center" }}>
                        <button
                          onClick={handleMarkAll}
                          style={{ fontSize: 11, fontWeight: 600, color: T.accent, background: "none", border: "none", cursor: "pointer", fontFamily: T.font }}
                        >
                          Mark all as read
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "chat" && (
                <div style={{ overflowY: "auto", maxHeight: 400 }}>
                  {agents.length === 0 ? (
                    <div style={{ padding: "48px 20px", textAlign: "center" }}>
                      <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
                      <p style={{ fontSize: 12, color: T.muted }}>No agents to chat with</p>
                    </div>
                  ) : (
                    <>
                      {agents.map(agent => (
                        <ChatThread
                          key={agent._id}
                          agent={agent}
                          messages={conversations[agent._id] || []}
                          unreadCount={unread[agent._id] || 0}
                          isOnline={onlineUsers.includes(agent._id)}
                          isTyping={!!typing[agent._id]}
                          myId={myId}
                          onOpen={openChat}
                        />
                      ))}
                      <div style={{ padding: "10px 14px", textAlign: "center" }}>
                        <button
                          onClick={handleOpenFull}
                          style={{ fontSize: 11, fontWeight: 600, color: T.accent, background: "none", border: "none", cursor: "pointer", fontFamily: T.font }}
                        >
                          Open full chat panel ↗
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
