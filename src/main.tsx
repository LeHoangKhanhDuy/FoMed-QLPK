import "./index.css";
import App from "./App.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./common/ScrollToTop.tsx";

import { UserProvider } from "./contexts/UserContext.tsx";
import { ensureAuthFromStorage } from "./services/auth.ts";

ensureAuthFromStorage();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
