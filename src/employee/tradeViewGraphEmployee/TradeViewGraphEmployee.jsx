import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { parse } from "date-fns";
import { useSelector } from "react-redux";
import "./style.css";

const RealtimeChartEmployee = ({ email }) => {
  const oldTheme = JSON.parse(localStorage.getItem("theme"));
  const oldLineWidth = JSON.parse(localStorage.getItem("lineWidth"));

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const objDataRef = useRef({});

  const [theme, setTheme] = useState(oldTheme || false);
  const [lineWidth, setLineWidth] = useState(oldLineWidth || 2);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem(`userData_${email}`)) || []
  );

  const { data } = useSelector((state) => state.EmployeeTopicDataSlice);

  useEffect(() => {
    objDataRef.current = data[data.length - 1];
  }, [data]);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
    localStorage.setItem("lineWidth", JSON.stringify(lineWidth));
  }, [theme, lineWidth]);

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };
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
      height: viewportHeight * 0.7,
      crossHairMarker: {
        visible: true,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    seriesRef.current = chart.addLineSeries({
      lineWidth: parseInt(lineWidth),
    });

    seriesRef.current.createPriceLine({
      price: 50,
      color: "yellow",
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
    });

    const existingData = JSON.parse(localStorage.getItem(`userData_${email}`));
    if (existingData && seriesRef.current) {
      seriesRef.current.setData(existingData);
    }

    const intervalId = setInterval(() => {
      fetchGraphData();
    }, 1000);

    return () => {
      clearInterval(intervalId);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [email, theme, lineWidth, viewportHeight]);

  const fetchGraphData = async () => {
    try {
      const { timestamp, message } = objDataRef.current;

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
          newDataPoint.time = lastDataPoint.time + 1;
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

        if (seriesRef.current) {
          seriesRef.current.setData(colorizedData);
        }

        localStorage.setItem(`userData_${email}`, JSON.stringify(updatedData));

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
      <div className="tradeview_graph_theme_change">
        {/* Theme and Line Width controls */}
      </div>
    </div>
  );
};

export default RealtimeChartEmployee;
