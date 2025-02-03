import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const UniqueMeter11 = ({ topic, minValue = 0, maxValue = 100 }) => {
  const [value, setValue] = useState(50);

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      const rawValue = data?.message?.message?.message ?? 0;
      setValue(Math.min(Math.max(rawValue, minValue), maxValue));
    });
    return () => socket.disconnect();
  }, [topic]);

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div
      style={{
        width: 200,
        height: 300,
        background: "#ffffff",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "#f0f4f8",
          borderRadius: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${percentage}%`,
            background: "linear-gradient(#4299e1, #3182ce)",
            transition: "height 0.3s ease",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#2d3748",
            fontSize: 24,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {value.toFixed(0)}%<div style={{ fontSize: 14 }}>HUMIDITY</div>
        </div>
      </div>
    </div>
  );
};

export default UniqueMeter11;
