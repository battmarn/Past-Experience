import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom";
import "./index.css";
import axe from "@axe-core/react";
import App from "./app/App";
import store from "./store";

// establish WCAG 2.1 Level A & AA Rules
const config = {
  runOnly: ["wcag21a", "wcag21aa"],
};

// render App within axe
axe(
  config,
  ReactDOM.render(
    <Provider store={store}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Provider>,
    document.getElementById("root")
  ),
  1000
);
