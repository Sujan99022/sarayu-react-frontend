import React, { useEffect, useState } from "react";
import "../../style.css";
import { useNavigate, useParams } from "react-router-dom";
import DigitalViewOne from "../graphs/digitalview/DigitalViewOne";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import BarChart from "../graphs/barchart/BarChart";
import Type2 from "../../../admin/components/digitalmeters/Type2";
import { IoCloseSharp } from "react-icons/io5";
import io from "socket.io-client";

const LayoutView = () => {
  const { topic } = useParams();
  const navigate = useNavigate();

  const [liveMessage, setLiveMessages] = useState();

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });
    socket.emit("subscribeToTopic", topic);
    socket.on("liveMessage", (data) => {
      setLiveMessages(data?.message?.message?.message);
    });
    socket.on("noData", (data) => {
      console.warn(data.message);
    });

    socket.on("error", (data) => {
      console.error(data.message);
    });

    return () => {
      socket.emit("unsubscribeFromTopic");
      socket.disconnect();
    };
  }, [topic]);

  return (
    <div className="allusers_layoutview_main_container">
      <header className="allusers_layoutview_header">
        Layout View ({topic?.split("|")[0].split("/")[2]})
        <div className="allusers_layoutview_close_icon">
          <IoCloseSharp onClick={() => navigate(-1)} />
        </div>
      </header>
      <section className="allusers_layoutview_section">
        <div className="allusers_layoutview_numaric_container">
          <div>
            <h3>{liveMessage ? liveMessage : "00"}</h3>
            <p>{topic?.split("|")[1] || "N/A"}</p>
          </div>
        </div>
        <div className="allusers_layoutview_digital_meter_container">
          {/* <DigitalViewOne /> */}
          <Type2 topic={topic} unit={topic?.split("|")[1]} darkColor={true} />
        </div>
        <section className="allusers_layoutview_live_graph_container">
          <SmallGraph topic={topic} height={"310"} />
        </section>
        <div className="allusers_layoutview_bar_graph_container">
          <BarChart topic={topic} />
        </div>
      </section>
    </div>
  );
};

export default LayoutView;
