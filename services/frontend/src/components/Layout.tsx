import { Link } from "@tanstack/react-location";
import { Content, Header } from "antd/es/layout/layout";
import { Layout as AntLayout, Typography } from "antd";
import React from "react";
import { useGlobalState } from "../utils/store";
import { Container } from "./Container";

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<ILayoutProps> = ({ children }) => {
  const { logout, user } = useGlobalState();

  return (
    <AntLayout>
      <Header>
        <Typography.Title
          style={{ color: "white", fontSize: 18, marginBottom: 0 }}
        >
          Frontend
        </Typography.Title>
        <div className="nav-items">
          <Link to="/">Models</Link>
          <Link to="/jobs">Jobs</Link>
          {user?.role === "admin" && <Link to="/solver-config">Solvers</Link>}
          {user?.role === "admin" && <Link to="/users">Users</Link>}
        </div>
        <div style={{ flex: 1 }} />
        <Link to="/login" onClick={logout}>
          Log out
        </Link>
      </Header>
      <Content
        style={{ padding: "20px 50px", minHeight: "calc(100vh - 65px)" }}
      >
        {children}
      </Content>
    </AntLayout>
  );
};
