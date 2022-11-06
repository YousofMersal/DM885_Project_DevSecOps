import { Navigate } from "@tanstack/react-location";
import React from "react";
import { LoginButton } from "../components/LoginButton";
import { useGlobalState } from "../utils/store";
import "./Login.css";
import { apiLogin } from "../request";

export const Login: React.FC = () => {
  const { isLoggedIn, setLoggedInState } = useGlobalState();

  const handleSubmit:
    | React.FormEventHandler<HTMLFormElement>
    | undefined = async (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const username = form.get("username");
    const password = form.get("password");

    if (!username || !password) {
      // TODO: show error
      return;
    }

    try {
      await apiLogin(form);
    } catch (e) {
      console.log(e);
      window.alert("handleSubmit failed");
    }
  };

  return (
    <div className="Login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <div>
            <label htmlFor="username">Email</label>
            <input
              minLength={1}
              name="username"
              id="username"
              required={true}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              minLength={1}
              name="password"
              id="password"
              required={true}
            />
          </div>
          <LoginButton />
          <div>
            <p>Not yet a user?</p>
            <button>Create profile</button>
          </div>
        </div>
      </form>
      {isLoggedIn && <Navigate to="/" />}
    </div>
  );
};
