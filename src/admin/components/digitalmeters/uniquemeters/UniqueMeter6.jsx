import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const UniqueMeter6 = ({ topic, minValue = 0, maxValue = 100, unit = "" }) => {
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

  const waveHeight = (value / maxValue) * 100;

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "2rem",
        borderRadius: "15px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "150px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "-10%",
            right: "-10%",
            height: `${waveHeight}%`,
            background: "#10b981",
            borderRadius: "50%",
            animation: "wave 3s infinite linear",
            opacity: 0.8,
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
            mixBlendMode: "difference",
          }}
        >
          {value.toFixed(0)}
          {unit}
        </div>
      </div>
      <style>{`
          @keyframes wave {
            0% { transform: translateX(0) rotate(0deg); }
            50% { transform: translateX(-20%) rotate(2deg); }
            100% { transform: translateX(0) rotate(0deg); }
          }
        `}</style>
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          fontSize: "1.5rem",
        }}
      >
        🌊
      </div>
    </div>
  );
};

export default UniqueMeter6;
