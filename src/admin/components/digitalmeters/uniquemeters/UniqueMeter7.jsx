import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const UniqueMeter7 = ({ topic, minValue = 0, maxValue = 100, unit = "" }) => {
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

  const blurAmount = (value / maxValue) * 20;

  return (
    <div
      style={{
        background: "radial-gradient(circle at center, #3b0764, #1e293b)",
        padding: "2rem",
        borderRadius: "50%",
        width: "250px",
        height: "250px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          background:
            "radial-gradient(circle at center, rgba(91, 33, 182, 0.5), transparent)",
          filter: `blur(${blurAmount}px)`,
          transition: "filter 0.3s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#fff",
          fontSize: "2rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {value.toFixed(0)}
        {unit}
        <div style={{ fontSize: "1.5rem", marginTop: "10px" }}>🌀</div>
      </div>
    </div>
  );
};

export default UniqueMeter7;
