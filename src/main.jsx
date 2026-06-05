import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App.jsx";
import { LanguageProvider } from "./app/context/LanguageContext.jsx";
import { AuthProvider } from "./app/context/AuthContext.jsx";
import { HelmetProvider } from "react-helmet-async";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </HelmetProvider>
);
