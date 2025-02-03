import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const HumidityMeter = ({
  topic,
  minValue = 0,
  maxValue = 100,
  unit = "% RH",
  darkColor = false,
}) => {
  const [value, setValue] = useState(50);

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      const boundedValue = Math.min(
        Math.max(data?.message?.message?.message ?? 0, minValue),
        maxValue
      );
      setValue(boundedValue);
    });
    return () => socket.disconnect();
  }, [topic, minValue, maxValue]);

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "2rem",
        borderRadius: "20px",
        position: "relative",
        overflow: "hidden",
        width: "200px",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "200px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${value}%`,
            background: "linear-gradient(to top, #3b82f6, #60a5fa)",
            transition: "height 0.3s ease",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              transform: "translateY(30px)",
              opacity: 0.7,
            }}
          >
            💧
          </div>
        </div>
      </div>
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
  );
};

export default HumidityMeter;
