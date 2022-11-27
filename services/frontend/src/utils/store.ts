import create from "zustand";

type GlobalState = {
  isLoggedIn: boolean;
  user?: {
    email: string;
    role: "admin" | "user";
  };
  login: () => void;
  logout: () => void;
};

export const useGlobalState = create<GlobalState>((set) => ({
  isLoggedIn: false,
  login: () => {
    set({
      isLoggedIn: true,
      user: {
        email: "test-user@gmail.com",
        role: "admin",
      },
    });
  },
  logout: () => {
    set({
      isLoggedIn: false,
      user: undefined,
    });
  },
  user: undefined,
}));
