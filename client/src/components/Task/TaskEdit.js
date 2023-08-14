import React, { useEffect, useState } from "react";
import "./Task.css";
import { blank } from "../../constants";
import { Button } from "@mui/material";

export default function TaskEdit(Task_props) {
  const [task_text, set_task_text] = useState(Task_props.text || "");
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
    set_task_text(Task_props.text || "");
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
        value={task_text === blank ? "" : task_text}
        maxLength={500}
        rows={5}
        cols={30}
      >
        //this to prevent The blank sign to be visible when ediing an empty task
      </textarea>
      <br></br>
      <Button variant="contained" color="secondary" onClick={handleSubmit}>
        submit
      </Button>
    </React.Fragment>
  );
}
