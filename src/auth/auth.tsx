import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Role = "ADMIN" | "DOCTOR" | "EMPLOYEE" | "USER";
export type User = {
  id: number;
  email: string;
  roles: Role[];
  token: string;
  name?: string | null;
};

type AuthCtx = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  hasRole: (r: Role | Role[]) => boolean;
};

const AUTH_KEY = "auth_user";
const AuthContext = createContext<AuthCtx | undefined>(undefined);

function isUser(v: unknown): v is User {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "number" &&
    typeof r.email === "string" &&
    typeof r.token === "string" &&
    Array.isArray(r.roles)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (isUser(parsed)) setUser(parsed);
      else localStorage.removeItem(AUTH_KEY);
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const hasRole = useCallback(
    (r: Role | Role[]) => {
      if (!user) return false;
      const need = Array.isArray(r) ? r : [r];
      return user.roles.some((role) => need.includes(role));
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, login, logout, hasRole }),
    [user, hasRole]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
