import React, { useEffect, useState } from "react";
import Gauge from "react-canvas-gauge";
import io from "socket.io-client";
import "../../../style.css";

const DigitalViewOne = ({ topic }) => {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [minSpeed] = useState(0);
  const [maxSpeed] = useState(100);

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      setCurrentSpeed(data?.message?.message?.message);
    });
    socket.on("noData", (data) => {
      console.warn(data.message);
    });

    socket.on("error", (data) => {
      console.error(data.message);
    });

    return () => {
      socket.emit("unsubscribeFromTopic");
      socket.disconnect();
    };
  }, [topic]);

  return (
    <div
      style={{ display: "flex", flexWrap: "nowrap", flexDirection: "column" }}
    >
      <span className="text-center">{topic?.split("/")[2]}</span>
      <Gauge
        value={currentSpeed}
        minValue={minSpeed}
        maxValue={maxSpeed}
        width={300}
        height={300}
        title={"V"}
        colors={{
          plate: "#fff",
          majorTicks: ["0", "20", "40", "60", "80", "100"],
          highlights: [
            { from: 50, to: 100, color: "#5BE12C" },
            { from: 0, to: 50, color: "#EA4228" },
          ],
        }}
      />
    </div>
  );
};

export default DigitalViewOne;
