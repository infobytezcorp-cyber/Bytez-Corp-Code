// socket/chatSocket.js
// ── Add this to your existing socket.js / server.js ──────────────────────
// Usage: require('./socket/chatSocket')(io)
import Message from "../models/Message.js";
// In-memory map: userId (string) → Set of socket IDs
const onlineUsers = new Map();

export default function registerChatSocket(io) {

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    // ── Track online users ──────────────────────────────────────────────
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Send current online users list to the newly connected client
    socket.emit("onlineUsers", [...onlineUsers.keys()]);

    // Broadcast updated online list to everyone (in case of multiple tabs)
    io.emit("onlineUsers", [...onlineUsers.keys()]);

    // ── Join personal room ──────────────────────────────────────────────
    socket.join(`user:${userId}`);

    // ── SEND MESSAGE ────────────────────────────────────────────────────
    socket.on("chat:send", async (data, ack) => {
      try {
        const { receiverId, text, fileUrl, fileName, fileType } = data;

        const msg = await Message.create({
          senderId:   userId,
          receiverId,
          text:       text || "",
          fileUrl:    fileUrl  || null,
          fileName:   fileName || null,
          fileType:   fileType || null,
        });

        const populated = await msg.populate("senderId", "name avatar");

        // Emit to receiver's room
        io.to(`user:${receiverId}`).emit("chat:message", populated);

        // Emit back to sender (confirmation + other tabs)
        io.to(`user:${userId}`).emit("chat:message", populated);

        // Unread badge increment for receiver
        io.to(`user:${receiverId}`).emit("chat:unread", {
          fromId: userId,
          msgId:  msg._id,
          senderName: populated.senderId?.name || "Unknown",
          text: msg.text || (msg.fileName ? `Sent ${msg.fileName}` : "New message"),
          createdAt: msg.createdAt,
        });

        if (ack) ack({ success: true, message: populated });
      } catch (err) {
        console.error("chat:send error", err);
        if (ack) ack({ success: false, error: err.message });
      }
    });

    // ── TYPING INDICATOR ────────────────────────────────────────────────
    socket.on("chat:typing", ({ receiverId, isTyping }) => {
      socket.to(`user:${receiverId}`).emit("chat:typing", {
        senderId: userId,
        isTyping,
      });
    });

    // ── MARK AS READ ────────────────────────────────────────────────────
    socket.on("chat:read", async ({ senderId: fromId }) => {
      try {
        await Message.updateMany(
          { senderId: fromId, receiverId: userId, read: false },
          { $set: { read: true } }
        );
        // Notify sender that messages were read (double-tick)
        io.to(`user:${fromId}`).emit("chat:read", { byUserId: userId });
      } catch (err) {
        console.error("chat:read error", err);
      }
    });

    // ── REACT TO MESSAGE ────────────────────────────────────────────────
    socket.on("chat:react", async ({ msgId, emoji, receiverId }) => {
      try {
        const msg = await Message.findById(msgId);
        if (!msg) return;

        const existing = msg.reactions.find(
          r => r.userId.toString() === userId
        );
        if (existing) {
          // Toggle off if same emoji
          if (existing.emoji === emoji) {
            msg.reactions = msg.reactions.filter(
              r => r.userId.toString() !== userId
            );
          } else {
            existing.emoji = emoji;
          }
        } else {
          msg.reactions.push({ userId, emoji });
        }
        await msg.save();

        const payload = { msgId, reactions: msg.reactions };
        io.to(`user:${receiverId}`).emit("chat:react", payload);
        io.to(`user:${userId}`).emit("chat:react", payload);
      } catch (err) {
        console.error("chat:react error", err);
      }
    });

    // ── DELETE MESSAGE ──────────────────────────────────────────────────
    socket.on("chat:delete", async ({ msgId, receiverId, deleteForAll }) => {
      try {
        const msg = await Message.findById(msgId);
        if (!msg) return;

        const isSender  = msg.senderId.toString() === userId;
        const withinTime = Date.now() - new Date(msg.createdAt).getTime() < 5 * 60 * 1000;

        if (deleteForAll && isSender && withinTime) {
          await msg.deleteOne();
          io.to(`user:${receiverId}`).emit("chat:deleted", { msgId, forAll: true });
          io.to(`user:${userId}`).emit("chat:deleted",    { msgId, forAll: true });
        } else {
          await Message.findByIdAndUpdate(msgId, {
            $addToSet: { deletedFor: userId },
          });
          socket.emit("chat:deleted", { msgId, forAll: false });
        }
      } catch (err) {
        console.error("chat:delete error", err);
      }
    });

    // ── DISCONNECT ──────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) onlineUsers.delete(userId);
      }
      io.emit("onlineUsers", [...onlineUsers.keys()]);
    });
  });
};