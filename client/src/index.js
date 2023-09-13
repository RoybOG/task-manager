import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import Store from "./Store/Store";

const root = ReactDOM.createRoot(document.getElementById("root"));

// adding listeners to the app:

/*window.addEventListener("beforeunload", (e) => {
  let saveWarning = ("There are unsaved changes to your task! \nIf you leave they will be lost!"(
    e || window.Event
  ).returnValue = saveWarning);
  return saveWarning;
});*/

root.render(
  <Provider store={Store}>
    {/* <React.StrictMode> */}
    <App />
    {/* </React.StrictMode> */}
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
