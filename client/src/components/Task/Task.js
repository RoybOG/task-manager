import React, { useEffect, useState } from "react";
import "./Task.css";
import TaskEdit from "./TaskEdit";
import { useDispatch } from "react-redux";
import { UpdateTask, deleteTask } from "../../Store/taskSlice";

export default function Task(Task_props) {
  const [CanEdit, SetEditing] = useState(false);
  const dispatch = useDispatch();
  const handleSubmit = (userText) => {
    SetEditing(false);
    dispatch(UpdateTask({ ...Task_props, text: userText }));
  };

  const handleTextClick = () => {
    SetEditing(true);
  };

  const handleDelete = () => {
    dispatch(deleteTask(Task_props.index));
  };

  const DisplayTaskText = ({ children }) => {
    if (typeof children === "string") {
      return (
        <div onClick={handleTextClick}>
          {children.split("\n").map((t, index) => (
            <h3
              dir={Task_props.dir || "rtl"}
              style={{ textAlign: Task_props.dir === "ltr" ? "left" : "right" }}
              key={index}
            >
              {t}
            </h3>
          ))}
        </div>
      );
    }
    if (children != null) throw "child is not string!";
  };

  useEffect(() => {
    if (!Task_props.text) {
      SetEditing(true);
    }
  }, []);

  return (
    <div className="Task">
      <h6 id="id">{Task_props.index + 1}</h6>
      <h6 id="delete" onClick={handleDelete}>
        X
      </h6>
      {/* <DisplayTaskText>{Task_props.text}</DisplayTaskText> */}
      {CanEdit ? (
        <TaskEdit handleSubmit={handleSubmit} {...Task_props} />
      ) : (
        <DisplayTaskText>{Task_props.text}</DisplayTaskText>
      )}
    </div>
  );
}

// There's a bug that deleting an editing task will cuase the one before it to still in edifing mode. try to generate random keys at app.js to cuase the tasks to be remounted every delete and not just updated
