import React, { useRef, useEffect, useState } from "react";
import { createChart, LineStyle, TickMarkType } from "lightweight-charts";
import axios from "axios";

const TradeViewGraph = () => {
  const chartContainerRef = useRef(null);
  const [initialData, setInitialData] = useState([]);

  useEffect(() => {
    // setInterval(() => {
    // }, 1000);
    fetchGraphData();
  });

  const fetchGraphData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/random-value");
      setInitialData([...initialData, res.data]);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(initialData);
  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 690,
      layout: {
        background: { color: "#222" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#444" },
        horzLines: { color: "#444" },
      },
      crosshair: {
        vertLine: {
          width: 5,
          style: LineStyle.Solid,
          color: "#C3BCDB44",
          labelBackgroundColor: "#9B7DFF",
        },
        horzLine: {
          color: "#9B7DFF",
          labelBackgroundColor: "#9B7DFF",
        },
      },
      localization: {
        locale: "en-BD",
        timeFormatter: (time) => {
          const date = new Date(time * 1000);
          return new Intl.DateTimeFormat(navigator.language, {
            hour: "numeric",
            minute: "numeric",
            month: "short",
            day: "numeric",
            year: "2-digit",
          }).format(date);
        },
      },
    });

    chart.priceScale("right").applyOptions({
      borderColor: "#71649C",
      visible: false,
    });

    chart.priceScale("left").applyOptions({
      borderColor: "#71649C",
      visible: true,
    });

    chart.timeScale().applyOptions({
      borderColor: "#71649C",
      timeVisible: true,
      rightOffset: 20,
      barSpacing: 15,
      minBarSpacing: 5,
      fixLeftEdge: true,
    });

    chart.timeScale().options.tickMarkFormatter = (
      time,
      tickMarkType,
      locale
    ) => {
      const date = new Date(time * 1000);
      switch (tickMarkType) {
        case TickMarkType.Year:
          return date.getFullYear();
        case TickMarkType.Month:
          return new Intl.DateTimeFormat(locale, { month: "short" }).format(
            date
          );
        case TickMarkType.DayOfMonth:
          return date.getDate();
        case TickMarkType.Time:
          return new Intl.DateTimeFormat(locale, {
            hour: "numeric",
            minute: "numeric",
          }).format(date);
        case TickMarkType.TimeWithSeconds:
          return new Intl.DateTimeFormat(locale, {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }).format(date);
        default:
          return "";
      }
    };

    // Create a line series
    const lineSeries = chart.addLineSeries({
      lineWidth: 2,
      color: "green", // Initial color
    });

    // Prepare data for the line series with color transition logic
    const coloredData = initialData.map((point, index) => {
      const color = point.value >= 13 ? "red" : "green";
      return { ...point, color };
    });

    // Set the data for the line series
    lineSeries.setData(coloredData);

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      chart.remove();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={chartContainerRef} style={{ width: "100%" }}></div>;
};

export default TradeViewGraph;
