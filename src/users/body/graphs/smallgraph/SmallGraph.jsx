import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import apiClient from "../../../../api/apiClient";

const SmallGraph = ({ topic, height }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const lineSeriesRef = useRef();
  const areaSeriesRef = useRef();
  const timerRef = useRef();
  const dataWindow = useRef([]);
  const latestTimestamp = useRef(0);
  const isMounted = useRef(true);

  const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;

  useEffect(() => {
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
      grid: {
        vertLines: {
          color: "#eeeeee",
        },
        horzLines: {
          color: "#eeeeee",
        },
      },
      priceScale: {
        borderColor: "#cccccc",
      },
      timeScale: {
        borderColor: "#cccccc",
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 20,
      },
    });

    lineSeriesRef.current = chartRef.current.addLineSeries({
      color: "#2962FF",
      lineWidth: 2,
    });

    areaSeriesRef.current = chartRef.current.addAreaSeries({
      topColor: "rgba(41, 98, 255, 0.3)",
      bottomColor: "rgba(41, 98, 255, 0)",
      lineColor: "rgba(41, 98, 255, 1)",
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
      if (chartRef.current) chartRef.current.remove();
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await apiClient.post(
          "/mqtt/realtime-data/last-2-hours",
          {
            topic,
          }
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

          latestTimestamp.current =
            historicalData[historicalData.length - 1].time;

          dataWindow.current = historicalData;
          if (lineSeriesRef.current)
            lineSeriesRef.current.setData(historicalData);
          if (areaSeriesRef.current)
            areaSeriesRef.current.setData(historicalData);
          chartRef.current.timeScale().fitContent();
        } else {
          console.error("No data available for the last 2 hours");
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

          if (newPoint.time > latestTimestamp.current) {
            latestTimestamp.current = newPoint.time;
            dataWindow.current.push(newPoint);
            const earliestAllowedTime = newPoint.time - TWO_HOURS_IN_SECONDS;
            dataWindow.current = dataWindow.current.filter(
              (point) => point.time >= earliestAllowedTime
            );
            dataWindow.current.sort((a, b) => a.time - b.time);
            if (lineSeriesRef.current)
              lineSeriesRef.current.setData(dataWindow.current);
            if (areaSeriesRef.current)
              areaSeriesRef.current.setData(dataWindow.current);
          }
        }
      } catch (error) {
        console.error("Error fetching real-time data:", error);
      }
    };

    fetchInitialData().then(() => {
      isMounted.current = true;
      timerRef.current = setInterval(fetchRealTimeData, 1000);
    });

    return () => {
      isMounted.current = false;
      clearInterval(timerRef.current);
    };
  }, [topic]);

  return <div ref={chartContainerRef} />;
};

export default SmallGraph;
