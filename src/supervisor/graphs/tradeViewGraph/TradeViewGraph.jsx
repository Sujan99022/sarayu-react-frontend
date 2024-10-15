import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import apiClient from "../../../api/apiClient";
import { parse } from "date-fns";
import "./style.css";

const RealtimeChart = ({ user }) => {
  const oldTheme = JSON.parse(localStorage.getItem("theme"));
  const oldLineWidth = JSON.parse(localStorage.getItem("lineWidth"));

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null); // Ref for the chart instance
  const seriesRef = useRef(null); // Ref for the series instance
  const [userData, setUserData] = useState([]);
  const [theme, setTheme] = useState(oldTheme || false);
  const [lineWidth, setLineWidth] = useState(oldLineWidth || 2);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
    localStorage.setItem("lineWidth", JSON.stringify(lineWidth));
  }, [theme, lineWidth]);

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    // Update height on window resize
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  useEffect(() => {
    const chartOptions = {
      layout: {
        textColor: theme ? "black" : "white",
        background: { type: "solid", color: theme ? "white" : "black" },
      },
      grid: {
        vertLines: {
          color: theme ? "gray" : "rgba(255, 255, 255, 0.2)",
        },
        horzLines: {
          color: theme ? "gray" : "rgba(255, 255, 255, 0.2)",
        },
      },
      height: viewportHeight * 0.8, // 80% of the viewport height
      crossHairMarker: {
        visible: true,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart; // Store the chart in the ref

    seriesRef.current = chart.addLineSeries({
      lineWidth: parseInt(lineWidth),
    });

    // Adding the horizontal yellow line at value 50
    seriesRef.current.createPriceLine({
      price: 50,
      color: "yellow",
      lineWidth: 2,
      lineStyle: 2, // Dashed line
      axisLabelVisible: true,
    });

    const intervalId = setInterval(() => {
      fetchGraphData();
    }, 1000);

    return () => {
      clearInterval(intervalId);
      chart.remove();
      chartRef.current = null; // Reset the ref when chart is removed
      seriesRef.current = null; // Reset the series ref
    };
  }, [user.email, theme, lineWidth, viewportHeight]);

  const fetchGraphData = async () => {
    try {
      const res = await apiClient.get(`/mqtt/messages?email=${user.email}`);
      const { timestamp, message } = res.data.message;
      const date = parse(timestamp, "yyyy-MM-dd HH:mm:ss", new Date());
      const timezoneOffset = 330;
      const offsetMilliseconds = timezoneOffset * 60 * 1000;

      const adjustedTime = Math.floor(
        (date.getTime() + offsetMilliseconds) / 1000
      );

      setUserData((prevData) => {
        const newDataPoint = {
          value: parseFloat(message),
          time: adjustedTime,
        };

        const lastDataPoint = prevData[prevData.length - 1];
        if (lastDataPoint && lastDataPoint.time >= newDataPoint.time) {
          newDataPoint.time = lastDataPoint.time + 1; // Add 1 second for uniqueness
        }

        const updatedData = [...prevData, newDataPoint];
        updatedData.sort((a, b) => a.time - b.time);

        const colorizedData = updatedData.map((point, index, arr) => {
          const color = point.value > 50 ? "red" : "green";
          const nextValue = arr[index + 1]?.value;
          return {
            ...point,
            color: nextValue !== undefined && nextValue > 50 ? "red" : color,
          };
        });

        // Ensure chart and series still exist before updating data
        if (seriesRef.current) {
          seriesRef.current.setData(colorizedData);
        }

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
      <div className="tradeview_graph_theme_cahnge">
        <div className="tradingviewgraph_theme_btn-container">
          <label className="tradingviewgraph_theme_switch tradingviewgraph_theme_btn-color-mode-switch">
            <input
              value="1"
              id="color_mode"
              name="color_mode"
              type="checkbox"
              onChange={() => setTheme(!theme)}
            />
            <label
              className="tradingviewgraph_theme_btn-color-mode-switch-inner"
              data-off="Dark"
              data-on="Light"
              htmlFor="color_mode"
            ></label>
          </label>
        </div>
        <div>
          <select
            onChange={(e) => setLineWidth(e.target.value)}
            value={lineWidth}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RealtimeChart;
