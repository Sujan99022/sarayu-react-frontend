import React, { useEffect, useState } from "react";
import "../../style.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../../redux/slices/UniversalLoader";
import apiClient from "../../../api/apiClient";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import { FaRegEye } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";

const AllOperators = () => {
  const { user } = useSelector((state) => state.userSlice);
  const dispatch = useDispatch();
  const [operatorsList, setOperatorsList] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    // Load the stored open index from localStorage on page load
    const storedIndex = localStorage.getItem("openOperatorIndex");
    if (storedIndex !== null) {
      setOpenIndex(Number(storedIndex));
    }
    fetchAllEmployees();
  }, [user]);

  const fetchAllEmployees = async () => {
    dispatch(setLoading(true));
    try {
      const res = await apiClient.get(
        `/auth/${user?.role}/getalloperators/${user?.id}`
      );
      setOperatorsList(res?.data?.data);
      dispatch(setLoading(false));
    } catch (error) {
      toast.error(error?.response?.data?.error);
      dispatch(setLoading(false));
    }
  };

  const handleToggle = (index) => {
    if (openIndex === index) {
      // If the clicked index is already open, close it
      localStorage.removeItem("openOperatorIndex");
      setOpenIndex(null);
      window.location.reload();
    } else {
      // Otherwise, open the clicked index
      localStorage.setItem("openOperatorIndex", index);
      window.location.reload();
    }
  };

  return (
    <div className="users_alloperators_main_container">
      {operatorsList?.map((item, index) => (
        <div key={index} className="users_alloperators_carousel_container">
          <div
            className="users_alloperators_carousel_title"
            onClick={() => handleToggle(index)} // Store and reload on click
          >
            {item?.name}
          </div>
          {openIndex === index && ( // Show only if openIndex matches
            <div className="users_alloperators_carousel_body">
              {item?.topics?.map((topic, index2) => (
                <div
                  key={index2}
                  className="users_small_graphs_secondary_container"
                >
                  {/* <div className="users_graphs_view_edit_icon_container">
                    <div>
                      <FaRegEye />
                    </div>
                    <div>
                      <FiEdit2 />
                    </div>
                  </div> */}
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
