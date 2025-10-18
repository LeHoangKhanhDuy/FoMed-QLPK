// src/hooks/useUser.ts
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
};
