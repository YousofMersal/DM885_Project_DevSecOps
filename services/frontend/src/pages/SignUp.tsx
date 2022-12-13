import React, { useState } from "react";
import { apiSignup } from "../request";
import { Link, useNavigate } from "@tanstack/react-location";
import { authServicePayload, handleError } from "../utils/common";
import { ZodError } from "zod";

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
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <p className="helper-text">
            Your password should be 5 characters or more
          </p>
        )}
        <button>Create profile</button>
      </form>
      <div>
        <p>Already have a user?</p>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
};
