import React, { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import io from "socket.io-client";
import "./style.css";

const VoltageMeter = ({ topic }) => {
  const [value, setValue] = useState(120);
  const meterConfig = {
    minValue: 0,
    maxValue: 240,
    unit: "V",
    colors: ["#e74c3c", "#f1c40f", "#2ecc71"],
    subArcs: [{ limit: 100 }, { limit: 200 }, { limit: 240 }],
  };

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.on(topic, (message) => setValue(message.value));
    return () => socket.disconnect();
  }, []);

  return (
    <div className="meter-container">
      <div style={{ width: "500px", height: "350px" }}>
        <GaugeComponent
          type="semicircle"
          arc={{
            width: 0.25,
            padding: 0.005,
            colorArray: meterConfig.colors,
            subArcs: meterConfig.subArcs,
            gradient: true,
          }}
          labels={{
            valueLabel: {
              formatTextValue: (v) => `${v.toFixed(0)} ${meterConfig.unit}`,
              style: { fontSize: 35, fill: "#2c3e50" },
            },
            tickLabels: {
              ticks: [0, 60, 120, 180, 240],
              defaultTickValueConfig: {
                style: { fontSize: 14, fill: "#2c3e50" },
              },
            },
          }}
          value={value}
          minValue={meterConfig.minValue}
          maxValue={meterConfig.maxValue}
          pointer={{
            type: "blob",
            color: "#3498db",
            baseColor: "#2980b9",
            width: 20,
            elastic: true,
          }}
        />
      </div>
    </div>
  );
};

export default VoltageMeter;
