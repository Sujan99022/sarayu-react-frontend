import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import apiClient from "../../../../api/apiClient";
import { RiDownloadCloud2Fill } from "react-icons/ri";

const SmallGraph = ({ topic, height, viewgraph }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const thresholdLineSeriesRefs = useRef([]);
  const timerRef = useRef(null);
  const dataWindow = useRef([]);
  const latestTimestamp = useRef(0);
  const isMounted = useRef(true);
  const currentColorRef = useRef("rgba(41, 98, 255, 0.3)");
  const isChartInitialized = useRef(false); // Flag to track chart initialization

  const [thresholds, setThreshold] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const encodedTopic = encodeURIComponent(topic);

  const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;

  // Check if the chart is initialized before performing operations
  const isChartValid = () => chartRef.current && isChartInitialized.current;

  // Create the threshold lines
  const createThresholdLines = () => {
    if (isChartValid()) {
      // Remove previous threshold lines
      thresholdLineSeriesRefs.current.forEach((series) => {
        try {
          chartRef.current.removeSeries(series);
        } catch (error) {
          console.warn("Error removing threshold series:", error);
        }
      });

      thresholdLineSeriesRefs.current = [];

      const currentTime = Math.floor(new Date().getTime() / 1000);
      const startTime = currentTime - TWO_HOURS_IN_SECONDS;
      const endTime = currentTime + 60 * 60;

      thresholds.forEach((threshold) => {
        if (isChartValid()) {
          const thresholdLine = chartRef.current.addLineSeries({
            color: threshold.color,
            lineWidth: 2,
            priceLineVisible: false,
            crosshairMarkerVisible: false,
          });

          const thresholdData = [
            { time: startTime, value: threshold.value },
            { time: endTime, value: threshold.value },
          ];

          thresholdLine.setData(thresholdData);
          thresholdLineSeriesRefs.current.push(thresholdLine);
        }
      });
    }
  };

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

  const fetchThresholdApi = async () => {
    try {
      const res = await apiClient.get(`/mqtt/get?topic=${topic}`);
      if (res?.data?.data?.thresholds?.length) {
        setThreshold(res?.data?.data?.thresholds);
      } else {
        console.log("No thresholds found for this topic");
      }
    } catch (error) {
      console.log("Error fetching thresholds:", error.message);
    }
  };

  useEffect(() => {
    fetchSubscriptionApi();
    fetchThresholdApi();
  }, []);

  useEffect(() => {
    if (chartRef.current) return; // Prevent recreating the chart if already created

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
      },
    });

    areaSeriesRef.current = chartRef.current.addAreaSeries({
      topColor: currentColorRef.current,
      bottomColor: "rgba(0, 0, 0, 0)",
      lineColor: currentColorRef.current,
      lineWidth: 2,
    });

    // Set chart initialized flag to true
    isChartInitialized.current = true;

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
        isChartInitialized.current = false; // Reset flag when chart is removed
      }
    };
  }, [height]);

  useEffect(() => {
    if (isChartValid()) {
      createThresholdLines();
    }
  }, [thresholds]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await apiClient.post(
          "/mqtt/realtime-data/last-2-hours",
          { topic }
        );
        if (response.data && response.data.messages) {
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
              areaSeriesRef.current.setData(historicalData);
              chartRef.current?.timeScale().fitContent();
            }
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    const fetchRealTimeData = async () => {
      try {
        const response = await apiClient.post("/mqtt/messages", { topic });
        if (response.data.success) {
          const { message, timestamp } = response.data.message;
          const newPoint = {
            time: Math.floor(new Date(timestamp).getTime() / 1000),
            value: parseFloat(message.message),
          };

          const visibleRange = chartRef.current?.timeScale().getVisibleRange();
          if (visibleRange && newPoint.time < visibleRange.from) {
            return;
          }

          const defaultColor = "rgba(41, 98, 255, 0.3)";
          if (thresholds.length > 0) {
            const sortedThresholds = [...thresholds].sort(
              (a, b) => a.value - b.value
            );
            let newColor = defaultColor;

            for (let i = sortedThresholds.length - 1; i >= 0; i--) {
              if (newPoint.value > sortedThresholds[i].value) {
                newColor = sortedThresholds[i].color;
                break;
              }
            }

            updateSeriesColor(newColor);
          }

          if (newPoint.time > latestTimestamp.current) {
            latestTimestamp.current = newPoint.time;
            dataWindow.current.push(newPoint);

            const earliestAllowedTime = newPoint.time - TWO_HOURS_IN_SECONDS;
            dataWindow.current = dataWindow.current.filter(
              (point) => point.time >= earliestAllowedTime
            );

            if (isChartValid()) {
              areaSeriesRef.current.setData(dataWindow.current);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching real-time data:", error);
      }
    };

    if (subscribed) {
      fetchInitialData().then(() => {
        isMounted.current = true;
        timerRef.current = setInterval(fetchRealTimeData, 1000);
      });
    } else {
      fetchInitialData();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      isMounted.current = false;
    };
  }, [topic, subscribed, thresholds]);

  // Update the color of the chart's series based on thresholds
  const updateSeriesColor = (color) => {
    if (isChartValid()) {
      try {
        areaSeriesRef.current.applyOptions({
          topColor: color,
          bottomColor: "rgba(0, 0, 0, 0)",
          lineColor: color,
        });
      } catch (error) {
        console.warn("Error updating series color:", error);
      }
    }
  };

  const downloadImage = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.getCanvas();
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = "chart.png";
        a.click();
      }
    }
  };

  const downloadCSV = () => {
    if (dataWindow.current.length > 0) {
      const csvRows = [];
      const headers = ["Timestamp", "Value"];
      csvRows.push(headers.join(","));

      dataWindow.current.forEach((dataPoint) => {
        const row = [
          new Date(dataPoint.time * 1000).toISOString(),
          dataPoint.value,
        ];
        csvRows.push(row.join(","));
      });

      const csvData = csvRows.join("\n");
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "data.csv";
      a.click();
    }
  };

  return (
    <div>
      <div ref={chartContainerRef}></div>
      {viewgraph && (
        <div>
          <button onClick={downloadImage}>
            <RiDownloadCloud2Fill />
            Download PNG
          </button>
          <button onClick={downloadCSV}>
            <RiDownloadCloud2Fill />
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default SmallGraph;
