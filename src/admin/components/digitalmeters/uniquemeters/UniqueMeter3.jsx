import { useEffect, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { io } from "socket.io-client";

const UniqueMeter3 = ({ topic, minValue = 0, maxValue = 100, unit = "" }) => {
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

  const data = [{ subject: "Value", A: value, fullMark: maxValue }];

  return (
    <div
      style={{
        background: "radial-gradient(circle at center, #1e3a8a, #0f172a)",
        padding: "2rem",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <RadarChart outerRadius={90} width={300} height={300} data={data}>
        <PolarGrid gridType="circle" />
        <PolarAngleAxis dataKey="subject" />
        <Radar
          name="Value"
          dataKey="A"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.4}
        />
      </RadarChart>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#fff",
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {value.toFixed(0)}
        {unit}
        <div style={{ fontSize: "1rem", marginTop: "5px" }}>📡</div>
      </div>
    </div>
  );
};

export default UniqueMeter3;
