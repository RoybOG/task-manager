import "./App.css";
import { useState } from "react";
import React from "react";

import TaskEdit from "./components/Task/TaskEdit";
import { SelectAllTasks } from "./Store/taskSelectors";
import { useDispatch, useSelector } from "react-redux";

import TaskList from "./components/TaskList";

import { storeActions } from "./Store/Store";
import ActionsBar from "./components/ActionsBar";

function App() {
  const store_tasks = useSelector(SelectAllTasks);
  console.log(useSelector((state) => state));

  return (
    <div className="App">
      <h1>ProductiveDay</h1>
      <h2>Today will be a productive day!</h2>
      <ActionsBar></ActionsBar>
      <TaskList tasksArr={store_tasks} />
    </div>
  );
}

export default App;
