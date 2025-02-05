import React, { useEffect, useState } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import io from "socket.io-client";
import "react-circular-progressbar/dist/styles.css";

const UniqueMeter8 = ({ topic, minValue = -20, maxValue = 100 }) => {
  const [value, setValue] = useState(20);

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
        width: 220,
        padding: 20,
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <CircularProgressbarWithChildren
        value={value}
        minValue={minValue}
        maxValue={maxValue}
        styles={buildStyles({
          pathColor: `rgb(${Math.floor((value / maxValue) * 255)}, ${Math.floor(
            255 - (value / maxValue) * 255
          )}, 0)`,
          trailColor: "#f0f0f0",
          pathTransitionDuration: 0.5,
        })}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#2d3748" }}>
            {value.toFixed(1)}°C
          </div>
          <div style={{ fontSize: 14, color: "#718096" }}>Temperature</div>
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
};

export default UniqueMeter8;
