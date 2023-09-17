import "./App.css";
import { useEffect, useState } from "react";
import React from "react";
import { ReactComponent as SpinnerSVG } from "./appImgs/spinner.svg";
import TaskEdit from "./components/Task/TaskEdit";
import {
  SelectAllTasks,
  SelectTasksRequestState,
} from "./Store/storeSelectors";
import { useDispatch, useSelector } from "react-redux";

import TaskList from "./components/TaskList";

import { storeActions } from "./Store/Store";
import ActionsBar from "./components/ActionsBar";
import axiosCon from "./communication";
import { getUserLists } from "./Store/taskSlice";

function App() {
  const store_Lists = useSelector(SelectAllTasks);
  const taskRequestStatus = useSelector(SelectTasksRequestState);
  const dispatch = useDispatch();
  console.log(useSelector((state) => state));

  const Lists = () => (
    <>
      {taskRequestStatus == "INITIAL" && store_Lists.length > 0
        ? store_Lists.map((l) => <TaskList key={l.listID} {...l} />)
        : null}
    </>
  );

  const Spinner = () => <SpinnerSVG id={"loadingSpinner"} />;

  const AppContent = () => {
    if (taskRequestStatus == "INITIAL" && store_Lists.length > 0) {
      return <Lists />;
    } else if (taskRequestStatus == "PENDING") {
      return <Spinner />;
    } else if (taskRequestStatus == "FAILED") {
      return <h3 id="failed">FAILED LOADING TASKS. TRY AGAIN LATER...</h3>;
    }
  };

  useEffect(() => {
    dispatch(getUserLists());
  }, []);

  return (
    <div className="App">
      <h1>ProductiveDay</h1>
      <h2>Today will be a productive day!</h2>
      <ActionsBar />
      <AppContent />
    </div>
  );
}

export default App;
