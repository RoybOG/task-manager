import React from "react";
import "./Task.css";
export default function Task(Task_props) {
  return (
    <div className="Task">
      <h6 id="id">{Task_props.id}</h6>
      <h3>{Task_props.text}</h3>
    </div>
  );
}
