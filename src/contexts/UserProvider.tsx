// src/contexts/UserProvider.tsx
import { useEffect, useMemo, useState } from "react";
import type { AppUser } from "../types/auth/login";
import {
  UserContext,
  USER_INFO_KEY,
  USER_TOKEN_KEY,
  type UserCtx,
} from "../contexts/UserContext";

const readUser = (): AppUser | null => {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as unknown;
    if (obj && typeof obj === "object" && "email" in obj) {
      const u = obj as AppUser;
      return { ...u, roles: Array.isArray(u.roles) ? u.roles : [] };
    }
    return null;
  } catch {
    return null;
  }
};

export const UserProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUserState] = useState<AppUser | null>(readUser());

  const setUser = (u: AppUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem(USER_INFO_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_INFO_KEY);
  };

  const logout = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    setUserState(null);
    window.dispatchEvent(new CustomEvent("auth:logout"));
  };

  // đồng bộ khi thay đổi ở tab khác
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_INFO_KEY) setUserState(readUser());
      if (e.key === USER_TOKEN_KEY && e.newValue === null) setUserState(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // nghe sự kiện nội bộ
  useEffect(() => {
    const onLogin = () => setUserState(readUser());
    const onLogout = () => setUserState(null);
    window.addEventListener("auth:login", onLogin as EventListener);
    window.addEventListener("auth:logout", onLogout as EventListener);
    return () => {
      window.removeEventListener("auth:login", onLogin as EventListener);
      window.removeEventListener("auth:logout", onLogout as EventListener);
    };
  }, []);

  const value = useMemo<UserCtx>(() => ({ user, setUser, logout }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
