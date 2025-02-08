// Dashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import "../../style.css";
import { useSelector, useDispatch } from "react-redux";
import apiClient from "../../../api/apiClient";
import { setUserDetails } from "../../../redux/slices/UserDetailsSlice";
import { toast } from "react-toastify";
import Loader from "../../loader/Loader";
import LiveDataTd from "../common/LiveDataTd";
import { FaRegBookmark } from "react-icons/fa";
import { BsBookmarkStarFill } from "react-icons/bs";
import { BiSolidReport } from "react-icons/bi";
import WeekTd from "../common/WeekTd";
import YestardayTd from "../common/YestardayTd";
import TodayTd from "../common/TodayTd";
import { VscGraph } from "react-icons/vsc";
import { FaDigitalOcean } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdEdit } from "react-icons/md";

const Dashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userSlice);
  const [favoriteList, setFavoriteList] = useState([]);
  const [graphwlList, setGraphwlList] = useState([]);
  const navigate = useNavigate();

  const fetchUserDetails = useCallback(async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      const userData = res?.data?.data;
      setLoggedInUser(userData);
      dispatch(setUserDetails(userData));
      setFavoriteList(userData?.favorites || []);
      setGraphwlList(userData?.graphwl || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch user details"
      );
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, user.id, user.role]);

  useEffect(() => {
    if (user.id) fetchUserDetails();
  }, [user.id, fetchUserDetails]);

  const handleAddFavorite = async (topic) => {
    try {
      await apiClient.post(`/auth/${user.role}/${user.id}/favorites`, {
        topic,
      });
      setFavoriteList((prev) => [...prev, topic]);
      toast.success("Tagname added to watchlist");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to add topic to favorites"
      );
    }
  };

  const handleRemoveFavorite = async (topic) => {
    try {
      await apiClient.delete(`/auth/${user.role}/${user.id}/favorites`, {
        data: { topic },
      });
      setFavoriteList((prev) => prev.filter((fav) => fav !== topic));
      toast.success("Topic removed from watchlist");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to remove topic from watchlist"
      );
    }
  };

  const handleAddGraphwl = async (topic) => {
    try {
      await apiClient.post(`/auth/${user.role}/${user.id}/graphwl`, {
        topic,
      });
      setGraphwlList((prev) => [...prev, topic]);
      toast.success("Tagname added to graph watchlist");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to add topic to graph watchlist"
      );
    }
  };

  const handleRemoveGraphwl = async (topic) => {
    try {
      await apiClient.delete(`/auth/${user.role}/${user.id}/graphwl`, {
        data: { topic },
      });
      setGraphwlList((prev) => prev.filter((fav) => fav !== topic));
      toast.success("Topic removed from graph watchlist");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to remove topic from graph watchlist"
      );
    }
  };

  const parsedTopics = useMemo(
    () =>
      loggedInUser?.topics?.map((topic) => {
        const [path, unit] = topic.split("|");
        const tagName = path.split("/")[2];
        return { topic, tagName, unit: unit || "-", isFFT: unit === "fft" };
      }) || [],
    [loggedInUser?.topics]
  );

  if (localLoading) return <Loader />;

  return (
    <div className="allusers_dashboard_main_container">
      <div className="alluser_alloperators_container">
        <div className="alluser_alloperators_scrollable-table">
          <table className="alluser_alloperators_table">
            <thead>
              <tr>
                <th style={{ background: "red" }}>Tag name</th>
                <th>Week's max</th>
                <th>Yesterday's max</th>
                <th>Today's max</th>
                <th className="allusers_dashboard_live_data_th">Live</th>
                <th>Unit</th>
                <th>Report</th>
                <th>Layout View</th>
                <th>Edit Threshold</th>
                <th>Graph/Digital</th>
                <th>Graph[WL]</th>
                <th>Watch List</th>
              </tr>
            </thead>
            <tbody>
              {parsedTopics.map(({ topic, tagName, unit, isFFT }, index) => (
                <tr key={`${topic}-${index}`}>
                  <td style={{ background: "#34495e", color: "white" }}>
                    {tagName}
                  </td>
                  <WeekTd topic={topic} />
                  <YestardayTd topic={topic} />
                  <TodayTd topic={topic} />
                  <LiveDataTd topic={topic} />
                  <td>{unit}</td>
                  <td>
                    {!isFFT ? (
                      <BiSolidReport
                        onClick={() =>
                          navigate(
                            `/allusers/report/${encodeURIComponent(topic)}`
                          )
                        }
                        size={20}
                        style={{ cursor: "pointer" }}
                        color="gray"
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <LuLayoutDashboard
                      size={20}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(
                          `/allusers/layoutview/${encodeURIComponent(topic)}/${
                            loggedInUser?.layout
                          }`
                        )
                      }
                    />
                  </td>
                  <td> {isFFT ? "N/A" : <MdEdit size={"20"} color="rgba(0, 0, 0, 0.47)" style={{cursor:"pointer"}} onClick={() => {
                      const encodeParams = encodeURIComponent(topic);
                      navigate(`/allusers/editsinglegraph/${encodeParams}`);
                    }} />}</td>
                  <td className="allusers_dashboard_graph_digital_td">
                    <button
                      onClick={() =>
                        navigate(
                          `/allusers/viewsinglegraph/${encodeURIComponent(
                            topic
                          )}`
                        )
                      }
                      style={{ background: isFFT ? "red" : "" }}
                    >
                      <VscGraph />
                    </button>
                    {!isFFT && (
                      <button
                        onClick={() =>
                          navigate(
                            `/allusers/singledigitalmeter/${encodeURIComponent(
                              topic
                            )}/${user.role}/${user.id}`
                          )
                        }
                      >
                        <FaDigitalOcean />
                      </button>
                    )}
                  </td>
                  <td>
                    {graphwlList.includes(topic) ? (
                      <BsBookmarkStarFill
                        color="rgb(158, 32, 189)"
                        size={20}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveGraphwl(topic)}
                      />
                    ) : (
                      <FaRegBookmark
                        color="rgb(158, 32, 189)"
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleAddGraphwl(topic)}
                      />
                    )}
                  </td>
                  <td>
                    {favoriteList.includes(topic) ? (
                      <BsBookmarkStarFill
                        color="green"
                        size={20}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveFavorite(topic)}
                      />
                    ) : (
                      <FaRegBookmark
                        color="green"
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleAddFavorite(topic)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);