import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const VibrationMeter = ({
  topic,
  minValue = -50,
  maxValue = 50,
  unit = "Hz",
}) => {
  const [value, setValue] = useState(0);

  // Calculate the rotation angle for the needle based on the current value
  const calculateNeedleRotation = () => {
    const range = maxValue - minValue;
    const normalizedValue = value - minValue; // Normalize value to start from 0
    const angle = (normalizedValue / range) * 180; // Map to 0 (min) to 180 (max)
    return Math.max(0, Math.min(180, angle)); // Clamp between 0 and 180
  };

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      const newValue = Math.min(
        Math.max(data.message.message.message, minValue),
        maxValue
      );
      setValue(newValue);
    });
    return () => socket.disconnect();
  }, [topic, minValue, maxValue]);

  return (
    <div
      style={{
        background: "#2d2d2d",
        padding: "2rem",
        borderRadius: "15px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        width: "100%",
        maxWidth: "350px",
        margin: "auto",
        textAlign: "center",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#fff",
      }}
    >
      {/* Title */}
      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        VIBRATION METER
      </h3>

      {/* Meter Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1/1",
          backgroundColor: "#333",
          borderRadius: "50%",
          border: "5px solid #444",
          overflow: "hidden",
        }}
      >
        {/* Background Arc */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <path
            d="M 50 50 m -45 0 a 45 45 0 1 1 90 0 a 45 45 0 1 1 -90 0"
            fill="none"
            stroke="#ffffff30"
            strokeWidth="10"
          />
        </svg>

        {/* Needle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "45%",
            height: "4px",
            backgroundColor: "#ff4d4d",
            transformOrigin: "left center",
            transform: `rotate(${calculateNeedleRotation() - 90}deg)`, // Offset by -90 to align with SVG arc
          }}
        ></div>

        {/* Center Dot */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "12px",
            height: "12px",
            backgroundColor: "#ff4d4d",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      </div>

      {/* Value Display */}
      <div
        style={{
          marginTop: "1rem",
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        {`${value.toFixed(1)} ${unit}`}
      </div>
    </div>
  );
};

export default VibrationMeter;