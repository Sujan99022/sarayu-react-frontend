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
import { IoKey } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { VscGraphLine } from "react-icons/vsc";
import { setUserDetails } from "../redux/slices/UserDetailsSlice";
import apiClient from "../api/apiClient";
import "./style.css";
import { handleWarningModel } from "../redux/slices/UserSlice";
import TradeViewGraph from "./graphs/tradeViewGraph/TradeViewGraph";
import Speedometer from "./graphs/speedometer/Speedometer";
import DigitalMeter from "./graphs/digitalmeter/DigitalMeter";
import { BsSpeedometer2 } from "react-icons/bs";
import { FaUser } from "react-icons/fa";

const Supervisor = () => {
  const { user } = useSelector((state) => state.userSlice);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [operatorsList, setOperatorsList] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeNavBtn, setActiveNavBtn] = useState("home");
  const [closeNote, setCloseNote] = useState(true);
  const [displayGraphUserEmail, setDisplayGraphUserEmail] = useState("");
  const [displayGraphUserTopic, setDisplayGraphUserTopic] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [displayDigitalMeterUserEmail, setDisplayDigitalMeterUserEmail] =
    useState("");
  const [passwordData, setPasswordData] = useState({
    email: user?.email,
    activePassword: "",
    newPassword: "",
    confirmPassword: "",
  });
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

  const handleChangePasswordInput = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async () => {
    if (!passwordData.activePassword) {
      toast.warning("Please enter your current password");
      return;
    }
    if (!passwordData.newPassword) {
      toast.warning("Please enter your new password");
      return;
    }
    if (!passwordData.confirmPassword) {
      toast.warning("Confirm your new password");
      return;
    }
    if (passwordData.confirmPassword !== passwordData.newPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    const { confirmPassword, ...dataToSend } = passwordData;

    dispatch(setLoading(true));
    try {
      await apiClient.post(`/auth/supervisor/reset-password`, dataToSend);
      toast.success("Password changed successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
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
            <p
              className={
                activeNavBtn === "home" &&
                `manager_navbar_nav_desktop_view_links_active`
              }
              onClick={() => setActiveNavBtn("home")}
            >
              <FaHome /> Home
            </p>
            <p
              className={
                activeNavBtn === "operators" &&
                `manager_navbar_nav_desktop_view_links_active`
              }
              onClick={() => setActiveNavBtn("operators")}
            >
              <FaUsers /> Operators
            </p>
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
          {closeNote && activeNavBtn === "operators" && (
            <section
              className="supervisor_note_model_container"
              data-aos="fade-out"
              data-aos-duration="500"
              data-aos-once="true"
            >
              <div>
                <p className="md-py-5 text-center">
                  Note: Here you will see all the operators under you, and you
                  can view the specific graph assigned to the user by clicking
                  on the graph or digital meter.
                </p>
                <span className="note_close_icon">
                  <IoClose onClick={() => setCloseNote(false)} />
                </span>
              </div>
            </section>
          )}
          {/* users under supervisor dispaly starts here */}
          {activeNavBtn === "operators" && (
            <>
              <p className="supervisor_display_all_operators_container_p">
                Operators List
              </p>
              <div className="supervisor_display_all_operators_container">
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
                          <div>
                            <span>{index + 1}</span>
                          </div>
                          <div>
                            <p>
                              <FaUser size={"12"} /> {item.name}
                            </p>
                            <p>
                              <MdEmail size={"12"} /> {item.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span
                              onClick={() => [
                                setDisplayGraphUserEmail(item.email),
                                setActiveNavBtn("graph"),
                                setSelectedEmployee(item),
                                setDisplayGraphUserTopic(item.mqttTopic),
                              ]}
                            >
                              <VscGraphLine />
                            </span>
                          </div>
                          <div>
                            <span
                              onClick={() => [
                                setDisplayDigitalMeterUserEmail(item.email),
                                setSelectedEmployee(item),
                                setActiveNavBtn("digitalmeter"),
                              ]}
                            >
                              <BsSpeedometer2 />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
          {/* users under supervisor dispaly ends here */}
          {/* supervisor graph container starts here */}
          {activeNavBtn === "graph" && (
            <div
              data-aos="fade-out"
              data-aos-duration="1000"
              data-aos-once="true"
            >
              <div className="center_the_graph_container">
                <TradeViewGraph
                  selectedEmployee={selectedEmployee}
                  email={displayGraphUserEmail}
                  topic={displayGraphUserTopic}
                />
              </div>
            </div>
          )}
          {/* supervisor graph container ends here */}
          {/* supervisor digital graph starts here */}
          {activeNavBtn === "digitalmeter" && (
            <div className="digital_meter_data_view_container">
              <div>
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <Speedometer user={displayDigitalMeterUserEmail} />
                <DigitalMeter user={displayDigitalMeterUserEmail} />
              </div>
            </div>
          )}
          {/* supervisor digital graph ends here */}
          {/* supervisor change password starts here */}
          {activeNavBtn === "password" && (
            <div className="supervisor_change_password_section">
              <p className="text-center">Change Password</p>
              <section>
                <div>
                  <label htmlFor="oldpassword">Enter active password</label>
                  <input
                    type="password"
                    id="oldpassword"
                    name="activePassword"
                    onChange={handleChangePasswordInput}
                    value={passwordData.activePassword}
                    placeholder="Enter password here..."
                  />
                </div>
                <div>
                  <label htmlFor="newpassword">Enter new password</label>
                  <input
                    type="password"
                    id="newpassword"
                    name="newPassword"
                    onChange={handleChangePasswordInput}
                    value={passwordData.newPassword}
                    placeholder="Enter password here..."
                  />
                </div>
                <div>
                  <label htmlFor="confirmpassword">Confirm new password</label>
                  <input
                    type="password"
                    id="confirmpassword"
                    name="confirmPassword"
                    onChange={handleChangePasswordInput}
                    value={passwordData.confirmPassword}
                    placeholder="Enter password here..."
                  />
                </div>
                <div>
                  <button onClick={handleChangePassword}>Change</button>
                </div>
              </section>
            </div>
          )}
          {/* supervisor change password ends here */}
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
              activeNavBtn === "operators" &&
              `footer_navigationbar_mobile_view_active`
            }
          >
            <FaUsers onClick={() => setActiveNavBtn("operators")} />
            {activeNavBtn === "operators" && <span>Operators</span>}
          </div>
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
    </div>
  );
};

export default Supervisor;
