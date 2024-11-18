import React, { useEffect, useState } from "react";
import "../../style.css";
import { useParams } from "react-router-dom";
import SmallGraph from "../graphs/smallgraph/SmallGraph";
import { IoClose } from "react-icons/io5";
import apiClient from "../../../api/apiClient";

const EditGraph = () => {
  const { topicparams } = useParams();
  const [thresholdNumber, setThresholdNumber] = useState("0");

  const [thresholds, setThreshold] = useState([]);

  let topic = encodeURIComponent(topicparams);

  useEffect(() => {
    fetchThresholdApi();
  }, []);

  const fetchThresholdApi = async () => {
    try {
      const res = await apiClient.get(`/mqtt/get?topic=${topic}`);
      setThreshold(res?.data?.data?.thresholds);
      setThresholdNumber(res?.data?.data?.thresholds?.length);
    } catch (error) {
      console.log("No threshold is present");
    }
  };

  const handleSelectNumberOfThreshold = (e) => {
    setThresholdNumber(e.target.value);
  };

  return (
    <div className="_editgraph_main_container">
      <div className="_editgraph_second_main_container">
        <div className="_editgraph_second_main_left_container">
          <header>
            <div>Edit {topicparams?.split("/")[2]}</div>
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                window.history.back();
              }}
            >
              <IoClose />
            </div>
          </header>
        </div>
        <div className="_editgraph_graph_container">
          <div className="_editgraph_graph_left">
            <SmallGraph topic={topicparams} height={"400"} />
          </div>
          <div className="_editgraph_graph__right">
            <h5 className="m-0 my-3 text-center">Edit threshold</h5>
            <div className="_editgraph_main_input_container">
              <div className="_editgraph_main_select_numberof_threshold">
                <select
                  value={thresholdNumber}
                  onChange={handleSelectNumberOfThreshold}
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              {thresholdNumber === 1 && (
                <section>
                  <div>
                    <input
                      type="number"
                      name=""
                      id=""
                      value={thresholds[0]?.value}
                      placeholder="Enter lowest threshold"
                    />
                    <select name="" id="" value={thresholds[0]?.color}>
                      <option value="green">Green</option>
                      <option value="yello">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                </section>
              )}
              {thresholdNumber === 2 && (
                <section>
                  <div>
                    <input
                      type="number"
                      name=""
                      id=""
                      value={thresholds[0]?.value}
                      placeholder="Enter lowest threshold"
                    />
                    <select name="" id="" value={thresholds[0]?.color}>
                      <option value="green">Green</option>
                      <option value="yello">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      name=""
                      id=""
                      value={thresholds[1]?.value}
                      placeholder="Enter highest threshold"
                    />
                    <select name="" id="" value={thresholds[1]?.color}>
                      <option value="green">Green</option>
                      <option value="yello">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                </section>
              )}
              {thresholdNumber === 3 && (
                <section>
                  <div>
                    <input
                      type="number"
                      name=""
                      id=""
                      value={thresholds[0]?.value}
                      placeholder="Enter lowest threshold"
                    />
                    <select name="" id="" value={thresholds[0]?.color}>
                      <option value="green">Green</option>
                      <option value="yello">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      name=""
                      id=""
                      value={thresholds[1]?.value}
                      placeholder="Enter middle threshold"
                    />
                    <select name="" id="" value={thresholds[1]?.color}>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      name=""
                      id=""
                      value={thresholds[2]?.value}
                      placeholder="Enter highest threshold"
                    />
                    <select name="" id="" value={thresholds[2]?.color}>
                      <option value="green">Green</option>
                      <option value="yello">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                </section>
              )}
              <div className="_editgraph_savechanges_button_container">
                <button>Clear All</button>
                <button>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGraph;
