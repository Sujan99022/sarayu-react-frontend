import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const UniqueMeter10 = ({ topic, minValue = 0, maxValue = 240 }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      const rawValue = data?.message?.message?.message ?? 0;
      setValue(Math.min(Math.max(rawValue, minValue), maxValue));
    });
    return () => socket.disconnect();
  }, [topic]);

  return (
    <div
      style={{
        background: "#1a202c",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 32,
          color: "#48bb78",
          textAlign: "center",
          padding: "16px 24px",
          background: "#2d3748",
          borderRadius: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {value.toFixed(1)} V
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(transparent 50%, rgba(0,0,0,0.1) 50%)",
            backgroundSize: "100% 4px",
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        style={{
          color: "#cbd5e0",
          fontSize: 14,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        VOLTAGE METER
      </div>
    </div>
  );
};

export default UniqueMeter10;
