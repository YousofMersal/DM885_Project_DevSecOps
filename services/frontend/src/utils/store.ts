import create from "zustand";

type GlobalState = {
  isLoggedIn: boolean;
  setLoggedInState: (isLoggedIn: boolean) => void;
};

export const useGlobalState = create<GlobalState>((set) => ({
  isLoggedIn: false,
  setLoggedInState: () =>
    set((prev) => ({
      isLoggedIn: !prev.isLoggedIn,
    })),
}));
