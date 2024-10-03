import React, { useEffect, useState } from "react";
import apiClient from "../../../api/apiClient";
import "./style.css";

const Speedometer = ({ user }) => {
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGraphData();
    }, 2000);
    return () => clearInterval(intervalId);
  }, [user.email]);

  const fetchGraphData = async () => {
    try {
      const res = await apiClient.get(`/mqtt/messages?email=${user.email}`);
      let floatRes = parseFloat(res.data.message.message);

      setGraphData((prevGraphData) => {
        const updatedData = [...prevGraphData, floatRes];
        if (updatedData.length > 100) {
          updatedData.shift();
        }
        return updatedData;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const currentSpeed =
    graphData.length > 0 ? graphData[graphData.length - 1] : 0;

  // Calculate angle for current speed (0-1000 mapped to 0-180 degrees)
  const getArrowClass = () => {
    const angle = (currentSpeed / 1000) * 180; // Mapping speed to 180 degrees
    return `arrow-wrapper speed-${Math.round(angle)}`;
  };

  const getScaleClass = (scale) => {
    // Scale represents increments of 50 (0-1000 over 20 steps)
    const isActive = currentSpeed >= scale * 50; // Highlight active scales based on speed
    return `speedometer-scale speedometer-scale-${scale} ${
      isActive ? "active" : ""
    }`;
  };

  console.log(graphData);

  return (
    <div className="speedometer-container">
      <div className="speedometer-text">
        <div className="static">Value</div>
        <div className="dynamic">
          <span className="km">{currentSpeed}</span>
          <span className="unit"></span>
        </div>
      </div>
      <div className="center-point"></div>
      <div className="speedometer-center-hide"></div>
      <div className="speedometer-bottom-hide"></div>
      <div className="arrow-container">
        <div className={getArrowClass()}>
          <div className="arrow"></div>
        </div>
      </div>
      {[...Array(20)].map((_, i) => (
        <div key={i} className={getScaleClass(i)}></div>
      ))}
    </div>
  );
};

export default Speedometer;
