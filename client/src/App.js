import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import React from "react";

import TaskEdit from "./components/Task/TaskEdit";
import { SelectAllTasks } from "./Store/taskSelectors";
import { useDispatch, useSelector } from "react-redux";
import { addEmptyTask } from "./Store/taskSlice";
import TaskList from "./components/TaskList";

function App() {
  const store_tasks = useSelector(SelectAllTasks);
  const dispatch = useDispatch();
  const handleCreate = () => {
    dispatch(addEmptyTask());
  };
  return (
    <div className="App">
      <h1>Manage Tasks</h1>
      <button id="createTask" onClick={handleCreate}>
        +
      </button>
      <TaskList tasksArr={store_tasks} />
    </div>
  );
}

export default App;
