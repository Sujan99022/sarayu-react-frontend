import React from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { handleWarningModel } from "../../redux/slices/UserSlice";
import { useDispatch, useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.userSlice);
  const dispatch = useDispatch();
  return (
    <div className="users_navbar_container">
      <div>
        <NavLink to={"/allusers/graphs"} className="users_navbar_link">
          Graphs
        </NavLink>
        {user.role === "supervisor" && (
          <>
            <div className="users_navbar_link_separator"></div>
            <NavLink
              to={"/allusers/alloperators"}
              className="users_navbar_link"
            >
              All Operators
            </NavLink>{" "}
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
    </div>
  );
};

export default Navbar;
