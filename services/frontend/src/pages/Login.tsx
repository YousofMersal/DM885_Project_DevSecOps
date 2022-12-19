import { Link, Navigate } from "@tanstack/react-location";
import React, { useState } from "react";
import { LoginButton } from "../components/LoginButton";
import { useGlobalState } from "../utils/store";
import "./Login.css";
import { apiLogin } from "../request";
import { authServicePayload, handleError } from "../utils/common";

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
        <h1>Login</h1>
        <div>
          <label htmlFor="username">Email</label>
          <input
            minLength={1}
            name="username"
            id="username"
            required={true}
            type="email"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            minLength={1}
            name="password"
            id="password"
            type="password"
            required={true}
          />
        </div>
        {error ? <p style={{ color: "red" }}>{error}</p> : null}
        <LoginButton />
        <div>
          <p>Not yet a user?</p>
          <Link to="/sign-up">Create profile</Link>
        </div>
      </form>
      {isLoggedIn && <Navigate to="/" />}
    </div>
  );
};
