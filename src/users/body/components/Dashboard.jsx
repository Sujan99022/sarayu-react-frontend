import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../../redux/slices/UniversalLoader";
import apiClient from "../../../api/apiClient";
import { setUserDetails } from "../../../redux/slices/UserDetailsSlice";
import { toast } from "react-toastify";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import "../../style.css";
import { FaRegEye } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";

const Dashboard = () => {
  const { user } = useSelector((state) => state.userSlice);
  const dispatch = useDispatch();
  const [loggedInUser, setLoggedInUser] = useState({});
  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);
  const fetchUserDetails = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      setLoggedInUser(res?.data?.data);
      dispatch(setUserDetails(res?.data?.data));
      dispatch(setLoading(false));
    } catch (error) {
      toast.error(error?.response?.data?.error);
      dispatch(setLoading(false));
    }
  };
  console.log(loggedInUser);
  return (
    <div>
      <div className="users_small_graphs_primary_container">
        {loggedInUser?.topics?.map((item, index) => {
          return (
            <div key={index} className="users_small_graphs_secondary_container">
              <div className="users_graphs_view_edit_icon_container">
                <div>
                  <FaRegEye />
                </div>
                <div>
                  <FiEdit2 />
                </div>
              </div>
              <div className="users_graphs_topic_name">
                <p>{item}</p>
              </div>
              <SmallGraph topic={item} height={280} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
