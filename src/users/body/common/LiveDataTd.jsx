// LiveDataTd.jsx
import React, { useEffect, useState, useMemo } from "react";
import "../../style.css";
import io from "socket.io-client";

// Track active subscriptions and socket instances
const socketCache = new Map();

const getCachedSocket = (topic) => {
  if (!socketCache.has(topic)) {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    socketCache.set(topic, {
      socket: newSocket,
      subscribers: 0,
      messageHandler: null,
    });
  }
  return socketCache.get(topic);
};

const LiveDataTd = ({ topic }) => {
  const [liveMessage, setLiveMessage] = useState();
  const isFFT = useMemo(() => topic.split("|")[1] === "fft", [topic]);

  useEffect(() => {
    if (isFFT) return;

    const topicEntry = getCachedSocket(topic);
    const { socket } = topicEntry;

    const handleMessage = (data) => {
      setLiveMessage(data?.message?.message?.message);
    };

    // First subscriber for this topic
    if (topicEntry.subscribers === 0) {
      socket.emit("subscribeToTopic", topic);
      socket.on("liveMessage", handleMessage);
    }

    topicEntry.subscribers++;
    topicEntry.messageHandler = handleMessage;

    return () => {
      topicEntry.subscribers--;

      // Last subscriber for this topic
      if (topicEntry.subscribers === 0) {
        socket.off("liveMessage", handleMessage);
        socket.emit("unsubscribeFromTopic", topic);
        socket.disconnect();
        socketCache.delete(topic);
      }
    };
  }, [topic, isFFT]);

  return isFFT ? <td>N/A</td> : <td>{liveMessage || "-"}</td>;
};

export default React.memo(LiveDataTd);
