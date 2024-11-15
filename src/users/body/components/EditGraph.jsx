import React from "react";
import "../../style.css";
import { useParams } from "react-router-dom";

const EditGraph = () => {
  const { topicparams } = useParams();
  return <div>EditGraph {topicparams}</div>;
};

export default EditGraph;
