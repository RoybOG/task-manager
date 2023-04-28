import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import React from "react";
import Task from "./components/Task";
import TaskEdit from "./components/Task/TaskEdit";
import { SelectAllTasks } from "./Store/taskSelectors";
import { useDispatch, useSelector } from "react-redux";
import { addEmptyTask } from "./Store/taskSlice";

function App() {
  const tasks = useSelector(SelectAllTasks)
  // console.log("tasks")
  // console.log(tasks)
  const dispatch = useDispatch()
  const handleCreate = ()=>{
    dispatch(addEmptyTask())
  }
  return (
    <div className="App">
      
      <h1>Manage Tasks</h1>
      <button id='createTask' onClick={handleCreate}>+</button>
      {tasks.map((task_info, key) => (
        <React.Fragment key={key}>
          <br></br>
          <Task  id={key} {...task_info} />
        </React.Fragment>
      ))}
    </div>
  );
}

export default App;