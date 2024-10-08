import React, { useEffect, useState } from "react";
import apiClient from "../../../api/apiClient";
import GaugeComponent from "react-gauge-component";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { updateSpeed } from "../../../redux/slices/DigitalMeterSlice";

const Speedometer = ({ user }) => {
  const { currentSpeed } = useSelector((state) => state.digitalMeterSlice);
  const dispatch = useDispatch();
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGraphData();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [user.email]);

  const fetchGraphData = async () => {
    try {
      const res = await apiClient.get(`/mqtt/messages?email=${user.email}`);
      let floatRes = parseFloat(res.data.message.message);
      dispatch(updateSpeed(floatRes));
    } catch (error) {
      console.error(error);
    }
  };

  // Define the min and max values for the gauge
  const minSpeed = 0;
  const maxSpeed = 110; // Adjust if the range of the values is not between 0 and 100

  return (
    <div className="speedometer-container">
      <div className="speedometer-text">
        <div className="static">Current Value</div>
        <div className="dynamic">
          <span
            className={`km ${
              currentSpeed > 50 ? "gauge_text_red" : "gauge_text_green"
            }`}
          >
            {currentSpeed.toFixed(2)}
          </span>
          <span className="unit"> unit</span>
        </div>
      </div>

      {/* GaugeComponent with custom height and width */}
      <GaugeComponent
        value={currentSpeed}
        minValue={minSpeed}
        maxValue={maxSpeed}
        type="radial"
        width={300}
        height={300}
        labels={{
          tickLabels: {
            type: "inner",
            ticks: [
              { value: 20 },
              { value: 30 },
              { value: 40 },
              { value: 50 },
              { value: maxSpeed },
            ],
          },
        }}
        arc={{
          colorArray: ["#5BE12C", "#EA4228"],
          subArcs: [
            { limit: 20 },
            { limit: 30 },
            { limit: 40 },
            { limit: 50 },
            { limit: maxSpeed },
          ],
          padding: 0.02,
          width: 0.3,
        }}
        pointer={{
          elastic: true,
          animationDelay: 0,
        }}
      />
    </div>
  );
};

export default Speedometer;
