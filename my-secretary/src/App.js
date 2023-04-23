import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import React from "react";
import Task, { TaskEdit } from "./components/task";

function App() {
  const [tasks, Settasks] = useState([
    {
      text: "Create task app",
    },
    {
      text: "Feed the Dog!",
    },
  ]);

  return (
    <div className="App">
      <h1>Manage Tasks</h1>
      <TaskEdit text={"Feed the Dog!"} />
      {tasks.map((task_info, key) => (
        <React.Fragment key={key}>
          <br></br>
          <Task id={key} {...task_info} />
        </React.Fragment>
      ))}
    </div>
  );
}

export default App;
