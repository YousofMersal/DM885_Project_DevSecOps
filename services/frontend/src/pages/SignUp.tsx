import React, { useState } from "react";
import { apiSignup } from "../request";
import { Link, useNavigate } from "@tanstack/react-location";
import { authServicePayload, handleError } from "../utils/common";
import { Button, Form, Input, Space, Typography } from "antd";
import FormItem from "antd/es/form/FormItem";

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const signUpPayload = authServicePayload.parse({
        email: form.get("email"),
        password: form.get("password"),
      });

      await apiSignup(signUpPayload);

      navigate({
        to: "/",
      });
    } catch (e: unknown) {
      setError(handleError(e));
    }
  };

  return (
    <div className="center">
      <form onSubmit={handleSubmit} style={{ width: 500 }}>
        <Typography.Title style={{ marginBottom: 50 }}>
          Sign up
        </Typography.Title>
        <Form.Item label="Email">
          <Input required id="email" name="email" type="email" />
        </Form.Item>
        <Form.Item label="Password">
          <Input
            required
            pattern="^.{5,}$"
            id="password"
            name="password"
            type="password"
          />
        </Form.Item>
        {error ? (
          <Typography.Paragraph style={{ color: "red" }}>
            {error}
          </Typography.Paragraph>
        ) : (
          <Typography.Paragraph className="helper-text">
            Your password should be 5 characters or more
          </Typography.Paragraph>
        )}
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              Create profile
            </Button>
            <Link to="/login">
              <Button>Got a profile? Login</Button>
            </Link>
          </Space>
        </Form.Item>
      </form>
    </div>
  );
};
