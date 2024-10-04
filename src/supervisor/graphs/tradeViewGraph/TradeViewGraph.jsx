import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import apiClient from "../../../api/apiClient";
import { parse } from "date-fns";

const RealtimeChart = ({ user }) => {
  const chartContainerRef = useRef(null);
  const seriesRef = useRef(null);
  const [userData, setUserData] = useState([]);

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
      height: 600, // Set height to 200px
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

    const areaSeries = chart.addAreaSeries({
      topColor: "rgba(0, 128, 0, 0.3)",
      bottomColor: "rgba(0, 128, 0, 0)",
      lineColor: "transparent",
    });

    const intervalId = setInterval(() => {
      fetchGraphData(chart, areaSeries);
    }, 2000);

    return () => {
      clearInterval(intervalId);
      chart.remove();
    };
  }, [user.email]);

  const fetchGraphData = async (chart, areaSeries) => {
    try {
      const res = await apiClient.get(`/mqtt/messages?email=${user.email}`);
      const { timestamp, message } = res.data.message;

      // Parse the timestamp in the format 'YYYY-MM-DD HH:mm:ss'
      const date = parse(timestamp, "yyyy-MM-dd HH:mm:ss", new Date());

      // Get timezone offset in minutes for Bengaluru (UTC+5:30)
      const timezoneOffset = 330; // Bengaluru is UTC+5:30 (5.5 hours = 330 minutes)
      const offsetMilliseconds = timezoneOffset * 60 * 1000;

      // Adjust the timestamp by adding the offset
      const adjustedTime = Math.floor(
        (date.getTime() + offsetMilliseconds) / 1000
      ); // Convert to seconds

      setUserData((prevData) => {
        const newDataPoint = {
          value: parseFloat(message),
          time: adjustedTime, // Pass the adjusted time to lightweight-charts
        };

        const updatedData = prevData.filter(
          (dataPoint) => dataPoint.time !== newDataPoint.time
        );

        updatedData.push(newDataPoint);

        if (updatedData.length > 100) {
          updatedData.shift();
        }

        updatedData.sort((a, b) => a.time - b.time);

        // Update the chart with the new data
        seriesRef.current.setData(updatedData);
        areaSeries.setData(updatedData);

        return updatedData;
      });
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  return (
    <div
      className="trade_lightweight_graph_container"
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div></div>
      <div
        className="tradeview_graph"
        ref={chartContainerRef}
        style={{
          flex: 1,
          position: "relative",
        }}
      />
    </div>
  );
};

export default RealtimeChart;
