import React, { useEffect, useState } from "react";
import "./Navbar.css";
import "../style.css";
import { handleWarningModel } from "../../redux/slices/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { FaUserCheck } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { IoClose } from "react-icons/io5"; 
import { handlToggleMenu } from "../../redux/slices/NavbarSlice";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import { PiBuildingOfficeBold } from "react-icons/pi";
import ChangePassword from "./../body/components/ChangePassword";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiMiniBuildingOffice } from "react-icons/hi2";
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  const { user } = useSelector((state) => state.userSlice);
  const dispatch = useDispatch();
  const { showMenu } = useSelector((state) => state.NavBarSlice);
  const navigate = useNavigate();

  const [loggedInUser, setLoggedInUser] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [changePasswordModel, setChangePasswordModel] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);

  // Add useEffect for updating date and time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '-');

  const formattedTime = currentDateTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const fetchUserDetails = async () => {
    setLocalLoading(true);
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      setLoggedInUser(res?.data?.data);
      setLocalLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.error);
      setLocalLoading(false);
    }
  };

  return (
    <>
    <div className="users_navbar_separate_container">
      <div className="users_navbar_separate_first_div">
        <div>
        <img src="https://sarayuinfotech.in/images/sarayu/Logo/sarayu-comp-icon.png" alt="company logo" />
        </div>
        <div>
          <p>Sarayu IOT</p>
        </div>
      </div>
      <div className="users_navbar_separate_second_div">
        <p>Sarayu Infotech Solutions Pvt. Ltd.</p>
        <p>177 12th A Cross, Mahalakshmipuram, 2nd Stage, Bengaluru, Karnataka 560086</p>
        <p><span>{formattedDate}</span><span>{formattedTime}</span></p>
      </div>
      <div className="users_navbar_separate_thrid_div">
        <p><HiMiniBuildingOffice style={{color:"red"}}/> Company       : {loggedInUser?.company?.name}</p>
        <p><FaUser style={{color:"red"}} /> Logged in as : {loggedInUser?.name}</p>
      </div>
    </div>
      <div className="users_navbar_container">
        <div>
          <NavLink className={"users_navbar_link"} to={"/allusers/dashboard"}>
            Dashboard
          </NavLink>
          <div className="users_navbar_link_separator"></div>
          <NavLink className={"users_navbar_link"} to={"/allusers/graphs"}>
            Graphs[WL]
          </NavLink>
          <div className="users_navbar_link_separator"></div>
          <NavLink
            className={"users_navbar_link"}
            to={"/allusers/dualtopicdashboard"}
          >
            MultiGraphPlot
          </NavLink>
          <div className="users_navbar_link_separator"></div>
          <NavLink className={"users_navbar_link"} to={"/allusers/favorites"}>
            Watch list
          </NavLink>
          <div className="users_navbar_link_separator"></div>
          <NavLink
            className={"users_navbar_link"}
            to={"/allusers/digitalmeter"}
          >
            Digital meter
          </NavLink>
          {(user.role === "supervisor" || user.role === "manager") && (
            <>
              <div className="users_navbar_link_separator"></div>
              <NavLink className={"users_navbar_link"} to={"/allusers/users"}>
                Operators
              </NavLink>{" "}
            </>
          )}
          {user.role === "manager" && (
            <>
              <div className="users_navbar_link_separator"></div>
              <NavLink
                className={"users_navbar_link"}
                to={"/allusers/supervisors"}
              >
                Supervisors
              </NavLink>{" "}
            </>
          )}
          <div className="users_navbar_link_separator"></div>
          <Link
            className={"users_navbar_link"}
            onClick={() => setChangePasswordModel(true)}
          >
            Change password
          </Link>
          <div className="users_navbar_link_separator"></div>
          <Link
            className="users_navbar_link"
            style={{background:"red"}}
            onClick={() => dispatch(handleWarningModel())}
          >
            Logout
          </Link>
        </div>
      </div>
      <div className="users_mobile_navbar_container">
        <div className="users_mobile_navbar_left">
          <PiBuildingOfficeBold /> {loggedInUser?.company?.name}
        </div>
        <div
          className="users_mobile_navbar_right"
          onClick={() => dispatch(handlToggleMenu())}
        >
          {showMenu ? <IoClose /> : <IoMdMenu />}
        </div>
        {showMenu && (
          <div
            className="users_mobile_navbar_show_menu"
            data-aos="fade-up"
            data-aos-duration="300"
            data-aos-once="true"
          >
            <NavLink
              className={"users_mobile_navbar_show_menu_navlink"}
              to={"/allusers/dashboard"}
              onClick={() => dispatch(handlToggleMenu(false))}
            >
              Dashbaord
            </NavLink>
            <NavLink
              className={"users_mobile_navbar_show_menu_navlink"}
              to={"/allusers/graphs"}
              onClick={() => dispatch(handlToggleMenu(false))}
            >
              Graphs[WL]
            </NavLink>
            <NavLink
              className={"users_mobile_navbar_show_menu_navlink"}
              to={"/allusers/dualtopicdashboard"}
              onClick={() => dispatch(handlToggleMenu(false))}
            >
              MultiGraphPlot
            </NavLink>
            <NavLink
              className={"users_mobile_navbar_show_menu_navlink"}
              to={"/allusers/favorites"}
              onClick={() => dispatch(handlToggleMenu(false))}
            >
              Watch list
            </NavLink>
            <NavLink
              className={"users_mobile_navbar_show_menu_navlink"}
              to={"/allusers/digitalmeter"}
              onClick={() => dispatch(handlToggleMenu(false))}
            >
              Digital meter
            </NavLink>
            {user?.role !== "employee" && (
              <NavLink
                className={"users_mobile_navbar_show_menu_navlink"}
                to={"/allusers/users"}
                onClick={() => dispatch(handlToggleMenu(false))}
              >
                Operators
              </NavLink>
            )}
            {user?.role === "manager" && (
              <NavLink
                className={"users_mobile_navbar_show_menu_navlink"}
                to={"/allusers/supervisors"}
                onClick={() => dispatch(handlToggleMenu(false))}
              >
                Supervisors
              </NavLink>
            )}
            <Link
              className={"users_mobile_navbar_show_menu_navlink"}
              onClick={() => setChangePasswordModel(true)}
            >
              Change password
            </Link>
            <div
              className="users_mobile_navbar_show_menu_logout_container"
              onClick={() => dispatch(handleWarningModel())}
            >
              <button>
                <IoIosLogOut /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
      {changePasswordModel && (
        <ChangePassword
          user={user}
          setChangePasswordModel={setChangePasswordModel}
        />
      )}
    </>
  );
};

export default Navbar;