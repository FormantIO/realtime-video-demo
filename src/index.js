import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("body").style.display = "block";
  ReactDOM.render(
    <React.StrictMode>
      <>
        <formant-theme></formant-theme>
        <App />
      </>
    </React.StrictMode>,
    document.getElementById("root")
  );
});
