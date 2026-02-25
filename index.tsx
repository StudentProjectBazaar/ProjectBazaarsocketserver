import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./globals.css";

Sentry.init({
  dsn: "https://d2b4b7675ec75eaab29ac2303fea1604@o4510947769057280.ingest.us.sentry.io/4510947776462848",
  sendDefaultPii: true
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
