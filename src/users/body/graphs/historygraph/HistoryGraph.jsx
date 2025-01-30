import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiClient from "../../../../api/apiClient";

const HistoryGraph = ({ topic, height }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const thresholdLineSeriesRefs = useRef([]);
  const isMounted = useRef(true);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [granularity, setGranularity] = useState("minutes");
  const [graphData, setGraphData] = useState([]);
  const [thresholds, setThresholds] = useState([]);

  const granularityOptions = ["seconds", "minutes", "hours", "days"];

  useEffect(() => {
    // Fetch thresholds when component mounts
    const fetchThresholds = async () => {
      try {
        const response = await apiClient.get(`/mqtt/get?topic=${topic}`);
        if (response.data?.data?.thresholds) {
          setThresholds(response.data.data.thresholds);
        }
      } catch (error) {
        console.error("Error fetching thresholds:", error);
      }
    };
    fetchThresholds();
  }, [topic]);

  useEffect(() => {
    // Initialize chart
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
      topColor: "rgba(41, 98, 255, 0.3)",
      bottomColor: "rgba(0, 0, 0, 0)",
      lineColor: "rgba(41, 98, 255, 0.3)",
      lineWidth: 2,
    });

    const handleResize = () => {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) chartRef.current.remove();
    };
  }, [height]);

  const createThresholdLines = (startTime, endTime) => {
    if (!chartRef.current) return;

    // Clear existing threshold lines
    thresholdLineSeriesRefs.current.forEach((series) => {
      try {
        chartRef.current.removeSeries(series);
      } catch (error) {
        console.warn("Error removing threshold series:", error);
      }
    });
    thresholdLineSeriesRefs.current = [];

    // Create new threshold lines
    thresholds.forEach((threshold) => {
      const lineSeries = chartRef.current.addLineSeries({
        color: threshold.color,
        lineWidth: 2,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });

      lineSeries.setData([
        { time: startTime, value: threshold.value },
        { time: endTime, value: threshold.value },
      ]);
      thresholdLineSeriesRefs.current.push(lineSeries);
    });
  };

  const updateChartColor = (data) => {
    if (!data.length) return;

    const latestValue = data[data.length - 1].value;
    let newColor = "rgba(41, 98, 255, 0.3)"; // Default color
    const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);

    // Find the highest threshold crossed
    for (let i = sortedThresholds.length - 1; i >= 0; i--) {
      if (latestValue > sortedThresholds[i].value) {
        newColor = sortedThresholds[i].color;
        break;
      }
    }

    // Update area series color
    areaSeriesRef.current.applyOptions({
      topColor: newColor,
      bottomColor: "rgba(0, 0, 0, 0)",
      lineColor: newColor,
    });
  };

  const fetchGraphData = async () => {
    try {
      const body = {
        topic,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        granularity,
      };

      const response = await apiClient.post(
        "/mqtt/realtime-data/custom-range",
        body
      );

      if (response.data.success) {
        const data = response.data.messages
          .map((msg) => {
            const timestamp = new Date(msg.timestamp);
            if (isNaN(timestamp.getTime())) return null;
            return {
              time: Math.floor(timestamp.getTime() / 1000),
              value: parseFloat(msg.message),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.time - b.time);

        if (data.length > 0) {
          // Update chart color based on latest value
          updateChartColor(data);

          // Create threshold lines for the entire time range
          const startTime = data[0].time;
          const endTime = data[data.length - 1].time;
          createThresholdLines(startTime, endTime);
        }

        // Update chart data
        areaSeriesRef.current.setData(data);
        chartRef.current.timeScale().fitContent();
        setGraphData(data);
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  return (
    <div>
      <div className="_historygraph_controls">
        <div className="_historygraph_date-pickers">
          <label>
            From : &nbsp;
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              maxDate={toDate}
              showTimeSelect
            />
          </label>
          <label>
            To : &nbsp;
            <DatePicker
              selected={toDate}
              onChange={setToDate}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              minDate={fromDate}
              maxDate={new Date()}
              showTimeSelect
            />
          </label>
        </div>

        <div className="_historygraph_dropdown">
          <label>
            Granularity : &nbsp;
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
            >
              {granularityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="_historygraph_apply-btn" onClick={fetchGraphData}>
          Apply
        </button>
      </div>

      <div style={{ marginTop: "50px" }} ref={chartContainerRef}></div>
    </div>
  );
};

export default HistoryGraph;
