import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const PressureMeter = ({
  topic,
  minValue = 0,
  maxValue = 100,
  unit = "PSI",
}) => {
  const [value, setValue] = useState(50);

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.on(topic, (data) => {
      setValue(Math.min(Math.max(data.value, minValue), maxValue));
    });
    return () => socket.disconnect();
  }, [topic]);

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "1.5rem",
        borderRadius: "15px",
        width: "120px",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "200px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "10px",
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
            background: "linear-gradient(#3b82f6, #60a5fa)",
            transition: "height 0.3s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
            fontSize: "1.5rem",
            fontWeight: "bold",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          {value.toFixed(0)}
          {unit}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "-30px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          fontSize: "1rem",
          whiteSpace: "nowrap",
        }}
      >
        ⚡ LIVE PRESSURE
      </div>
    </div>
  );
};

export default PressureMeter;
