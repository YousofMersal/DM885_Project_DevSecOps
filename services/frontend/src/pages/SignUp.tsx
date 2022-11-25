import React from "react";
import { apiSignup } from "../request";
import { z, ZodError } from "zod";
import { Link, useLocation, useNavigate } from "@tanstack/react-location";
import { authServicePayload } from "../utils/common";

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const signUpPayload = authServicePayload.parse({
      email: form.get("email"),
      password: form.get("password"),
    });

    try {
      await apiSignup(signUpPayload);

      navigate({
        to: "/",
      });
    } catch (e: unknown) {
      console.log("handleSubmit failed", e);
    }
  };

  return (
    <div className="center">
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email (username)</label>
        <input required id="email" name="email" type="email" />
        <label htmlFor="password">Password</label>
        <input
          required
          pattern="^.{5,}$"
          id="password"
          name="password"
          type="password"
        />
        <p className="helper-text">
          Your password should be 5 characters or more
        </p>
        <button>Create profile</button>
      </form>
      <div>
        <p>Already have a user?</p>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
};
