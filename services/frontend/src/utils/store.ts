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

    const decodedToken: { role: Role } | undefined = jwt_decode(token);

    const role = decodedToken?.role;

    set({
      isLoggedIn: true,
      user: {
        email: "",
        role: role ?? "user",
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
