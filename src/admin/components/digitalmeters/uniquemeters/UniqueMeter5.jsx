import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const UniqueMeter5 = ({ topic, minValue = 0, maxValue = 100, unit = "" }) => {
  const [value, setValue] = useState(minValue);

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      setValue(
        Math.min(Math.max(data.message.message.message, minValue), maxValue)
      );
    });
    return () => socket.disconnect();
  }, [topic]);

  return (
    <div
      style={{
        background: "#000",
        padding: "2rem",
        borderRadius: "10px",
        border: "2px solid #4f46e5",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(79,70,229,0.3)",
      }}
    >
      <div
        style={{
          color: "#4f46e5",
          fontSize: "3rem",
          fontFamily: "'Segment7', monospace",
          textAlign: "center",
          textShadow: "0 0 10px #4f46e5",
        }}
      >
        {value.toFixed(0).padStart(3, "0")}
        <span style={{ fontSize: "1.5rem", marginLeft: "5px" }}>{unit}</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(transparent 50%, rgba(79,70,229,0.05) 50%)",
          backgroundSize: "100% 4px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "1.5rem",
          opacity: 0.5,
        }}
      >
        🔵
      </div>
    </div>
  );
};

export default UniqueMeter5;
