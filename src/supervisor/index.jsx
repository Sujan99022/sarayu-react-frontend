import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../redux/slices/UniversalLoader";
import { HiInformationCircle } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { RiDashboard2Line } from "react-icons/ri";
import { IoKey } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import GraphPNG from "../utils/graph.png";
import { setUserDetails } from "../redux/slices/UserDetailsSlice";
import apiClient from "../api/apiClient";
import "./style.css";
import { handleWarningModel } from "../redux/slices/UserSlice";
import TestChart from "./graphs/TestChart";
import TradeViewGraph from "./graphs/tradeViewGraph/TradeViewGraph";

const Supervisor = () => {
  const { user } = useSelector((state) => state.userSlice);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [operatorsList, setOperatorsList] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeNavBtn, setActiveNavBtn] = useState("home");
  const [closeNote, setCloseNote] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, []);
  useEffect(() => {
    fetchAllOperators();
  }, []);

  const fetchUserDetails = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiClient.get(`/auth/supervisor/${user.id}`);
      setLoggedInUser(res?.data?.data);
      dispatch(setUserDetails(res?.data?.data));
      dispatch(setLoading(false));
    } catch (error) {
      toast.error("Something went wrong!");
      dispatch(setLoading(false));
    }
  };

  const fetchAllOperators = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiClient.get(
        `/auth/supervisor/getalloperators/${user?.id}`
      );
      dispatch(setOperatorsList(res?.data?.data));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="manager_dashboard_main_container">
      <div className="manager_navbar_container">
        <nav className="manager_navbar_nav">
          <div>
            <p>
              {loggedInUser?.company?.name.length >= 10
                ? loggedInUser?.company?.name.slice(0, 10) + "..."
                : loggedInUser?.company?.name.slice(0, 10)}
            </p>
          </div>
          <div className="manager_navbar_nav_desktop_view_links">
            <p className="manager_navbar_nav_desktop_view_links_active">
              Dashboard
            </p>
            <p>Contact Us</p>
            <p>Logout</p>
          </div>
          <div className="manager_navbar_nav_mobile_view_open_btn">
            <HiInformationCircle
              onClick={() => setShowUserDetails(true)}
              style={{ cursor: "pointer" }}
              size={"24px"}
            />
          </div>
        </nav>
        <section className="user_section_body_container user_supervisor_section_body_container">
          {/* user details model start */}
          {showUserDetails && (
            <div className="user_details_card_container">
              <div
                data-aos="fade-out"
                data-aos-duration="300"
                data-aos-once="true"
              >
                <div>
                  <FaRegUser /> {loggedInUser?.name}
                </div>
                <div>
                  <MdEmail /> {loggedInUser?.email}
                </div>
                <div>
                  <FaPhoneAlt />
                  {loggedInUser?.phonenumber
                    ? loggedInUser?.phonenumber
                    : "+xx xxxxxxxxxx"}
                </div>
                <hr />
                <div>{loggedInUser?.company?.name}</div>
                <div>{loggedInUser?.company?.email}</div>
                <div>{loggedInUser?.company?.address}</div>
                <hr />
                <button>
                  <IoClose onClick={() => setShowUserDetails(false)} />
                </button>
              </div>
            </div>
          )}
          {/* user details model ends */}
          {closeNote && activeNavBtn === "home" && (
            <section
              className="supervisor_note_model_container"
              data-aos="fade-out"
              data-aos-duration="500"
              data-aos-once="true"
            >
              <div>
                <p>
                  Note : Lorem ipsum dolor sit amet consectetur adipisicing
                  elit. Placeat, neque.
                </p>
                <span className="note_close_icon">
                  <IoClose onClick={() => setCloseNote(false)} />
                </span>
              </div>
            </section>
          )}
          {/* users under supervisor dispaly starts here */}
          {activeNavBtn === "home" && (
            <div className="supervisor_display_all_operators_container">
              <p className="text-a">Operators({operatorsList.length})</p>
              {operatorsList &&
                operatorsList?.map((item, index) => {
                  return (
                    <div
                      key={item._id}
                      data-aos="fade-up"
                      data-aos-duration={100 + index * 50}
                      data-aos-once="true"
                    >
                      <div>
                        {index + 1}.{" "}
                        {item.email.length <= 30
                          ? item.email
                          : item.email.slice(0, 30) + "..."}
                      </div>
                      <div>
                        <img src={GraphPNG} alt="graph png" />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
          {/* users under supervisor dispaly ends here */}
          {/* supervisor graph container starts here */}
          {activeNavBtn === "graph" && (
            <div
              data-aos="fade-out"
              data-aos-duration="1000"
              data-aos-once="true"
            >
              {/* <TestChart /> */}
              <TradeViewGraph />
            </div>
          )}
          {/* supervisor graph container ends here */}
        </section>
        <div className="footer_navigationbar_mobile_view">
          <div
            className={
              activeNavBtn === "home" &&
              `footer_navigationbar_mobile_view_active`
            }
          >
            <FaHome onClick={() => setActiveNavBtn("home")} />
            {activeNavBtn === "home" && <span>Home</span>}
          </div>
          <div
            className={
              activeNavBtn === "graph" &&
              `footer_navigationbar_mobile_view_active`
            }
          >
            <RiDashboard2Line onClick={() => setActiveNavBtn("graph")} />
            {activeNavBtn === "graph" && <span>Graph</span>}
          </div>
          <div
            className={
              activeNavBtn === "search" &&
              `footer_navigationbar_mobile_view_active`
            }
          >
            <IoSearch onClick={() => setActiveNavBtn("search")} />
            {activeNavBtn === "search" && <span>Search</span>}
          </div>
          <div
            className={
              activeNavBtn === "office" &&
              `footer_navigationbar_mobile_view_active`
            }
          >
            <IoKey onClick={() => setActiveNavBtn("office")} />
            {activeNavBtn === "office" && <span>Password</span>}
          </div>
          <div>
            <MdLogout onClick={() => dispatch(handleWarningModel())} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supervisor;
