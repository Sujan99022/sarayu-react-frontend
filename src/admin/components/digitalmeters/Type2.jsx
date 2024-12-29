import React from "react";
import GaugeComponent from "react-gauge-component";

const Type2 = ({
  minValue = -100,
  maxValue = 100,
  value = 0,
  unit = "",
  tick = 10,
  tickFontSize = "18px",
  adminWidth,
  adminHeight,
}) => {
  const generateTicks = (min, max, tickCount) => {
    const ticks = [];
    const step = (max - min) / tickCount;
    for (let current = min; current <= max; current += step) {
      ticks.push({ value: current });
    }
    return ticks;
  };

  const ticks = generateTicks(minValue, maxValue, tick);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <div
        style={{
          width: "300px",
          height: "200px",
        }}
      >
        <GaugeComponent
          arc={{
            nbSubArcs: 150,
            colorArray: ["#5BE12C", "#F5CD19", "#EA4228"],
            width: 0.3,
            padding: 0.003,
          }}
          labels={{
            valueLabel: {
              style: { fontSize: 28 },
              formatTextValue: () => `${value.toFixed(0)} ${unit}`,
            },
            tickLabels: {
              type: "outer",
              ticks: ticks,
              defaultTickValueConfig: {
                formatTextValue: (tickValue) =>
                  `${tickValue.toFixed(0)} ${unit}`,
                style: {
                  fontSize: tickFontSize,
                },
              },
            },
          }}
          value={value}
          maxValue={maxValue}
          minValue={minValue}
          pointer={{
            animationDuration: 0,
            animationDelay: 0,
          }}
        />
      </div>
    </div>
  );
};

export default Type2;
