import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error(
    "Boxy Fractions could not find #root in the DOM. " +
      "Bug: index.html is missing <div id=\"root\"></div> or this script loaded before parse. " +
      "Verify index.html contains <div id=\"root\"></div> and a module script tag for /src/main.tsx.",
  );
}
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
