import React, { useEffect, useState, useRef } from "react";
import "./Task.css";
import TaskEdit from "./TaskEdit";
import { useDispatch } from "react-redux";
import { UpdateTask, deleteTask } from "../../Store/taskSlice";

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
    <p ref={ref} class="warning">
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
      <p id="id" class="tooltip">
        {Task_props.index + 1}
      </p>
      <p id="delete" class="tooltip" onClick={handleDeleteClick}>
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
        <DisplayTaskText>{Task_props.text}</DisplayTaskText>
      )}
    </div>
  );
}

// There's a bug that deleting an editing task will cuase the one before it to still in edifing mode. try to generate random keys at app.js to cuase the tasks to be remounted every delete and not just updated
