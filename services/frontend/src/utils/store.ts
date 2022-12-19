import create from "zustand";
import jwt_decode from "jwt-decode";

type Role = "admin" | "user";

type GlobalState = {
  isLoggedIn: boolean;
  user?: {
    email: string;
    role: Role;
  };
  login: (token: string) => void;
  logout: () => void;
};

export const useGlobalState = create<GlobalState>((set) => ({
  isLoggedIn: false,
  login: (token: string) => {
    localStorage.setItem("token", token);

    const decodedToken = jwt_decode(token);

    const role =
      typeof decodedToken === "object" &&
      decodedToken !== null &&
      "role" in decodedToken
        ? (decodedToken.role as Role)
        : "user";

    set({
      isLoggedIn: true,
      user: {
        email: "",
        role,
      },
    });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({
      isLoggedIn: false,
      user: undefined,
    });
  },
  user: undefined,
}));
