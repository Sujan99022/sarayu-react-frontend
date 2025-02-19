import React, { useEffect, useState, useCallback, useMemo } from "react";
import "../../style.css";
import { useSelector, useDispatch } from "react-redux";
import apiClient from "../../../api/apiClient";
import { setUserDetails } from "../../../redux/slices/UserDetailsSlice";
import { toast } from "react-toastify";
import Loader from "../../loader/Loader";
import LiveDataTd from "../common/LiveDataTd";
import { FaRegBookmark, FaDigitalOcean } from "react-icons/fa";
import { BsBookmarkStarFill } from "react-icons/bs";
import { BiSolidReport } from "react-icons/bi";
import WeekTd from "../common/WeekTd";
import YestardayTd from "../common/YestardayTd";
import TodayTd from "../common/TodayTd";
import { VscGraph } from "react-icons/vsc";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { IoMdArrowDropup } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMdArrowDropleft } from "react-icons/io";
import { IoMdArrowDropright } from "react-icons/io";

const Dashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userSlice);
  const [favoriteList, setFavoriteList] = useState([]);
  const [graphwlList, setGraphwlList] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "none" });
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 20;

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
      toast.error(error?.response?.data?.error || "Failed to fetch user details");
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch, user.id, user.role]);

  useEffect(() => {
    if (user.id) fetchUserDetails();
  }, [user.id, fetchUserDetails]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  // Handle adding a topic to favorites
  const handleAddFavorite = async (topic) => {
    try {
      await apiClient.post(`/auth/${user.role}/${user.id}/favorites`, { topic });
      setFavoriteList((prev) => [...prev, topic]);
      toast.success("Tagname added to watchlist");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to add topic to favorites");
    }
  };

  // Handle removing a topic from favorites
  const handleRemoveFavorite = async (topic) => {
    try {
      await apiClient.delete(`/auth/${user.role}/${user.id}/favorites`, { data: { topic } });
      setFavoriteList((prev) => prev.filter((fav) => fav !== topic));
      toast.success("Topic removed from watchlist");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to remove topic from watchlist");
    }
  };

  // Handle adding a topic to graph watchlist
  const handleAddGraphwl = async (topic) => {
    try {
      await apiClient.post(`/auth/${user.role}/${user.id}/graphwl`, { topic });
      setGraphwlList((prev) => [...prev, topic]);
      toast.success("Tagname added to graph watchlist");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to add topic to graph watchlist");
    }
  };

  // Handle removing a topic from graph watchlist
  const handleRemoveGraphwl = async (topic) => {
    try {
      await apiClient.delete(`/auth/${user.role}/${user.id}/graphwl`, { data: { topic } });
      setGraphwlList((prev) => prev.filter((fav) => fav !== topic));
      toast.success("Topic removed from graph watchlist");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to remove topic from graph watchlist");
    }
  };

  // Handle pagination click
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Sorting functionality
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = "none";
      } else {
        direction = "asc";
      }
    }
    setSortConfig(direction === "none" ? { key: null, direction: "none" } : { key, direction });
  };

  // Get sorting symbol (↑, ↓, ↔)
  const getSortSymbol = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? <IoMdArrowDropup /> : sortConfig.direction === "desc" ? <IoMdArrowDropdown /> : "↔";
    }
    return "↔";
  };

  // Parse topics and add dummy data for sorting
  const parsedTopics = useMemo(() => {
    return loggedInUser?.topics?.map((topic) => {
      const [path, unit] = topic.split("|");
      const tagName = path.split("/")[2];
      return {
        topic,
        tagName,
        unit: unit || "-",
        isFFT: unit === "fft",
        weekMax: Math.random() * 100, // Replace with actual data
        yesterdayMax: Math.random() * 100, // Replace with actual data
        todayMax: Math.random() * 100, // Replace with actual data
      };
    }) || [];
  }, [loggedInUser?.topics]);

  // Filter parsed topics based on search query
  const filteredParsedTopics = useMemo(() => {
    if (!searchQuery.trim()) return parsedTopics;
    const query = searchQuery.trim().toLowerCase();
    return parsedTopics.filter((topic) =>
      topic.tagName.toLowerCase().includes(query)
    );
  }, [parsedTopics, searchQuery]);

  // Sort parsed topics based on sortConfig
  const sortedParsedTopics = useMemo(() => {
    let sortableItems = [...filteredParsedTopics];
    if (sortConfig.key && sortConfig.direction !== "none") {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredParsedTopics, sortConfig]);

  // Pagination logic
  const pageCount = Math.ceil(sortedParsedTopics.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = sortedParsedTopics.slice(offset, offset + itemsPerPage);

  if (localLoading) return <Loader />;

  return (
    <div className="allusers_dashboard_main_container">
      {/* Search Bar */}
      <div style={{ maxWidth: "100vw", margin: "20px auto", padding: "0 15px" }}>
        <input
          type="text"
          placeholder="Search by tag name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            borderRadius: "25px",
            padding: "7px 17px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />
      </div>

      <div className="alluser_alloperators_container">
        <div className="alluser_alloperators_scrollable-table">
          <table className="alluser_alloperators_table">
            <thead>
              <tr>
                <th>Tag name</th>
                <th onClick={() => handleSort("weekMax")} style={{ cursor: "pointer" }}>
                  Week's max {getSortSymbol("weekMax")}
                </th>
                <th onClick={() => handleSort("yesterdayMax")} style={{ cursor: "pointer" }}>
                  Yesterday's max {getSortSymbol("yesterdayMax")}
                </th>
                <th onClick={() => handleSort("todayMax")} style={{ cursor: "pointer" }}>
                  Today's max {getSortSymbol("todayMax")}
                </th>
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
              {currentItems.map(({ topic, tagName, unit, isFFT }, index) => (
                <tr key={`${topic}-${index}`}>
                  <td>{tagName}</td>
                  <WeekTd topic={topic} />
                  <YestardayTd topic={topic} />
                  <TodayTd topic={topic} />
                  <LiveDataTd topic={topic} />
                  <td>{unit}</td>
                  <td>
                    {!isFFT && (
                      <BiSolidReport
                        size={20}
                        style={{ cursor: "pointer" }}
                        className="icon"
                        onClick={() => navigate(`/allusers/report/${encodeURIComponent(topic)}`)}
                      />
                    )}
                  </td>
                  <td>
                    <LuLayoutDashboard
                      size={20}
                      style={{ cursor: "pointer" }}
                      className="icon"
                      onClick={() => navigate(`/allusers/layoutview/${encodeURIComponent(topic)}/${loggedInUser?.layout}`)}
                    />
                  </td>
                  <td>
                    {!isFFT && (
                      <MdEdit
                        size={20}
                        style={{ cursor: "pointer" }}
                        className="icon"
                        onClick={() => navigate(`/allusers/editsinglegraph/${encodeURIComponent(topic)}`)}
                      />
                    )}
                  </td>
                  <td className="allusers_dashboard_graph_digital_td">
                    <button
                      onClick={() => navigate(`/allusers/viewsinglegraph/${encodeURIComponent(topic)}`)}
                      style={{ background: isFFT ? "red" : "", cursor: "pointer" }}
                    >
                      <VscGraph />
                    </button>
                    {!isFFT && (
                      <button
                        onClick={() => navigate(`/allusers/singledigitalmeter/${encodeURIComponent(topic)}/${user.role}/${user.id}`)}
                      >
                        <FaDigitalOcean style={{ cursor: "pointer" }} />
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

          <div className="d-flex justify-content-center mt-4 mb-4">
            <ReactPaginate
              previousLabel="Previous"
              nextLabel="Next"
              breakLabel="..."
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={2}
              onPageChange={handlePageClick}
              containerClassName="pagination"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              activeClassName="active"
              disabledClassName="disabled"
              forcePage={currentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;