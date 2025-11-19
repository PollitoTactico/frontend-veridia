import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme";
import Home from "./apps/home/home";
import { AuthProvider } from "./services/auth/firebase/AuthContext";
import Auth from "./apps/auth/auth";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Auth>
          <Home />
        </Auth>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
