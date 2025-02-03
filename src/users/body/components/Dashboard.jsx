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
import HumidityMeter from "../../../admin/components/digitalmeters/matixdigitalmeter/HumidityMeter";
import TemperatureMeter from "../../../admin/components/digitalmeters/matixdigitalmeter/TemparatureMeter";
import DualGraphPlot from "./../graphs/dualgraph/DualGraphPlot";
import PressureMeter from "../../../admin/components/digitalmeters/matixdigitalmeter/PressureMeter";
import RpmMeter from "../../../admin/components/digitalmeters/matixdigitalmeter/RPMMeter";
import VoltageMeter from "../../../admin/components/digitalmeters/matixdigitalmeter/VoltageMeter";
import Type2 from "./../../../admin/components/digitalmeters/Type2";
import VibrationMeter from "../../../admin/components/digitalmeters/matixdigitalmeter/VibrationMeter";
import UniqueMeter1 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter1";
import UniqueMeter2 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter2";
import UniqueMeter3 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter3";
import UniqueMeter4 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter4";
import UniqueMeter5 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter5";
import UniqueMeter6 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter6";
import UniqueMeter7 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter7";
import UniqueMeter8 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter8";
import UniqueMeter9 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter9";
import UniqueMeter10 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter10";
import UniqueMeter11 from "../../../admin/components/digitalmeters/uniquemeters/UniqueMeter11";

const Dashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userSlice);
  const [favoriteList, setFavoriteList] = useState([]);
  const navigate = useNavigate();

  const fetchUserDetails = useCallback(async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      const userData = res?.data?.data;
      setLoggedInUser(userData);
      dispatch(setUserDetails(userData));
      setFavoriteList(userData?.favorites || []);
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
                <th>Graph/Digital</th>
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
      {/* <TemperatureMeter topic={"sarayu/device1/decrement|v"} /> */}
      {/* <PressureMeter topic={"sarayu/device1/decrement|v"} /> */}
      {/* <HumidityMeter topic={"sarayu/device1/decrement|v"} /> */}
      {/* <Type2 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <RpmMeter topic={"sarayu/device1/decrement|v"} /> */}
      {/* <VoltageMeter topic={"sarayu/device1/decrement|v"} /> */}
      {/* <VibrationMeter topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter1 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter2 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter3 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter4 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter5 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter6 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter7 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter8 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter9 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter10 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <UniqueMeter11 topic={"sarayu/device1/decrement|v"} /> */}
      {/* <DualGraphPlot
        topic1={"sarayu/device1/decrement|v"}
        topic2={"sarayu/device1/random|n"}
        height={500}
      /> */}
    </div>
  );
};

export default React.memo(Dashboard);
