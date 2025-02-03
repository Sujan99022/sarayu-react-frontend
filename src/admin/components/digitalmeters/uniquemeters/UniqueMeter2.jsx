import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const UniqueMeter2 = ({ topic, minValue = 0, maxValue = 100, unit = "" }) => {
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

  const fillHeight = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div
      style={{
        background: "#0f0f0f",
        padding: "1.5rem",
        borderRadius: "15px",
        width: "150px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "200px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: `${fillHeight}%`,
            background: "linear-gradient(to top, #2563eb, #3b82f6)",
            transition: "height 0.5s ease",
            borderTopLeftRadius: "30px",
            borderTopRightRadius: "30px",
            boxShadow: "inset 0 -10px 20px rgba(255,255,255,0.2)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-15px",
              width: "100%",
              height: "30px",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            }}
          />
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
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          fontSize: "1.2rem",
          opacity: 0.8,
        }}
      >
        🌊
      </div>
    </div>
  );
};

export default UniqueMeter2;
