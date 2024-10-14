import React, { useEffect, useState } from "react";
import "./style.css";
import { useSelector } from "react-redux";

const DigitalMeter = () => {
  const { currentSpeed } = useSelector((state) => state.digitalMeterSlice);
  const [activBtn, setActiveBtn] = useState("today");
  const [displayColor, setDisplayColor] = useState(
    "digital_meter_display_text_color_green"
  );

  useEffect(() => {
    if (currentSpeed <= 20) {
      setDisplayColor("digital_meter_display_text_color_green");
    } else if (currentSpeed > 20 && currentSpeed <= 30) {
      setDisplayColor("digital_meter_display_text_color_lightgreen");
    } else if (currentSpeed > 30 && currentSpeed <= 40) {
      setDisplayColor("digital_meter_display_text_color_yellow");
    } else if (currentSpeed > 40 && currentSpeed <= 50) {
      setDisplayColor("digital_meter_display_text_color_orange");
    } else if (currentSpeed > 50 && currentSpeed <= 110) {
      setDisplayColor("digital_meter_display_text_color_red");
    }
  }, [currentSpeed]);

  return (
    <div
      className="graph_digital_meter_main_container"
      data-aos="fade-out"
      data-aos-duration={1000}
      data-aos-once="true"
    >
      <div className="graph_digital_meter_second_container">
        <header>
          <div></div>
          <div></div>
          <div></div>
        </header>
        <p className={displayColor}>{currentSpeed}</p>
        <div>
          <section>
            <span
              className={
                activBtn === "today" &&
                `active_digital_meter_active_today_yestarday`
              }
              onClick={() => setActiveBtn("today")}
            >
              Today
            </span>
            <span
              className={
                activBtn === "yestarday" &&
                `active_digital_meter_active_today_yestarday`
              }
              onClick={() => setActiveBtn("yestarday")}
            >
              Yestarday
            </span>
          </section>
          <section>
            {activBtn === "today" && (
              <div>
                <p>Today's Max : 00</p>
                <p>Today's Avg &nbsp;: 00</p>
              </div>
            )}
            {activBtn === "yestarday" && (
              <div>
                <p>Yesterday's Max : 00</p>
                <p>Yesterday's Avg &nbsp;: 00</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DigitalMeter;
