import React, { useEffect, useState } from "react";
import "./style.css";
import apiClient from "../../../api/apiClient";
import { MdDelete } from "react-icons/md";
import { MdOutlineAssignmentInd } from "react-icons/md";
import SubscritionBtn from "./SubscritionBtn";

const AllTopicsList = ({ topiCreated }) => {
  const [topicList, setTopicList] = useState([]);

  useEffect(() => {
    fetchAllTopics();
  }, [topiCreated]);
  const fetchAllTopics = async () => {
    try {
      const response = await apiClient("/mqtt/get-all-tagname");
      setTopicList(response.data.data.sort((a, b) => b - a));
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="admin_alltopics_table_all_cred_container">
      <div className="admin_alltopics_table_all_cred_scrollable-table">
        <table className="admin_alltopics_table_all_cred_table">
          <thead>
            <tr>
              <th>TagName [{topicList.length}]</th>
              <th>Status</th>
              <th>Delete</th>
              <th>Assign</th>
            </tr>
          </thead>
          <tbody>
            {topicList?.map((item, index) => (
              <tr key={index}>
                <td>{item.topic}</td>
                <td>
                  <SubscritionBtn topic={item.topic} />
                </td>
                <td>
                  <MdDelete
                    size={"22"}
                    color="red"
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td>
                  <MdOutlineAssignmentInd
                    size={"22"}
                    color="green"
                    style={{ cursor: "pointer" }}
                  />
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
