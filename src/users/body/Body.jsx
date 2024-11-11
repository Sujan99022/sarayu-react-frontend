import React from "react";
import "./Body.css";
import { Outlet } from "react-router-dom";

const Body = () => {
  return (
    <div className="users_body_container">
      <div className="users_body_second_container">
        <Outlet />
      </div>
    </div>
  );
};

export default Body;
