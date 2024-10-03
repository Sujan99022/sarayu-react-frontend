import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import apiClient from "../../../api/apiClient"; // Ensure you have your API client set up
import { getTime, parseISO } from "date-fns"; // Assuming you're using date-fns for timestamp parsing

const RealtimeChart = ({ user }) => {
  const chartContainerRef = useRef(null);
  const seriesRef = useRef(null);
  const [userData, setUserData] = useState([]); // State to hold user data as an array

  useEffect(() => {
    const chartOptions = {
      layout: {
        textColor: "white",
        background: { type: "solid", color: "black" },
      },
      grid: {
        vertLines: {
          color: "rgba(255, 255, 255, 0.2)",
        },
        horzLines: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
      height: window.innerHeight * 0.7, // Set height to 70% of the viewport height
      crossHairMarker: {
        visible: true,
      },
      timeScale: {
        timeVisible: true, // Ensures timestamps are visible
        secondsVisible: true, // Shows seconds on the x-axis if needed
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    seriesRef.current = chart.addLineSeries({
      color: "green",
      lineWidth: 2,
      crossHairMarkerVisible: true,
    });

    // Create a shadow effect using area series
    const areaSeries = chart.addAreaSeries({
      topColor: "rgba(0, 128, 0, 0.3)",
      bottomColor: "rgba(0, 128, 0, 0)",
      lineColor: "transparent",
    });

    const intervalId = setInterval(() => {
      fetchGraphData(chart, areaSeries);
    }, 1000);

    return () => {
      clearInterval(intervalId);
      chart.remove();
    };
  }, [user.email]); // Add user.email to the dependency array to fetch new data when email changes

  const fetchGraphData = async (chart, areaSeries) => {
    try {
      const res = await apiClient.get(`/mqtt/messages?email=${user.email}`);
      const timestamp = getTime(parseISO(res.data.message.timestamp)) / 1000; // Ensure timestamp is in seconds

      // Debugging output
      console.log("Fetched Data:", res.data);

      setUserData((prevData) => {
        // Create a new data point
        const newDataPoint = {
          value: parseFloat(res.data.message.message),
          time: Math.floor(timestamp), // Ensure time is correctly set
        };

        // Avoid duplicate timestamps
        const updatedData = prevData.filter(
          (dataPoint) => dataPoint.time !== newDataPoint.time
        );

        // Add the new data point
        updatedData.push(newDataPoint);

        // Keep only the last 100 values
        if (updatedData.length > 100) {
          updatedData.shift();
        }

        // Sort the data by time
        updatedData.sort((a, b) => a.time - b.time);

        // Debugging output
        console.log("Updated Data:", updatedData);

        // Update the chart with the new data
        seriesRef.current.setData(updatedData);
        areaSeries.setData(updatedData);

        return updatedData; // Store updated data in state
      });
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  const handleScrollToRealTime = () => {
    if (seriesRef.current) {
      seriesRef.current.chart.timeScale().scrollToRealTime();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row", // Change direction to row
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          width: "50px", // Width for the left axis
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Simulate y-axis labels here if needed */}
        <span>Y-Axis</span>
      </div>
      <div
        ref={chartContainerRef}
        style={{
          flex: 1,
          height: "100vh",
          position: "relative", // Position relative to overlay
        }}
      />
    </div>
  );
};

export default RealtimeChart;
