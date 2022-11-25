import { Link } from "@tanstack/react-location";
import React from "react";
import { useGlobalState } from "../utils/store";
import { Container } from "./Container";

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<ILayoutProps> = ({ children }) => {
  const { setLoggedInState } = useGlobalState();

  return (
    <div>
      <header>
        <span>Frontend</span>
        <div className="nav-items">
          <Link to="/">Home</Link>
          <Link to="/solver-config">Configuration</Link>
        </div>
        <div style={{ flex: 1 }} />
        <Link
          to="/login"
          onClick={() => {
            setLoggedInState(false);
          }}
        >
          Log out
        </Link>
      </header>
      <Container>{children}</Container>
    </div>
  );
};
