import React, { useEffect, useState, useRef } from "react";
import "./Task.css";
import TaskEdit from "./TaskEdit";
import { useDispatch } from "react-redux";
import { storeActions } from "../../Store/taskSlice";
import { blank } from "../../constants";

function WarningPopOver({ onClickOutside, onClick }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <p ref={ref} className="warning">
      Are you sure you want to delete?
      <button onClick={onClick}>Delete</button>
    </p>
  );
}

export default function Task(Task_props) {
  const [CanEdit, SetEditing] = useState(false);
  const [showDeleteWarn, setshowDeleteWarn] = useState(false);
  const handleDeleteClick = () => {
    setshowDeleteWarn(true);
  };

  const dispatch = useDispatch();

  const handleSubmit = (userText) => {
    SetEditing(false);
    dispatch(
      storeActions.updateTask({
        ...Task_props,
        prevText: Task_props.task_text || "",
        task_text: userText,
      })
    );
  };

  const handleTextClick = () => {
    SetEditing(true);
  };

  const handleDelete = () => {
    dispatch(storeActions.deleteTask(Task_props));
  };

  const DisplayTaskText = ({ children }) => {
    if (!children) {
      children = blank;
    }
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

  return (
    <div className="Task">
      <p id="id" className="tooltip">
        {Task_props.index + 1}
      </p>
      <p id="delete" className="tooltip" onClick={handleDeleteClick}>
        <span>X</span>
        {showDeleteWarn && (
          <WarningPopOver
            onClickOutside={() => {
              setshowDeleteWarn(false);
            }}
            onClick={handleDelete}
          />
        )}
      </p>
      {CanEdit ? (
        <TaskEdit handleSubmit={handleSubmit} {...Task_props} />
      ) : (
        <DisplayTaskText>{Task_props.task_text}</DisplayTaskText> //This will prevent an unaccebile empty task
      )}
    </div>
  );
}

// There's a bug that deleting an editing task will cuase the one before it to still in edifing mode. try to generate random keys at app.js to cuase the tasks to be remounted every delete and not just updated
