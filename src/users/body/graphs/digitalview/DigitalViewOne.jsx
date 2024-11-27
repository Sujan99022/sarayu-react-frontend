import React, { useEffect, useState } from "react";
import Gauge from "react-canvas-gauge";
import apiClient from "../../../../api/apiClient";
import "../../../style.css";

const DigitalViewOne = ({ topic }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [minSpeed] = useState(0);
  const [maxSpeed] = useState(100);
  const encodedTopic = encodeURIComponent(topic);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionApi = async () => {
      try {
        const res = await apiClient.get(
          `/mqtt/is-subscribed?topic=${encodedTopic}`
        );
        setSubscribed(res?.data?.isSubscribed);
      } catch (error) {
        console.error("Error fetching subscription status:", error.message);
      }
    };

    fetchSubscriptionApi();
  }, [topic]);

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const response = await apiClient.post("/mqtt/messages", { topic });
        const newSpeed = parseFloat(response?.data?.message?.message || 0);
        setCurrentSpeed(newSpeed);
      } catch (error) {
        console.error("Error fetching real-time data:", error.message);
      }
    };

    if (subscribed) {
      const interval = setInterval(fetchRealTimeData, 1000);
      return () => clearInterval(interval);
    }
  }, [subscribed]);

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
