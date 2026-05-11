// hooks/useChatSocket.js
// Place this hook in your root App.jsx or layout component

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "../services/socket";
import { fetchUnread } from "../features/chatSlice";
import {
  receiveMessage, incomingUnread, setOnlineUsers,
  setTyping, updateReactions, deleteMessage,
  addNotification,
} from "../features/chatSlice";

export default function useChatSocket(myUserId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!myUserId) return;

    // Set auth before connecting
    socket.auth = { userId: myUserId };

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Fetch unread counts on connect
    const handleConnect = () => {
      console.log("Socket connected, fetching unread...");
      dispatch(fetchUnread());
    };

    // Set auth on reconnect as well
    const handleReconnect = () => {
      console.log("Socket reconnected, updating auth and fetching unread...");
      socket.auth = { userId: myUserId };
      dispatch(fetchUnread());
    };

    socket.on("connect", handleConnect);
    socket.on("reconnect", handleReconnect);

    socket.on("chat:message",  (msg)  => dispatch(receiveMessage(msg)));
    socket.on("chat:unread",   (data) => {
      dispatch(incomingUnread(data));
      dispatch(addNotification({
        id: data.msgId || `${data.fromId}-${Date.now()}`,
        type: "message",
        title: data.senderName ? `Message from ${data.senderName}` : "New chat message",
        body: data.text || "You have a new message",
        fromId: data.fromId,
        time: data.createdAt || new Date().toISOString(),
        read: false,
      }));
    });
    socket.on("onlineUsers",   (list) => dispatch(setOnlineUsers(list)));
    socket.on("chat:typing",   (data) => dispatch(setTyping(data)));
    socket.on("chat:react",    (data) => dispatch(updateReactions(data)));
    socket.on("chat:deleted",  (data) => dispatch(deleteMessage(data)));

    return () => {
      socket.off("connect", handleConnect);
      socket.off("reconnect", handleReconnect);
      socket.off("chat:message");
      socket.off("chat:unread");
      socket.off("onlineUsers");
      socket.off("chat:typing");
      socket.off("chat:react");
      socket.off("chat:deleted");
    };
  }, [myUserId, dispatch]);
}