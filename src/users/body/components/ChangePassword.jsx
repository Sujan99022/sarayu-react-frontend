import React from "react";
import "../../style.css";
import { TbPasswordUser } from "react-icons/tb";

const ChangePassword = ({ setChangePasswordModel }) => {
  return (
    <div
      className="allusers_change_password_container"
      data-aos="fade-out"
      data-aos-duration="300"
      data-aos-once="true"
    >
      <div>
        <div className="allusers_change_password_logo_container">
          <div>
            <TbPasswordUser size={"80"} />
          </div>
        </div>
        <p>Change password</p>
        <div className="allusers_change_password_input_container">
          <label htmlFor="">Enter your old password</label>
          <input type="password" name="" id="" placeholder="Enter here" />
        </div>
        <div className="allusers_change_password_input_container">
          <label htmlFor="">Enter your new password</label>
          <input type="password" name="" id="" placeholder="Enter here" />
        </div>
        <div className="allusers_change_password_button_container">
          <button>Save changes</button>
          <button onClick={() => setChangePasswordModel(false)}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
