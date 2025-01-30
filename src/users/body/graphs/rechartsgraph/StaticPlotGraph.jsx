import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cursor,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "white",
          color: "black",
          borderRadius: "4px",
          padding: "8px",
          border: "none",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: "4px 0" }}>{`Frequency : ${label}`}</p>
        <p style={{ margin: "4px 0" }}>{`Amplitude : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const CustomCursor = ({ payload, points, width, height }) => {
  if (!points || points.length === 0) return null;

  const { x, y } = points[0];
  return (
    <g>
      <line x1={x} y1={0} x2={x} y2={height} stroke="red" strokeWidth={1} />
      <circle cx={x} cy={y} r={5} fill="red" />
    </g>
  );
};

const StaticPlotGraph = ({ topic, height, dy, hidesteps }) => {
  const [data, setData] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [stepSize, setStepSize] = useState(2);
  const [availableStepSizes] = useState([1, 2, 4, 8, 12, 24, 48]);
  const [yMax, setYMax] = useState(10);
  const [visibleRange, setVisibleRange] = useState([0, 100]);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchPos, setLastTouchPos] = useState({ x: 0, y: 0 });
  const [pinchStartDistance, setPinchStartDistance] = useState(null);
  const [pinchCenterX, setPinchCenterX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRange, setDragStartRange] = useState([0, 0]);

  const chartContainerRef = useRef(null);
  const chartMargins = { left: 20, right: 30, top: 5, bottom: 5 };

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });

    const handleLiveMessage = (message) => {
      try {
        // Parse the incoming JSON string
        const parsedData = JSON.parse(message.message.message.message);
        const numericData = parsedData.map(Number);

        // Extract metadata and data points
        const [newYMax, xMax, initialStepSize, ...dataPoints] = numericData;

        setYMax(newYMax);
        setStepSize((prevStepSize) =>
          prevStepSize === initialStepSize ? initialStepSize : prevStepSize
        );

        // Generate labels based on step size
        const labels = Array.from(
          { length: xMax / stepSize + 1 },
          (_, i) => i * stepSize
        );

        // Create chart data array
        const chartData = labels.map((x, i) => ({
          x,
          y: dataPoints[i] || 0,
        }));

        setXLabels(labels);
        setData(chartData);

        // Initialize visible range to show the entire dataset (fully zoomed out)
        if (!isInitialDataLoaded) {
          setVisibleRange([0, chartData.length - 1]);
          setIsInitialDataLoaded(true);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", handleLiveMessage);

    return () => {
      socket.off("liveMessage", handleLiveMessage);
      socket.disconnect();
    };
  }, [stepSize, isInitialDataLoaded, topic]);

  useEffect(() => {
    if (data.length === 0) return;

    // Ensure the visible range stays within bounds
    setVisibleRange(([prevStart, prevEnd]) => {
      const maxIndex = data.length - 1;
      const newEnd = Math.min(prevEnd, maxIndex);
      const newStart = Math.max(0, Math.min(prevStart, newEnd));

      return [newStart, newEnd];
    });
  }, [data.length]);

  const handleStepSizeChange = useCallback((event) => {
    const newStepSize = parseInt(event.target.value, 10);
    setStepSize(newStepSize);
  }, []);

  const generateYTicks = useCallback(() => {
    return Array.from({ length: yMax + 1 }, (_, i) => i);
  }, [yMax]);

  const handleZoom = useCallback(
    (event) => {
      event.preventDefault();
      if (!chartContainerRef.current || data.length === 0) return;

      const zoomFactor = event.deltaY > 0 ? 0.8 : 1.2;
      handleZoomLogic(zoomFactor, event.clientX);
    },
    [visibleRange, data.length]
  );

  const handleZoomLogic = useCallback(
    (zoomFactor, clientX) => {
      const [start, end] = visibleRange;
      const currentRangeSize = end - start + 1;
      const newRangeSize = Math.max(
        10,
        Math.min(data.length, Math.round(currentRangeSize * zoomFactor))
      );

      const rect = chartContainerRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;

      if (
        mouseX < chartMargins.left ||
        mouseX > rect.width - chartMargins.right
      ) {
        return;
      }

      const plotWidth = rect.width - chartMargins.left - chartMargins.right;
      const adjustedX = mouseX - chartMargins.left;
      const fraction = adjustedX / plotWidth;

      const visibleDataLength = end - start + 1;
      const indexInVisible = Math.round(fraction * (visibleDataLength - 1));
      const targetIndex = start + indexInVisible;

      let newStart = Math.max(0, targetIndex - Math.floor(newRangeSize / 2));
      let newEnd = newStart + newRangeSize - 1;

      if (newEnd >= data.length) {
        newEnd = data.length - 1;
        newStart = Math.max(0, newEnd - newRangeSize + 1);
      }

      setVisibleRange([newStart, newEnd]);
    },
    [visibleRange, data.length]
  );

  const handlePan = useCallback(
    (deltaX) => {
      if (data.length === 0) return;

      const container = chartContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const plotWidth = rect.width - chartMargins.left - chartMargins.right;
      const visibleDataPoints = visibleRange[1] - visibleRange[0] + 1;
      const dataPointsPerPixel = visibleDataPoints / plotWidth;
      const shift = -deltaX * dataPointsPerPixel;

      const [start, end] = visibleRange;
      let newStart = Math.max(0, start + shift);
      let newEnd = Math.min(data.length - 1, end + shift);

      if (newEnd - newStart !== end - start) {
        newEnd = newStart + (end - start);
      }

      if (newStart < 0) {
        newStart = 0;
        newEnd = Math.min(data.length - 1, end - start);
      } else if (newEnd >= data.length) {
        newEnd = data.length - 1;
        newStart = Math.max(0, newEnd - (end - start));
      }

      setVisibleRange([newStart, newEnd]);
    },
    [visibleRange, data.length]
  );

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setLastTouchPos({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setPinchStartDistance(distance);
      setPinchCenterX((touch1.clientX + touch2.clientX) / 2);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!chartContainerRef.current || data.length === 0) return;

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchPos.x;
        const deltaY = touch.clientY - lastTouchPos.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          e.preventDefault();
          handlePan(deltaX);
        }
        setLastTouchPos({ x: touch.clientX, y: touch.clientY });
      } else if (e.touches.length === 2 && pinchStartDistance !== null) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scale = currentDistance / pinchStartDistance;
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        handleZoomLogic(scale, centerX);
      }
    },
    [lastTouchPos, pinchStartDistance, handlePan, handleZoomLogic, data.length]
  );

  const handleTouchEnd = useCallback(() => {
    setPinchStartDistance(null);
    setPinchCenterX(null);
  }, []);

  const handleMouseDown = useCallback(
    (event) => {
      if (event.target.closest("select")) {
        return;
      }

      setIsDragging(true);
      setDragStartX(event.clientX);
      setDragStartRange(visibleRange);
      event.preventDefault();
    },
    [visibleRange]
  );

  const handleMouseMove = useCallback(
    (event) => {
      if (!isDragging || !chartContainerRef.current) return;

      const deltaX = event.clientX - dragStartX;
      const plotWidth =
        chartContainerRef.current.offsetWidth -
        chartMargins.left -
        chartMargins.right;
      const dataPointsPerPixel =
        (dragStartRange[1] - dragStartRange[0] + 1) / plotWidth;
      const dataPointDelta = deltaX * dataPointsPerPixel;

      const newStart = Math.max(0, dragStartRange[0] - dataPointDelta);
      const newEnd = Math.min(
        data.length - 1,
        dragStartRange[1] - dataPointDelta
      );

      if (newStart !== visibleRange[0] || newEnd !== visibleRange[1]) {
        setVisibleRange([newStart, newEnd]);
      }
    },
    [isDragging, dragStartX, dragStartRange, data.length, visibleRange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      style={{
        height: "100%",
        minHeight: height ? height : "100dvh",
        width: "100%",
        position: "relative",
      }}
    >
      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          height: height ? height : "calc(100vh - 20px)",
          overflow: "hidden",
          touchAction: "pan-y",
          cursor: isDragging ? "grabbing" : "grab",
          position: "relative",
        }}
        onWheel={handleZoom}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "5px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!hidesteps && (
            <select
              id="stepSize"
              value={stepSize}
              onChange={handleStepSizeChange}
              style={{
                padding: "3px",
                borderRadius: "3px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
            >
              {availableStepSizes.map((size) => (
                <option key={size} value={size}>
                  x-axis step: {size}
                </option>
              ))}
            </select>
          )}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.slice(visibleRange[0], visibleRange[1] + 1)}
            margin={chartMargins}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              ticks={xLabels.slice(visibleRange[0], visibleRange[1] + 1)}
              label={{
                value: "Frequency(Hz)",
                position: "insideBottom",
                dy: 10,
              }}
            />
            <YAxis
              orientation="right"
              domain={[0, yMax]}
              ticks={generateYTicks()}
              label={{
                value: "Amplitude(Amp)",
                angle: 90,
                position: "insideRight",
                dy: dy ? dy : 0,
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
            <Line
              type="monotone"
              dataKey="y"
              stroke="darkblue"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StaticPlotGraph;
