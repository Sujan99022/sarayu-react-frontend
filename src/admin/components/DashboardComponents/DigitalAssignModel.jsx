import React, { useRef } from "react";
import "./style.css";
import { IoCloseOutline } from "react-icons/io5";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";

const DigitalAssignModel = ({
  setToggleAssignMeterModel,
  userEmail,
  topicMeterAssign,
}) => {
  const carouselRef = useRef(null);

  const handleRightScroll = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 400;
    }
  };

  const handleLeftScroll = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 400;
    }
  };

  return (
    <div className="_admin_assign_meter_main_container">
      <div className="_admin_assign_meter_container">
        <header>
          <p>{userEmail}</p>
          <div
            className="_admin_assign_meter_close"
            onClick={() => setToggleAssignMeterModel(false)}
          >
            <IoCloseOutline color="white" size={"20"} />
          </div>
        </header>
        <section>
          <p>{topicMeterAssign}</p>
        </section>
        <section
          ref={carouselRef}
          className="_admin_assign_meter_carousel_container"
        >
          <section
            className="_admin_assign_meter_carousel_left_button_container"
            onClick={handleLeftScroll}
          >
            <div className="_admin_assign_meter_carousel_left_button">
              <FaChevronLeft />
            </div>
          </section>
          <div>type 1</div>
          <div>type 2</div>
          <div>type 3</div>
          <div className="_admin_assign_meter_carousel_container_active_meter">
            type 4
          </div>
          <div>type 5</div>
          <div>type 6</div>
          <div>type 7</div>
          <div>type 8</div>
          <div>type 9</div>
          <div>type 10</div>
          <div>type 11</div>
          <div>type 12</div>
          <div>type 13</div>
          <div>type 14</div>
          <div>type 15</div>
          <div>type 16</div>
          <section
            className="_admin_assign_meter_carousel_right_button_container"
            onClick={handleRightScroll}
          >
            <div className="_admin_assign_meter_carousel_right_button">
              <FaChevronRight />
            </div>
          </section>
        </section>
        <section className="_admin_assign_digital_meter_and_edit_main_container">
          <div className="_admin_assign_digital_meter_edit_container">
            <div>
              <p>
                Edit the values and assign the digital meter for the selected
                topic
              </p>
              <div className="_admin_assign_digital_meter_edit_input_container">
                <input type="text" placeholder="Enter the minimum value" />
              </div>
              <div className="_admin_assign_digital_meter_edit_input_container">
                <input type="text" placeholder="Enter the maximum value" />
              </div>
              <div className="_admin_assign_digital_meter_edit_input_container">
                <select name="" id="">
                  <option value="default">Select the number of ticks</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="13">13</option>
                  <option value="14">14</option>
                  <option value="15">15</option>
                  <option value="16">16</option>
                  <option value="17">17</option>
                  <option value="18">18</option>
                  <option value="19">19</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div className="_admin_assign_digital_meter_edit_save_button">
                <button>Assign</button>
              </div>
            </div>
          </div>
          <div className="_admin_assign_digital_meter_view_container">
            <div className="_admin_assign_digital_meter_view_not_selected_message_container">
              <p>No Meter selected...!</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DigitalAssignModel;
