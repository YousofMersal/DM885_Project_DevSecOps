import { Link, Navigate } from "@tanstack/react-location";
import React from "react";
import { LoginButton } from "../components/LoginButton";
import { useGlobalState } from "../utils/store";
import "./Login.css";
import { apiLogin } from "../request";
import { authServicePayload } from "../utils/common";

export const Login: React.FC = () => {
  const { isLoggedIn, setLoggedInState } = useGlobalState();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const signUpPayload = authServicePayload.parse({
      email: form.get("username"),
      password: form.get("password"),
    });

    try {
      setLoggedInState(true);

      await apiLogin({
        email: signUpPayload.email,
        password: signUpPayload.password,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="center">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div className="container">
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
          <LoginButton />
          <div>
            <p>Not yet a user?</p>
            <Link to="/sign-up">Create profile</Link>
          </div>
        </div>
      </form>
      {isLoggedIn && <Navigate to="/" />}
    </div>
  );
};
