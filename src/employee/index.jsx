import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setLoading } from "../redux/slices/UniversalLoader";
import { IoCloseSharp } from "react-icons/io5";
import { IoExitOutline } from "react-icons/io5";
import { IoMdMenu } from "react-icons/io";
import { setUserDetails } from "../redux/slices/UserDetailsSlice";
import apiClient from "../api/apiClient";
import "./style.css";
import { handleWarningModel } from "../redux/slices/UserSlice";
import { HiInformationCircle } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { IoKey } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { VscGraphLine } from "react-icons/vsc";
import { BsSpeedometer2 } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import RealtimeChartEmployee from "./tradeViewGraphEmployee/TradeViewGraphEmployee";

const Employee = () => {
  const { user } = useSelector((state) => state.userSlice);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeNavBtn, setActiveNavBtn] = useState("graph");
  const dispatch = useDispatch();

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, []);

  const fetchUserDetails = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiClient.get(`/auth/employee/${user.id}`);
      setLoggedInUser(res?.data?.data);
      dispatch(setUserDetails(res?.data?.data));
      dispatch(setLoading(false));
    } catch (error) {
      toast.error(error?.response?.data?.error);
      dispatch(setLoading(false));
    }
  };

  const handleChangePassword = () => {};

  return (
    <>
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
            <p
              className={
                activeNavBtn === "graph" &&
                `manager_navbar_nav_desktop_view_links_active`
              }
              onClick={() => setActiveNavBtn("graph")}
            >
              <VscGraphLine /> Graph
            </p>
            <p
              className={
                activeNavBtn === "digitalmeter" &&
                `manager_navbar_nav_desktop_view_links_active`
              }
              onClick={() => setActiveNavBtn("digitalmeter")}
            >
              <BsSpeedometer2 /> Digital
            </p>
            <p
              className={
                activeNavBtn === "password" &&
                `manager_navbar_nav_desktop_view_links_active`
              }
              onClick={() => setActiveNavBtn("password")}
            >
              <IoKey /> Change Password
            </p>
            <p onClick={() => dispatch(handleWarningModel())}>
              <MdLogout /> Logout
            </p>
          </div>
          <div className="manager_navbar_nav_mobile_view_open_btn">
            <HiInformationCircle
              onClick={() => setShowUserDetails(true)}
              style={{ cursor: "pointer" }}
              size={"24px"}
            />
          </div>
        </nav>
        <div
          className={`employee-graph-cover ${
            activeNavBtn !== "graph" && "employee-graph-cover_hide_graph"
          }`}
        ></div>
        <div>
          <RealtimeChartEmployee selectedEmployee={user} email={user.email} />
        </div>
        {activeNavBtn === "digitalmeter" && (
          <div className="employee-digital-meter">Digital merter</div>
        )}
        {activeNavBtn === "password" && (
          <div className="supervisor_change_password_section employee_change_password">
            <p className="text-center">Change Password</p>
            <section>
              <div>
                <label htmlFor="oldpassword">Enter active password</label>
                <input
                  type="password"
                  id="oldpassword"
                  name="activePassword"
                  placeholder="Enter password here..."
                />
              </div>
              <div>
                <label htmlFor="newpassword">Enter new password</label>
                <input
                  type="password"
                  id="newpassword"
                  name="newPassword"
                  placeholder="Enter password here..."
                />
              </div>
              <div>
                <label htmlFor="confirmpassword">Confirm new password</label>
                <input
                  type="password"
                  id="confirmpassword"
                  name="confirmPassword"
                  placeholder="Enter password here..."
                />
              </div>
              <div>
                <button onClick={handleChangePassword}>Change</button>
              </div>
            </section>
          </div>
        )}
        <div className="footer_navigationbar_mobile_view">
          <div
            className={
              activeNavBtn === "graph" &&
              `footer_navigationbar_mobile_view_active`
            }
          >
            <VscGraphLine onClick={() => setActiveNavBtn("graph")} />
            {activeNavBtn === "graph" && <span>Graph</span>}
          </div>
          <div
            className={
              activeNavBtn === "digitalmeter" &&
              `footer_navigationbar_mobile_view_active`
            }
          >
            <BsSpeedometer2
              className="mb-1"
              onClick={() => setActiveNavBtn("digitalmeter")}
            />
            {activeNavBtn === "digitalmeter" && <span>Digital</span>}
          </div>
          <div
            className={
              activeNavBtn === "password" &&
              `footer_navigationbar_mobile_view_active`
            }
          >
            <IoKey onClick={() => setActiveNavBtn("password")} />
            {activeNavBtn === "password" && <span>Password</span>}
          </div>
          <div>
            <MdLogout onClick={() => dispatch(handleWarningModel())} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Employee;
