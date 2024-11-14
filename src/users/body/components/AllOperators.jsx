import React, { useEffect, useState } from "react";
import "../../style.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiClient from "../../../api/apiClient";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import Loader from "../../loader/Loader";
import { useNavigate } from "react-router-dom";

const AllOperators = () => {
  const { user } = useSelector((state) => state.userSlice);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [selectedUser, setSelectedUser] = useState({});
  const [operatorsList, setOperatorsList] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState("asdasd");

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);

  const fetchUserDetails = async () => {
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      setLoggedInUser(res?.data?.data);
    } catch (error) {
      toast.error(error?.response?.data?.error);
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchAllEmployees();
    }
  }, [user.id]);

  const fetchAllEmployees = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(
        `/auth/${user?.role}/getalloperators/${user?.id}`
      );
      setOperatorsList(res?.data?.data);
      setLocalLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.error);
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser?.topics) {
    }
  }, [selectedUser]);

  const navigate = useNavigate();

  const handleUserClick = (id) => {
    navigate(`/allusers/singleuserdashboard/${id}`);
  };

  if (localLoading) {
    return <Loader />;
  }

  return (
    <div className="users_alloperators_new_main_container">
      {operatorsList?.map((item, index) => {
        return (
          <button key={index} onClick={() => handleUserClick(item._id)}>
            {item?.email}
          </button>
        );
      })}
    </div>
  );
};

export default AllOperators;
