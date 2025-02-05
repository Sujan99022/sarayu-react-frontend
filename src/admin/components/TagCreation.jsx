import React, { useEffect, useState } from "react";
import "../index.css";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import AllTopicsList from "./DashboardComponents/AllTopicsList";
import { MdDelete } from "react-icons/md";
import { IoIosWarning } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

const TagCreation = () => {
  const [createQuery, setCreateQuery] = useState("");
  const [topiCreated, setTopicCreated] = useState(false);
  const [createTagnameValidationError, setCreateTagnameValidationError] =
    useState("");
  const [recetntFiveTopic, setRecentFiveTopic] = useState([]);
  const [showTopicDeleteModel, setShowTopicDeleteModel] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState("");

  const [topicList, setTopicList] = useState([]);
  const [topiListFilter, setTopicListFilter] = useState([]);

  useEffect(() => {
    fetchAllTopics();
  }, [topiCreated]);

  const handleCreateQueryChange = (e) => {
    setCreateTagnameValidationError("");
    setCreateQuery(e.target.value);
  };

  const storeSubscribedTopic = async (topic) => {
    try {
      await apiClient.post(`/auth/subscribedTopics`, { topic });
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchAllTopics = async () => {
    try {
      const response = await apiClient("/mqtt/get-all-tagname");
      setTopicList(response.data.data.sort((a, b) => b - a));
      setTopicListFilter(response.data.data.sort((a, b) => b - a));
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleTopicSearchFilter = (e) => {
    let query = e.target.value;
    const filteredData = topicList.filter((item) =>
      item.topic.toLowerCase().includes(query.toLowerCase())
    );
    setTopicListFilter(filteredData);
  };

  useEffect(() => {
    fetchRecentFiveTopics();
  }, []);

  const fetchRecentFiveTopics = async () => {
    try {
      const res = await apiClient.get("/mqtt/get-recent-5-tagname");
      setRecentFiveTopic(res.data.data);
      setTopicCreated(!topiCreated);
      setShowTopicDeleteModel(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleCreateTopic = async () => {
    const regex =
      /^([a-zA-Z0-9_]+\/[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+)\|([a-zA-Z0-9_/]+)$/;
    if (!regex.test(createQuery)) {
      return setCreateTagnameValidationError("admin_alltopics_error_color");
    }
    try {
      await apiClient.post("/mqtt/create-tagname", {
        topic: createQuery,
      });
      toast.success("TagName created successfully!");
      await fetchRecentFiveTopics();
      setCreateQuery("");
      setCreateTagnameValidationError("");
      setTopicCreated(!topiCreated);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCreateAndSubscribeTopic = async () => {
    const regex =
      /^([a-zA-Z0-9_]+\/[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+)\|([a-zA-Z0-9_/]+)$/;
    if (!regex.test(createQuery)) {
      return setCreateTagnameValidationError("admin_alltopics_error_color");
    }
    try {
      await apiClient.post("/mqtt/create-tagname", {
        topic: createQuery,
      });
      toast.success("TagName created successfully!");
      await apiClient.post("/mqtt/subscribe", {
        topic: createQuery,
      });
      storeSubscribedTopic(createQuery);
      toast.success(`Subscribed to ${createQuery} successfully!`);
      await fetchRecentFiveTopics();
      setCreateQuery("");
      setCreateTagnameValidationError("");
      setTopicCreated(!topiCreated);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleDeleteTopic = async () => {
    try {
      let encodedTopic = encodeURIComponent(topicToDelete);
      await apiClient.delete(`/mqtt/delete-topic/${encodedTopic}`);
      toast.success(`${topicToDelete} deleted successfully!`);
      await fetchRecentFiveTopics();
      setTopicCreated(!topiCreated);
      setShowTopicDeleteModel(false);
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div
      className="dashboard_main_section_container"
      data-aos="zoom-in"
      data-aos-duration="300"
      data-aos-once="true"
    >
      {showTopicDeleteModel && (
        <div className="admin_tagcreation_delete_model">
          <div>
            <div className="my-3">
              <IoIosWarning size={"35"} color="red" />
            </div>
            <p>Are you sure you want to delete tagname : {topicToDelete}</p>
            <div>
              <button onClick={handleDeleteTopic}>Delete</button>
              <button onClick={() => setShowTopicDeleteModel(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <section className="admin_tagcreation_main_container">
        <div className="admin_tagcreation_container">
          <div>
            <h4>Create TagName</h4>
            <p
              className={`admin_tagcreation_container_note ${createTagnameValidationError}`}
            >
              Format: part1/part2/part3|unit
            </p>
            <input
              type="text"
              value={createQuery}
              onChange={handleCreateQueryChange}
              placeholder="Enter the topic name (e.g., company/device/tagname|unit)"
            />
            <div className="admin_tagcreation_button_container">
              <button onClick={handleCreateTopic}>Create</button>
              <button onClick={handleCreateAndSubscribeTopic}>
                Create & Subscribe
              </button>
            </div>
          </div>
          <div className="admin_create_topics_hr"></div>
          <div className="admin_tagcreation_subscribeall_container">
            <div className="admin_tagcreation_subscribeall_recent_5_container">
              <div>
                <p>Recent 5 Topics</p>
              </div>
              <div className="admin_tagcreation_subscribeall_recent_5_table_container">
                <table className="admin_tagcreation_subscribeall_recent_5_table">
                  <thead>
                    <tr>
                      <th>TagName</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recetntFiveTopic?.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.topic}</td>
                          <td>
                            <MdDelete
                              onClick={() => [
                                setTopicToDelete(item.topic),
                                setShowTopicDeleteModel(true),
                              ]}
                              color="red"
                              size={"20"}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="admin_create_topics_hr"></div>
            <div className="admin_topiccreation_subscribe_all_button">
              <IoIosWarning size={"20"} /> Subscribe to All TagNames
            </div>
          </div>
        </div>
        <div className="admin_tagcreation_all_topics_container">
          <div className="admin_alltopics_searchbar_container">
            <input
              type="text"
              onChange={handleTopicSearchFilter}
              placeholder="Search by tagname"
            />
            <button>
              <IoSearch />
            </button>
          </div>
          <AllTopicsList
            topiCreated={topiCreated}
            setTopicToDelete={setTopicToDelete}
            topiListFilter={topiListFilter}
            topicList={topicList}
            storeSubscribedTopic={storeSubscribedTopic}
            setShowTopicDeleteModel={setShowTopicDeleteModel}
          />
        </div>
      </section>
    </div>
  );
};

export default TagCreation;
