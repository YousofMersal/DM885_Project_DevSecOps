import {
  Navigate,
  Outlet,
  ReactLocation,
  Router,
} from "@tanstack/react-location";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { SignUpPage } from "./pages/SignUp";
import { useGlobalState } from "./utils/store";
import "./global.css";
import { Layout } from "./components/Layout";
import { Container } from "./components/Container";
import { SolverConfiguration } from "./pages/SolverConfiguration";
import { Users } from "./pages/Users";
import { ProblemPage } from "./pages/ProblemPage";
import { ProblemDataPage } from "./pages/ProblemDataPage";
import { ProblemDataEditPage } from "./pages/ProblemDataEditPage";
import { JobPage } from "./pages/JobPage";
import { JobResultPage } from "./pages/JobResultPage";
import { EditProblemPage } from "./pages/EditProblemPage";
import { SolverPage } from "./pages/SolverPage";
import { JobList } from "./pages/JobList";

const location = new ReactLocation();

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  isAdminRoute?: boolean;
}> = ({ children, isAdminRoute }) => {
  const { isLoggedIn, user } = useGlobalState();

  if (!isLoggedIn) {
    return <Navigate to={"/login "} />;
  }

  if (isAdminRoute && user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

const Routes: React.FC = () => {
  const { login } = useGlobalState();

  // on start-up
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      login(token);
    }
  }, []);

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
          path: "/problems/:id/data/:data_id/job",
          element: (
            <ProtectedRoute>
              <Layout>
                <JobPage />
              </Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: "/problems/:id/data/:data_id",
          element: (
            <ProtectedRoute>
              <Layout>
                <ProblemDataEditPage />
              </Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: "/problems/:id/edit",
          element: (
            <ProtectedRoute>
              <Layout>
                <EditProblemPage />
              </Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: "/problems/:id/data",
          element: (
            <ProtectedRoute>
              <Layout>
                <ProblemDataPage />
              </Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: "/problems/:id",
          element: (
            <ProtectedRoute>
              <Layout>
                <ProblemPage />
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
          path: "/solver-config/:id",
          element: (
            <ProtectedRoute isAdminRoute={true}>
              <Layout>
                <SolverPage />
              </Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: "/solver-config",
          element: (
            <ProtectedRoute isAdminRoute={true}>
              <Layout>
                <SolverConfiguration />
              </Layout>
            </ProtectedRoute>
          ),
        },

        {
          path: "/users",
          element: (
            <ProtectedRoute isAdminRoute={true}>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          ),
        },
        {
          path: "/jobs/:id",
          element: (
            <Layout>
              <JobResultPage />
            </Layout>
          ),
        },
        {
          path: "/jobs",
          element: (
            <ProtectedRoute>
              <Layout>
                <JobList />
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
