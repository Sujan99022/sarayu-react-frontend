import React, { useEffect, useState } from "react";
import "../../style.css";
import { useParams } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import apiClient from "../../../api/apiClient";
import { toast } from "react-toastify";
import Loader from "../../loader/Loader";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import { FaRegEye } from "react-icons/fa";

const SingleUserDashBoard = () => {
  const [localLoading, setLocalLoading] = useState(false);
  const [singleUserData, setSingleUserData] = useState({});
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      fetchSingleUser();
    }
  }, [id]);

  const fetchSingleUser = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/employee/${id}`);
      setSingleUserData(res?.data?.data);
      setLocalLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.error);
      setLocalLoading(false);
    }
  };
  if (localLoading) {
    return <Loader />;
  }
  return (
    <div className="singleuserdashboard_main_container">
      <div>
        {singleUserData?.name} dashboard{" "}
        <span
          className="singleuserdashboard_close_icon"
          onClick={() => {
            window.location.href = "/allusers/users";
          }}
        >
          <IoClose />
        </span>{" "}
      </div>
      <div>
        {singleUserData?.topics?.map((item, index) => {
          return (
            <div key={index} className="users_small_graphs_secondary_container">
              <div className="users_graphs_view_edit_icon_container">
                <div>
                  <FaRegEye />
                </div>
              </div>
              <div className="users_graphs_topic_name">
                <p>{item?.split("/")[2]}</p>
              </div>
              <SmallGraph topic={item} height={220} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SingleUserDashBoard;
