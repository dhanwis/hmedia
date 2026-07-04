import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ApiProvider } from "./context/ApiContext.jsx";
import RouteLoader from "./components/user/RouteLoader.jsx";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext.jsx";
import ScrollToTop from "./components/user/common/ScrollToTop.jsx";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <ScrollToTop />
      <ApiProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ApiProvider>
    </BrowserRouter>
  </HelmetProvider>
);
