import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import apiClient from "../../../api/apiClient";
import { parse } from "date-fns";
import "./style.css";

const RealtimeChart = ({ user }) => {
  const oldTheme = JSON.parse(localStorage.getItem("theme"));
  const oldLineWidth = JSON.parse(localStorage.getItem("lineWidth"));

  const chartContainerRef = useRef(null);
  const seriesRef = useRef(null);
  const [userData, setUserData] = useState([]);
  const [theme, setTheme] = useState(oldTheme || false);
  const [lineWidth, setLineWidth] = useState(oldLineWidth || 2);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
    localStorage.setItem("lineWidth", JSON.stringify(lineWidth));
  }, [theme, lineWidth]);

  useEffect(() => {
    // Removed the code that retrieves userData from localStorage
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
      height: 600,
      crossHairMarker: {
        visible: true,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);

    seriesRef.current = chart.addLineSeries({
      lineWidth: parseInt(lineWidth),
    });

    const intervalId = setInterval(() => {
      fetchGraphData();
    }, 1000);

    return () => {
      clearInterval(intervalId);
      chart.remove();
    };
  }, [user.email, theme, lineWidth]);

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
        const updatedData = prevData.filter(
          (dataPoint) => dataPoint.time !== newDataPoint.time
        );
        updatedData.push(newDataPoint);
        if (updatedData.length > 100) {
          updatedData.shift();
        }
        updatedData.sort((a, b) => a.time - b.time);
        const colorizedData = updatedData.map((point, index, arr) => {
          const color = point.value > 50 ? "red" : "green";
          const nextValue = arr[index + 1]?.value;
          return {
            ...point,
            color: nextValue !== undefined && nextValue > 50 ? "red" : color,
          };
        });

        // Removed the localStorage.setItem part for userData_
        seriesRef.current.setData(colorizedData);

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
