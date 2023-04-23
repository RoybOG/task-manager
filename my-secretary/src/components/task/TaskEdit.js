import React, { useState } from "react";
import "./Task.css";
export default function TaskEdit(Task_props) {
  const [task_data, set_task_data] = useState(Task_props);
  const change_text = (new_text) => {
    set_task_data({ ...task_data, text: new_text });
  };
  console.log(task_data);
  return (
    <div className="Task">
      <h6 id="id">{Task_props.id}</h6>
      <input
        type="text"
        onChange={(e) => {
          change_text(e.target.value);
        }}
        value={task_data["text"] ?? ""}
      ></input>
    </div>
  );
}
