import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import apiClient from "../../../../api/apiClient";
import { RiDownloadCloud2Fill } from "react-icons/ri";

const SmallGraph = ({ topic, height, viewgraph }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const areaSeriesRef = useRef();
  const thresholdLineSeriesRefs = useRef([]);
  const timerRef = useRef();
  const dataWindow = useRef([]);
  const latestTimestamp = useRef(0);
  const isMounted = useRef(true);
  const currentColorRef = useRef("rgba(41, 98, 255, 0.3)");

  const [thresholds, setThreshold] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const encodedTopic = encodeURIComponent(topic);

  const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;

  // Create threshold lines with labels (using overlays)
  const createThresholdLines = () => {
    if (chartRef.current) {
      thresholdLineSeriesRefs.current.forEach((series) => {
        if (series) {
          try {
            chartRef.current.removeSeries(series);
          } catch (error) {
            console.warn("Error removing series:", error);
          }
        }
      });
    }

    thresholdLineSeriesRefs.current = [];

    const currentTime = Math.floor(new Date().getTime() / 1000);
    const startTime = currentTime - TWO_HOURS_IN_SECONDS; // Start from two hours ago
    const endTime = currentTime + 60 * 60; // Extend to one hour into the future

    thresholds.forEach((threshold) => {
      if (chartRef.current) {
        const thresholdLine = chartRef.current.addLineSeries({
          color: threshold.color,
          lineWidth: 2,
          priceLineVisible: false, // Hide price line
          crosshairMarkerVisible: false, // Hide crosshair marker
        });

        // Set the threshold line data to cover the full range
        const thresholdData = [
          { time: startTime, value: threshold.value }, // Start from two hours ago
          { time: endTime, value: threshold.value }, // Extend to one hour into the future
        ];

        thresholdLine.setData(thresholdData);
        thresholdLineSeriesRefs.current.push(thresholdLine);
      }
    });
  };

  // Fetch initial subscription and threshold data
  useEffect(() => {
    fetchSubscriptionApi();
    fetchThresholdApi();
  }, []);

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

  // Create chart when component mounts
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
      priceScale: { borderColor: "#cccccc" },
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
      }
    };
  }, []);

  // Handle threshold changes
  useEffect(() => {
    if (chartRef.current) {
      createThresholdLines();
    }
  }, [thresholds]);

  // Fetch real-time data and update chart
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

            if (areaSeriesRef.current) {
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
          const { message } = response.data;
          const newPoint = {
            time: Math.floor(new Date(message.timestamp).getTime() / 1000),
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

            if (areaSeriesRef.current) {
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
    }

    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [topic, subscribed, thresholds]);

  const updateSeriesColor = (color) => {
    if (areaSeriesRef.current) {
      areaSeriesRef.current.applyOptions({
        topColor: color,
        bottomColor: "rgba(0, 0, 0, 0)",
        lineColor: color,
      });
    }
  };

  const handleDownload = () => {
    const canvas = chartContainerRef.current.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `${topic}-chart.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div style={{ position: "relative", height }} ref={chartContainerRef}>
      <RiDownloadCloud2Fill
        onClick={handleDownload}
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          fontSize: "2rem",
          cursor: "pointer",
        }}
      />
    </div>
  );
};

export default SmallGraph;
