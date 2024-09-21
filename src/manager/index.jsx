import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setLoading } from "../redux/slices/UniversalLoader";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { IoExitOutline } from "react-icons/io5";
import { IoMdMenu } from "react-icons/io";
import { setUserDetails } from "../redux/slices/UserDetailsSlice";
import apiClient from "../api/apiClient";
import { IoSearch } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { RiDashboard2Line } from "react-icons/ri";
import { ImOffice } from "react-icons/im";
import { FaUser } from "react-icons/fa";
import "./style.css";
import { handleWarningModel } from "../redux/slices/UserSlice";

const Manager = () => {
  const { user } = useSelector((state) => state.userSlice);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [activeNavBtn, setActiveNavBtn] = useState("home");
  const dispatch = useDispatch();

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, []);

  const fetchUserDetails = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiClient.post(`/auth/manager/${user.id}`);
      setLoggedInUser(res?.data?.data);
      dispatch(setUserDetails(res?.data?.data));
      dispatch(setLoading(false));
    } catch (error) {
      toast.error("Something went wrong!");
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
            <IoMdMenu
              onClick={() => setShowMenu(true)}
              style={{ cursor: "pointer" }}
              size={"25px"}
            />
          </div>
        </nav>
        <section
          className={`manager_navbar_nav_mobile_view_links ${
            showMenu && "manager_navbar_nav_mobile_view_links_show"
          }`}
        >
          <div>
            <div>
              <section>
                <span>
                  <MdOutlineKeyboardDoubleArrowRight
                    size={"20px"}
                    style={{ cursor: "pointer" }}
                    className="close_mobile_menu_icon"
                    onClick={() => setShowMenu(false)}
                  />
                </span>
                <span>
                  {/* <img
                    src="https://sarayuinfotech.in/images/sarayu/Logo/sarayu-comp-icon.png"
                    alt="sarayu logo"
                  /> */}
                  SARAYU
                </span>
              </section>
              <footer
                className="manager_navbar_nav_mobile_view_links_footer"
                onClick={() => dispatch(handleWarningModel())}
              >
                <div className="manager_navbar_nav_mobile_view_links_footer_side_line"></div>
                <div className="manager_navbar_nav_mobile_view_links_footer_details">
                  <div>
                    {loggedInUser?.name} <IoExitOutline />
                  </div>
                  <div>{loggedInUser?.email}</div>
                </div>
              </footer>
              <div className="manager_navbar_nav_mobile_view_links_container">
                <p>Dashboard</p>
                <p>Contact Us</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="footer_navigationbar_mobile_view">
        <div
          className={
            activeNavBtn === "home" && `footer_navigationbar_mobile_view_active`
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
          <ImOffice onClick={() => setActiveNavBtn("office")} />
          {activeNavBtn === "office" && <span>Office</span>}
        </div>
        <div
          className={
            activeNavBtn === "user" && `footer_navigationbar_mobile_view_active`
          }
        >
          <FaUser onClick={() => setActiveNavBtn("user")} />
          {activeNavBtn === "user" && <span>User</span>}
        </div>
      </div>
    </div>
  );
};

export default Manager;
