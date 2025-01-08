import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import { UserProvider } from "./context/UserContext";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap the entire app in BrowserRouter */}
      <UserProvider> {/* Wrap the app in UserProvider for global state */}
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);