import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import apiClient from "../../../../api/apiClient";
import { RiDownloadCloud2Fill } from "react-icons/ri";
import io from "socket.io-client";
import { SketchPicker } from "react-color";

const DualGraphPlot = ({ topic1, topic2, height, viewgraph }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const areaSeries1Ref = useRef(null);
  const areaSeries2Ref = useRef(null);
  const dataWindow1 = useRef([]);
  const dataWindow2 = useRef([]);
  const latestTimestamp1 = useRef(0);
  const latestTimestamp2 = useRef(0);
  const isMounted = useRef(true);
  const socket1 = useRef(null);
  const socket2 = useRef(null);
  const isChartInitialized = useRef(false);
  const [showLineShadow, setShowLineShadow] = useState(true);
  const [color1, setColor1] = useState({ r: 255, g: 165, b: 0 }); // Orange
  const [color2, setColor2] = useState({ r: 0, g: 0, b: 0 }); // Black
  const [showColorPicker1, setShowColorPicker1] = useState(false);
  const [showColorPicker2, setShowColorPicker2] = useState(false);

  const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;

  // Helper function to convert RGB object to RGBA string
  const rgbToString = (rgb, alpha = 1) => {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  // Format timestamp to IST
  const formatToIST = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  };

  // Check if the chart is valid and initialized
  const isChartValid = () => chartRef.current && isChartInitialized.current;

  // Initialize the chart
  useEffect(() => {
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
      grid: {
        vertLines: { color: "#eeeeee" },
        horzLines: { color: "#eeeeee" },
      },
      priceScale: {
        borderColor: "#cccccc",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "#cccccc",
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 20,
        tickMarkFormatter: (timestamp) => {
          return formatToIST(timestamp * 1000);
        },
      },
    });

    // Create first series for topic1
    areaSeries1Ref.current = chartRef.current.addAreaSeries({
      topColor: showLineShadow ? rgbToString(color1, 0.3) : "rgba(0, 0, 0, 0)",
      bottomColor: "rgba(0, 0, 0, 0)",
      lineColor: rgbToString(color1),
      lineWidth: 2,
    });

    // Create second series for topic2
    areaSeries2Ref.current = chartRef.current.addAreaSeries({
      topColor: showLineShadow ? rgbToString(color2, 0.3) : "rgba(0, 0, 0, 0)",
      bottomColor: "rgba(0, 0, 0, 0)",
      lineColor: rgbToString(color2),
      lineWidth: 2,
    });

    isChartInitialized.current = true;

    // Handle window resize
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        isChartInitialized.current = false;
      }
    };
  }, [height]);

  // Update series colors when color1 or showLineShadow changes
  useEffect(() => {
    if (areaSeries1Ref.current) {
      areaSeries1Ref.current.applyOptions({
        lineColor: rgbToString(color1),
        topColor: showLineShadow
          ? rgbToString(color1, 0.3)
          : "rgba(0, 0, 0, 0)",
      });
    }
  }, [color1, showLineShadow]);

  // Update series colors when color2 or showLineShadow changes
  useEffect(() => {
    if (areaSeries2Ref.current) {
      areaSeries2Ref.current.applyOptions({
        lineColor: rgbToString(color2),
        topColor: showLineShadow
          ? rgbToString(color2, 0.3)
          : "rgba(0, 0, 0, 0)",
      });
    }
  }, [color2, showLineShadow]);

  // Fetch initial data for both topics
  const fetchInitialData = async (
    topic,
    dataWindow,
    latestTimestamp,
    seriesRef
  ) => {
    try {
      const response = await apiClient.post(
        "/mqtt/realtime-data/last-2-hours",
        { topic }
      );
      if (response.data?.messages) {
        let historicalData = response.data.messages.map((msg) => ({
          time: Math.floor(new Date(msg.timestamp).getTime() / 1000),
          value: parseFloat(msg.message),
        }));

        historicalData.sort((a, b) => a.time - b.time);
        historicalData = historicalData.filter(
          (dataPoint, index, self) =>
            index === 0 || dataPoint.time > self[index - 1].time
        );

        if (historicalData.length > 0) {
          latestTimestamp.current =
            historicalData[historicalData.length - 1].time;
          dataWindow.current = historicalData;

          if (isChartValid()) {
            seriesRef.current.setData(historicalData);
            chartRef.current?.timeScale().fitContent();
          }
        }
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData(topic1, dataWindow1, latestTimestamp1, areaSeries1Ref);
    fetchInitialData(topic2, dataWindow2, latestTimestamp2, areaSeries2Ref);
  }, []);

  // Setup WebSocket for real-time data
  const setupSocket = (topic, dataWindow, latestTimestamp, seriesRef) => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.emit("subscribeToTopic", topic);

    socket.on("liveMessage", (data) => {
      if (data.success) {
        const { message, timestamp } = data.message;
        const newPoint = {
          time: Math.floor(new Date(timestamp).getTime() / 1000),
          value: parseFloat(message.message),
        };

        if (newPoint.time > latestTimestamp.current) {
          latestTimestamp.current = newPoint.time;
          dataWindow.current.push(newPoint);

          const earliestAllowedTime = newPoint.time - TWO_HOURS_IN_SECONDS;
          dataWindow.current = dataWindow.current.filter(
            (point) => point.time >= earliestAllowedTime
          );

          if (isChartValid()) {
            seriesRef.current.setData(dataWindow.current);
          }
        }
      }
    });

    return socket;
  };

  useEffect(() => {
    socket1.current = setupSocket(
      topic1,
      dataWindow1,
      latestTimestamp1,
      areaSeries1Ref
    );
    socket2.current = setupSocket(
      topic2,
      dataWindow2,
      latestTimestamp2,
      areaSeries2Ref
    );

    return () => {
      socket1.current?.disconnect();
      socket2.current?.disconnect();
    };
  }, [topic1, topic2]);

  // Download chart as PNG
  const downloadImage = () => {
    if (chartRef.current) {
      const canvas = chartContainerRef.current.querySelector("canvas");
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `${topic1}_${topic2}_${new Date().toISOString()}.png`;
        a.click();
      }
    }
  };

  // Download data as CSV
  const downloadCSV = (topic, dataWindow) => {
    if (dataWindow.current.length > 0) {
      const csvRows = [];
      const headers = ["Timestamp (IST)", "Value"];
      csvRows.push(headers.join(","));

      dataWindow.current.forEach((dataPoint) => {
        const date = new Date(dataPoint.time * 1000);
        const formattedDate = new Date(date).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "short",
          timeStyle: "medium",
        });
        const row = [formattedDate, dataPoint.value];
        csvRows.push(row.join(","));
      });

      const csvData = csvRows.join("\n");
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${topic}_${new Date().toISOString()}.csv`;
      a.click();
    }
  };

  // Extract labels for topics
  const topic1Label = topic1.split("|")[0].split("/")[2];
  const topic2Label = topic2.split("|")[0].split("/")[2];

  return (
    <div style={{ position: "relative" }}>
      {/* Control Panel */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 100,
          backgroundColor: "white",
          padding: "8px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Color Picker for Topic 1 */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: "8px",
            }}
            onClick={() => {
              setShowColorPicker1(!showColorPicker1);
              setShowColorPicker2(false);
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: rgbToString(color1),
                border: "1px solid #ddd",
              }}
            />
            <span style={{ fontSize: 14 }}>{topic1Label}</span>
          </div>
          {showColorPicker1 && (
            <div
              style={{ position: "absolute", left: 0, top: 28, zIndex: 1000 }}
            >
              <SketchPicker
                color={color1}
                onChange={(color) => setColor1(color.rgb)}
                disableAlpha={true}
              />
            </div>
          )}
        </div>

        {/* Color Picker for Topic 2 */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: "8px",
            }}
            onClick={() => {
              setShowColorPicker2(!showColorPicker2);
              setShowColorPicker1(false);
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: rgbToString(color2),
                border: "1px solid #ddd",
              }}
            />
            <span style={{ fontSize: 14 }}>{topic2Label}</span>
          </div>
          {showColorPicker2 && (
            <div
              style={{ position: "absolute", left: 0, top: 28, zIndex: 1000 }}
            >
              <SketchPicker
                color={color2}
                onChange={(color) => setColor2(color.rgb)}
                disableAlpha={true}
              />
            </div>
          )}
        </div>

        {/* Toggle Line Shadow */}
        <div style={{ marginTop: 8, display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={showLineShadow}
            onChange={(e) => setShowLineShadow(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          <label style={{ fontSize: 14 }}>Show Line Shadow</label>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef}></div>

      {/* Download Buttons */}
      {viewgraph && (
        <div className="_viewgraph_downloadimg_csv_btn_container">
          <button onClick={downloadImage}>
            <RiDownloadCloud2Fill />
            Download PNG
          </button>
          <button onClick={() => downloadCSV(topic1, dataWindow1)}>
            <RiDownloadCloud2Fill />
            Download {topic1} CSV
          </button>
          <button onClick={() => downloadCSV(topic2, dataWindow2)}>
            <RiDownloadCloud2Fill />
            Download {topic2} CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default DualGraphPlot;
