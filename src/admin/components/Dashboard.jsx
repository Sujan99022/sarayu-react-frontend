import React, { useState } from "react";
import "../index.css";
import { MdSpaceDashboard } from "react-icons/md";
import DashboardCTitle from "../common/DashboardCTitle";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import AllTopicsList from "./DashboardComponents/AllTopicsList";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";

const Dashboard = () => {
  const [createQuery, setCreateQuery] = useState("");
  const [topiCreated, setTopicCreated] = useState(false);
  const [showCreateTagFields, setShowCreateTagFields] = useState(false);
  const [createTagnameValidationError, setCreateTagnameValidationError] =
    useState("");

  const handleCreateQueryChange = (e) => {
    setCreateTagnameValidationError("");
    setCreateQuery(e.target.value);
  };

  const handleCreateTopic = async () => {
    if (createQuery.split("/").length !== 3) {
      return setCreateTagnameValidationError(
        "Topic must be in the format: part1/part2/part3 (e.g., company/device/tagname)."
      );
    }
    try {
      await apiClient.post("/mqtt/create-tagname", {
        topic: createQuery,
      });
      toast.success("TagName created successfully!");
      if (createQuery.split("/").length === 3) {
        setCreateQuery(
          createQuery.split("/")[0] + "/" + createQuery.split("/")[1] + "/"
        );
        setCreateTagnameValidationError("");
      } else {
        setCreateQuery("");
        setCreateTagnameValidationError("");
      }
      setTopicCreated(!topiCreated);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCreateAndSubscribeTopic = async () => {
    if (createQuery.split("/").length !== 3) {
      return setCreateTagnameValidationError(
        "Topic must be in the format: part1/part2/part3 (e.g., company/device/tagname)."
      );
    }
    try {
      await apiClient.post("/mqtt/create-tagname", {
        topic: createQuery,
      });
      toast.success("TagName created successfully!");
      await apiClient.post("/mqtt/subscribe", {
        topic: createQuery,
      });
      toast.success(`Subscribed to ${createQuery} successfully!`);
      if (createQuery.split("/").length === 3) {
        setCreateQuery(
          createQuery.split("/")[0] + "/" + createQuery.split("/")[1] + "/"
        );
        setCreateTagnameValidationError("");
      } else {
        setCreateQuery("");
        setCreateTagnameValidationError("");
      }
      setTopicCreated(!topiCreated);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div
      className="dashboard_main_section_container"
      data-aos="zoom-in"
      data-aos-duration="300"
      data-aos-once="true"
    >
      <DashboardCTitle title={"Dashboard"} icon={<MdSpaceDashboard />} />
      <div className="admin_dashboard_main_dashboard_section">
        <div className="admin_dashboard_main_dashboard_create_topic_container">
          <div
            onClick={() => setShowCreateTagFields(!showCreateTagFields)}
            className="admin_dashboard_main_dashboard_create_topic_title_container"
          >
            <p>Create TagName</p>
            <p>
              {!showCreateTagFields ? (
                <MdKeyboardDoubleArrowDown size={"24"} color="orange" />
              ) : (
                <MdKeyboardDoubleArrowUp size={"24"} color="orange" />
              )}
            </p>
          </div>
          {showCreateTagFields && (
            <div
              className="admin_dashboard_main_dashboard_create_topic_input_container"
              data-aos="fade-up"
              data-aos-duration="300"
              data-aos-once="true"
            >
              <input
                type="text"
                value={createQuery}
                onChange={handleCreateQueryChange}
                placeholder="Enter the topic name (e.g., company/device/tagname)"
              />
              {createTagnameValidationError && (
                <p className="admin_topic_creation_error-message">
                  {createTagnameValidationError}
                </p>
              )}
              <div>
                <button
                  className="admin_create_tagname_button"
                  onClick={handleCreateTopic}
                >
                  Create
                </button>
                <button
                  className="admin_create_subscribe_tagname_button"
                  onClick={handleCreateAndSubscribeTopic}
                >
                  Create & Subscribe
                </button>
              </div>
            </div>
          )}
        </div>
        <AllTopicsList topiCreated={topiCreated} />
        <div></div>
      </div>
    </div>
  );
};

export default Dashboard;
