import React, { useEffect, useState } from "react";
import "./style.css";
import apiClient from "../../../api/apiClient";
import { MdDelete } from "react-icons/md";
import SubscritionBtn from "./SubscritionBtn";
import { IoSearch } from "react-icons/io5";

const AllTopicsList = ({
  topiCreated,
  setTopicToDelete,
  setShowTopicDeleteModel,
}) => {
  const [topicList, setTopicList] = useState([]);
  const [topiListFilter, setTopicListFilter] = useState([]);

  useEffect(() => {
    fetchAllTopics();
  }, [topiCreated]);

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

  return (
    <div className="admin_alltopics_table_all_cred_container">
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
      <div className="admin_alltopics_table_all_cred_scrollable-table">
        <table className="admin_alltopics_table_all_cred_table">
          <thead>
            <tr>
              <th>TagName [{topicList.length}]</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {topiListFilter?.map((item, index) => (
              <tr key={index}>
                <td>{item.topic}</td>
                <td>
                  <SubscritionBtn topic={item.topic} />
                </td>
                <td>
                  {item?.isEmpty ? (
                    <MdDelete
                      size={"22"}
                      color="red"
                      onClick={() => [
                        setTopicToDelete(item?.topic),
                        setShowTopicDeleteModel(true),
                      ]}
                    />
                  ) : (
                    <MdDelete
                      size={"22"}
                      color="gray"
                      style={{ cursor: "not-allowed" }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllTopicsList;
