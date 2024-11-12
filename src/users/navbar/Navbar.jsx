import React from "react";
import "./Navbar.css";
import "../style.css";
import { NavLink } from "react-router-dom";
import { handleWarningModel } from "../../redux/slices/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { IoSearch } from "react-icons/io5";
import { FaUserCheck } from "react-icons/fa";
import { MdMarkEmailRead } from "react-icons/md";
import SaveIcon from "../../utils/supervisor_like_graph_icon_2.png";

const Navbar = () => {
  const { user } = useSelector((state) => state.userSlice);
  const dispatch = useDispatch();
  return (
    <div className="users_navbar_container">
      <div className="users_navbar_user_details">
        <p>
          <FaUserCheck /> {user.name}
        </p>
        {/* <p><MdMarkEmailRead /> {user.email}</p> */}
      </div>
      <div>
        <p
          onClick={() => {
            window.location.href = "/allusers/graphs";
          }}
          className="users_navbar_link"
        >
          Graphs
        </p>
        {user.role === "supervisor" && (
          <>
            <div className="users_navbar_link_separator"></div>
            <p
              onClick={() => {
                window.location.href = "/allusers/alloperators";
              }}
              className="users_navbar_link"
            >
              All Operators
            </p>{" "}
          </>
        )}
        <div className="users_navbar_link_separator"></div>
        <NavLink to={"/allusers/digitalmeter"} className="users_navbar_link">
          Digital meter
        </NavLink>
        <div className="users_navbar_link_separator"></div>
        <NavLink to={"/allusers/changepassword"} className="users_navbar_link">
          Change password
        </NavLink>
        <div className="users_navbar_link_separator"></div>
        <p
          className="users_navbar_link"
          onClick={() => dispatch(handleWarningModel())}
        >
          Logout
        </p>
      </div>
      <div className="users_small_graphs_searchbar_container">
        <div className="allusers_input-wrapper">
          <div>
            <input
              type="text"
              placeholder="Search by tag name"
              className="search_input"
            />
            <button>
              <IoSearch />
            </button>
          </div>
        </div>
        {user.role !== "employee" && (
          <div className="users_nav_favorite_img_container">
            <img src={SaveIcon} alt="favorite" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
