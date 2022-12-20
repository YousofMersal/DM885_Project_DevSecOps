import { Link, Navigate } from "@tanstack/react-location";
import React, { useState } from "react";
import { LoginButton } from "../components/LoginButton";
import { useGlobalState } from "../utils/store";
import "./Login.css";
import { apiLogin } from "../request";
import { authServicePayload, handleError } from "../utils/common";
import { Button, Form, Input, Space, Typography } from "antd";

export const Login: React.FC = () => {
  const { isLoggedIn, login } = useGlobalState();
  const [error, setError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const signUpPayload = authServicePayload.parse({
        email: form.get("username"),
        password: form.get("password"),
      });

      const response = await apiLogin({
        email: signUpPayload.email,
        password: signUpPayload.password,
      });

      login(response.token);
    } catch (e) {
      setError(handleError(e));
    }
  };

  return (
    <div className="center">
      <form onSubmit={handleSubmit} style={{ width: 500 }}>
        <Typography.Title style={{ marginBottom: 50 }}>Login</Typography.Title>
        <div>
          <Form.Item label="Username" required={true}>
            <Input name="username" required={true} minLength={1} type="email" />
          </Form.Item>
        </div>
        <div>
          <Form.Item label="Password" required={true}>
            <Input
              name="password"
              required={true}
              minLength={1}
              type="password"
            />
          </Form.Item>
        </div>
        {error ? (
          <Typography.Paragraph style={{ color: "red" }}>
            {error}
          </Typography.Paragraph>
        ) : null}
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
            <Link to="/sign-up">
              <Button>Create profile</Button>
            </Link>
          </Space>
        </Form.Item>
      </form>
      {isLoggedIn && <Navigate to="/" />}
    </div>
  );
};
