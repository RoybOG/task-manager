import React, { useEffect, useState } from "react";
import "./Task.css";
import { blank } from "../../constants";

export default function TaskEdit(Task_props) {
  const [task_text, set_task_text] = useState(Task_props.text || "");
  const change_text = (new_text) => {
    set_task_text(new_text);
  };

  const handleEnter = (k) => {
    if (k === "Enter") {
      Task_props.handleSubmit(task_text);
    }
  };

  useEffect(() => {
    set_task_text(Task_props.text || "");
  }, [Task_props]);

  return (
    <input
      type="text"
      onChange={(e) => change_text(e.target.value)}
      onKeyDown={(e) => handleEnter(e.key)}
      value={task_text === blank ? "" : task_text} //this to prevent The blank sign to be visible when ediing an empty task
    ></input>
  );
}
