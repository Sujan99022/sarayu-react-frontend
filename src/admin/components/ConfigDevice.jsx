import React from "react";
import "../index.css";

const ConfigDevice = () => {
  return (
    <div className="admin_configdevice_main_container">
      <header>
        <div>
          <div>
            <div className="admin_configdevice_input_container">
              <label htmlFor="">Slave ID</label>
              <input type="text" placeholder="Enter slave id..." />
            </div>
            <div className="admin_configdevice_input_container">
              <label htmlFor="">Address</label>
              <input type="text" placeholder="Enter address..." />
            </div>
            <div className="admin_configdevice_input_container">
              <label htmlFor="">Function Code</label>
              <input type="text" placeholder="Enter function code..." />
            </div>
            <div className="admin_configdevice_input_container">
              <label htmlFor="">Size</label>
              <input type="text" placeholder="Enter size..." />
            </div>
          </div>
          <div className="admin_configdevice_submit_container">
            <button>Submit</button>
          </div>
        </div>
      </header>
      <section>
        <div className="admin_configdevice_created_section">
          <div className="admin_configdevice_created_section_header">
            <input type="search" placeholder="Search..." />
            <select name="" id="">
              <option value="">Search by...</option>
              <option value="">Slave ID</option>
              <option value="">Address</option>
            </select>
          </div>
          <div className="admin_configdevice_created_section_body">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div className="admin_configdevice_edit_section">
          <div className="admin_configdevice_edit_section_not_item_selected">
            <p>No item selected to edit...!</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConfigDevice;
