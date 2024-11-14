import React, { useEffect, useState } from "react";
import "../../style.css";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiClient from "../../../api/apiClient";
import { CiBookmarkRemove } from "react-icons/ci";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import Loader from "../../loader/Loader";

const Favorite = () => {
  const { user } = useSelector((state) => state.userSlice);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);
  const fetchUserDetails = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      setLoggedInUser(res?.data?.data);
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
    <div>
      <div className="users_small_graphs_primary_container">
        {loggedInUser?.favorites?.map((item, index) => {
          return (
            <div key={index} className="users_small_graphs_secondary_container">
              <div className="users_graphs_view_edit_icon_container">
                <div>
                  <CiBookmarkRemove size={"24"} />
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

export default Favorite;
