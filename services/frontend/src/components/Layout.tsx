import { Link } from "@tanstack/react-location";
import React from "react";
import { useGlobalState } from "../utils/store";
import { Container } from "./Container";

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<ILayoutProps> = ({ children }) => {
  const { logout, user } = useGlobalState();

  return (
    <div>
      <header>
        <span>Frontend</span>
        <div className="nav-items">
          <Link to="/">Models</Link>
          {user?.role === "admin" && <Link to="/solver-config">Solvers</Link>}
          {user?.role === "admin" && <Link to="/users">Users</Link>}
        </div>
        <div style={{ flex: 1 }} />
        <Link to="/login" onClick={logout}>
          Log out
        </Link>
      </header>
      <Container>{children}</Container>
    </div>
  );
};
