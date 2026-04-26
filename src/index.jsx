import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Подавляем ошибку applicationId в dev overlay.
 * React DevTools показывает red overlay для uncaught errors —
 * мы перехватываем ДО него через iframe postMessage.
 */
if (process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = function (...args) {
    const msg = args[0];
    if (typeof msg === "string" && msg.indexOf("applicationId") !== -1) return;
    if (msg instanceof Error && msg.message && msg.message.indexOf("applicationId") !== -1) return;
    origError.apply(console, args);
  };
}

createRoot(document.getElementById("root")).render(<App />);
