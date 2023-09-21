import "./App.css";
import { useEffect, useState } from "react";
import React from "react";
import { ReactComponent as SpinnerSVG } from "./appImgs/spinner.svg";
import TaskEdit from "./components/Task/TaskEdit";
import {
  SelectAllLists,
  SelectTasksRequestState,
} from "./Store/storeSelectors";
import { useDispatch, useSelector } from "react-redux";

import TaskList from "./components/TaskList";

import { storeActions } from "./Store/Store";
import ActionsBar from "./components/ActionsBar";
import axiosCon from "./communication";
import { getUserLists } from "./Store/taskSlice";
import axios from "axios";

function App() {
  const store_Lists = useSelector(SelectAllLists);
  const taskRequestStatus = useSelector(SelectTasksRequestState);
  const dispatch = useDispatch();
  console.log(useSelector((state) => state));

  const Lists = () => (
    <>
      {taskRequestStatus == "INITIAL" && Object.keys(store_Lists).length > 0
        ? Object.entries(store_Lists).map(([list_id, l], ind) => (
            <TaskList key={list_id} list_id={list_id} list_index={ind} {...l} />
          ))
        : null}
    </>
  );

  const Spinner = () => <SpinnerSVG id={"loadingSpinner"} />;

  const AppContent = () => {
    if (taskRequestStatus == "INITIAL" && Object.keys(store_Lists).length > 0) {
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
  /*
  useEffect(() => {
    axios.get("http://localhost:5000/get_all_lists").then(
      (response) => {
        console.log(response);
      },
      (err) => {
        console.log(err);
      }
    );
  }, []);*/

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
