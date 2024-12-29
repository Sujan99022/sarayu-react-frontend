import React from "react";
import GaugeChart from "react-gauge-chart";

const FallbackGaugeChart = ({
  id,
  nrOfLevels,
  arcsLength,
  colors,
  percent,
  arcPadding,
  textColor,
  needleColor,
  animate,
  style,
}) => {
  try {
    return (
      <GaugeChart
        id={id}
        nrOfLevels={nrOfLevels}
        arcsLength={arcsLength}
        colors={colors}
        percent={percent}
        arcPadding={arcPadding}
        textColor={textColor}
        needleColor={needleColor}
        animate={animate}
        style={style}
      />
    );
  } catch (error) {
    console.error("Error rendering GaugeChart:", error);
    return <div style={{ color: "red" }}>Error loading chart</div>;
  }
};

const Type3 = ({
  maxValue = 100,
  value = 10,
  unit = "",
  adminWidth,
  adminHeight,
}) => {
  const normalizeValue = (val, max) => Math.max(0, Math.min(val, max));

  return (
    <div
      style={{
        backgroundColor: "transparent",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          width: "300px",
          height: "200px",
        }}
      >
        <FallbackGaugeChart
          id="custom-gauge-chart"
          nrOfLevels={4}
          arcsLength={[0.2, 0.2, 0.4]}
          colors={["green", "#F5CD19", "red"]}
          percent={normalizeValue(value, maxValue) / maxValue}
          arcPadding={0.02}
          textColor="transparent"
          needleColor="#FFFFFF"
          animate={false}
          style={{
            width: "300px",
            height: "200px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, 110%)",
            color: "#fff",
            background: "transparent",
            fontSize: "32px",
            fontWeight: "bold",
            lineHeight: "1",
          }}
        >
          {value} {unit}
        </div>
      </div>
    </div>
  );
};

export default Type3;
