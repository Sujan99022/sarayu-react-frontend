import React, { useEffect, useState } from "react";
import "../../style.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../../redux/slices/UniversalLoader";
import apiClient from "../../../api/apiClient";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import Loader from "../../loader/Loader";

const AllOperators = () => {
  const { user } = useSelector((state) => state.userSlice);
  const [loggedInUser, setLoggedInUser] = useState({});
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

  const dispatch = useDispatch();
  const [operatorsList, setOperatorsList] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    // Load the stored open index from localStorage on page load
    const storedIndex = localStorage.getItem("openOperatorIndex");
    if (storedIndex !== null) {
      setOpenIndex(Number(storedIndex));
    }
    fetchAllEmployees();
    return () => {
      localStorage.removeItem("openOperatorIndex");
    };
  }, [user]);

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

  const handleToggle = (index) => {
    if (openIndex === index) {
      localStorage.removeItem("openOperatorIndex");
      setOpenIndex(null);
      window.location.reload();
    } else {
      localStorage.setItem("openOperatorIndex", index);
      window.location.reload();
    }
  };

  if (localLoading) {
    return <Loader />;
  }

  return (
    <div className="users_alloperators_main_container">
      {operatorsList?.map((item, index) => (
        <div key={index} className="users_alloperators_carousel_container">
          <div
            className="users_alloperators_carousel_title"
            onClick={() => handleToggle(index)}
          >
            <p>{item?.name}</p>
            <p>{item?.email}</p>
            <p>{item?.phonenumber}</p>
            <p>{item?.topics?.length}</p>
          </div>
          {openIndex === index && (
            <div className="users_alloperators_carousel_body">
              {item?.topics?.map((topic, index2) => (
                <div
                  key={index2}
                  className="users_small_graphs_secondary_container"
                >
                  <div className="users_graphs_view_edit_icon_container">
                    <div>
                      {loggedInUser.favorites?.includes(topic) ? (
                        <FaCheck color="green" />
                      ) : (
                        <IoMdAddCircleOutline color="blue" />
                      )}
                    </div>
                  </div>
                  <div className="users_graphs_topic_name">
                    <p>{topic?.split("/")[2]}</p>
                  </div>
                  <SmallGraph topic={topic} height={280} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AllOperators;
