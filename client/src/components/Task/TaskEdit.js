import React, { useEffect, useState } from "react";
import "./Task.css";
import { Button } from "@mui/material";

export default function TaskEdit(Task_props) {
  const [task_text, set_task_text] = useState(Task_props.task_text || "");
  const change_text = (new_text) => {
    set_task_text(new_text);
  };

  const handleSubmit = () => {
    // console.log(k);
    // if (k === "Enter") {
    Task_props.handleSubmit(task_text);
    // }
  };

  useEffect(() => {
    set_task_text(Task_props.task_text || "");
  }, [Task_props]);

  // useEffect(() => {
  //   console.log(navigator.language);
  // }, [navigator.language]);

  return (
    <React.Fragment>
      <textarea
        onChange={(e) => change_text(e.target.value)}
        // onKeyDown={(e) => handleEnter(e.key)}
        dir={Task_props.dir || "ltr"}
        value={task_text}
        maxLength={500}
        rows={5}
        cols={30}
      ></textarea>
      <br></br>
      <button id="submit" onClick={handleSubmit}>
        submit
      </button>
    </React.Fragment>
  );
}
