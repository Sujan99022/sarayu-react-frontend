import React, { useEffect, useState } from "react";
import DigitalViewOne from "./../graphs/digitalview/DigitalViewOne";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../loader/Loader";
import { toast } from "react-toastify";
import { setUserDetails } from "../../../redux/slices/UserDetailsSlice";
import apiClient from "../../../api/apiClient";

const DigitalMeter = () => {
  const { user } = useSelector((state) => state.userSlice);
  const dispatch = useDispatch();
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
      dispatch(setUserDetails(res?.data?.data));
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
    <div className="allusers_digitalview_main_container">
      {loggedInUser?.topics?.map((item, index) => {
        return (
          <div key={index}>
            <DigitalViewOne topic={item} />
          </div>
        );
      })}
    </div>
  );
};

export default DigitalMeter;
