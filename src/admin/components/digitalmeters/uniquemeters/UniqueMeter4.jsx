import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const UniqueMeter4 = ({ topic, minValue = 0, maxValue = 100, unit = "" }) => {
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

  const rotation = (value / maxValue) * 45;

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "2rem",
        borderRadius: "15px",
        perspective: "1000px",
      }}
    >
      <div
        style={{
          transform: `rotateX(${rotation}deg) rotateY(${rotation}deg)`,
          transformStyle: "preserve-3d",
          width: "150px",
          height: "150px",
          transition: "transform 0.5s ease",
          position: "relative",
        }}
      >
        {/* Cube faces */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: `rgba(59, 130, 246, ${0.2 + i * 0.1})`,
              border: "2px solid #3b82f6",
              transform: [
                "translateZ(75px)",
                "rotateY(90deg) translateZ(75px)",
                "rotateY(180deg) translateZ(75px)",
                "rotateY(-90deg) translateZ(75px)",
                "rotateX(90deg) translateZ(75px)",
                "rotateX(-90deg) translateZ(75px)",
              ][i],
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
            fontSize: "1.5rem",
            fontWeight: "bold",
            zIndex: 2,
          }}
        >
          {value.toFixed(0)}
          {unit}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          fontSize: "1.5rem",
        }}
      >
        🧊
      </div>
    </div>
  );
};

export default UniqueMeter4;
