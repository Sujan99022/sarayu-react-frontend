// LiveDataTd.jsx
import React, { useEffect, useState, useMemo } from "react";
import "../../style.css";
import io from "socket.io-client";

// Track active subscriptions and socket instances
const socketCache = new Map();

const getCachedSocket = (topic) => {
  if (!socketCache.has(topic)) {
    const newSocket = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });
    // const newSocket = io("http://65.1.185.30", {
    //   path: "/socket.io/",  
    //   transports: ["websocket", "polling"],
    //   autoConnect: true,
    //   reconnection: true,
    //   reconnectionAttempts: 5,
    //   reconnectionDelay: 5000,
    // });

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

  return isFFT ? <td style={{fontWeight:"bolder"}}>N/A</td> : <td style={{fontWeight:"bolder",background:"#34495e",color:"rgb(255, 255, 255)"}}>{liveMessage || "-"}</td>;
};

export default React.memo(LiveDataTd);
