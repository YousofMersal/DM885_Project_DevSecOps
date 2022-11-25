import {
  Navigate,
  Outlet,
  ReactLocation,
  Router,
} from "@tanstack/react-location";
import React from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { SignUpPage } from "./pages/SignUp";
import { useGlobalState } from "./utils/store";
import "./global.css";
import { Layout } from "./components/Layout";
import { Container } from "./components/Container";
import { SolverConfiguration } from "./pages/SolverConfiguration";

const location = new ReactLocation();

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { isLoggedIn } = useGlobalState();

  if (!isLoggedIn) {
    return <Navigate to={"/login "} />;
  }

  return children;
};

const Routes: React.FC = () => {
  return (
    <Router
      location={location}
      routes={[
        {
          path: "/",
          element: (
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: "/login",
          element: (
            <Container>
              <Login />
            </Container>
          ),
        },
        {
          path: "/sign-up",
          element: (
            <Container>
              <SignUpPage />
            </Container>
          ),
        },
        {
          path: "/solver-config",
          element: (
            <ProtectedRoute>
              <Layout>
                <SolverConfiguration />
              </Layout>
            </ProtectedRoute>
          ),
        },
      ]}
    >
      <Outlet />
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>
);
