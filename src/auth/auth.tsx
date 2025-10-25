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
  const [isInitialized, setIsInitialized] = useState(false);

  // Khôi phục user từ localStorage khi app khởi động
  useEffect(() => {
    // Khôi phục từ auth_user trước
    const authRaw = localStorage.getItem(AUTH_KEY);
    if (authRaw) {
      try {
        const parsed = JSON.parse(authRaw);
        if (isUser(parsed)) {
          setUser(parsed);
          setIsInitialized(true);
          return;
        } else {
          console.warn("⚠️ Invalid auth_user format, removing...");
          localStorage.removeItem(AUTH_KEY);
        }
      } catch (e) {
        console.error("❌ Error parsing auth_user:", e);
        localStorage.removeItem(AUTH_KEY);
      }
    }

    // Nếu không có auth_user, thử rebuild từ userInfo + userToken
    const userToken = localStorage.getItem("userToken");
    const userInfoRaw = localStorage.getItem("userInfo");
    
    if (userToken && userInfoRaw) {
      try {
        const userInfo = JSON.parse(userInfoRaw);
        const rebuiltUser: User = {
          id: userInfo.userId || 0,
          email: userInfo.email || "",
          roles: (userInfo.roles || []).map((r: string) => r.toUpperCase() as Role),
          token: userToken,
          name: userInfo.name || null,
        };
        
        if (rebuiltUser.id && rebuiltUser.email && rebuiltUser.token) {
          setUser(rebuiltUser);
          // Lưu vào auth_user để lần sau không phải rebuild
          localStorage.setItem(AUTH_KEY, JSON.stringify(rebuiltUser));
        } else {
          console.warn("⚠️ Incomplete user data, cannot rebuild");
        }
      } catch (e) {
        console.error("❌ Error rebuilding user:", e);
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Listen sự kiện logout từ bên ngoài (interceptor, etc.)
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log("🚪 Received auth:logout event - clearing user state");
      setUser(null);
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Nếu auth_user hoặc userToken bị xóa, clear state
      if (
        (e.key === AUTH_KEY || e.key === "userToken") &&
        e.newValue === null
      ) {
        console.log("🚪 Storage cleared - logging out user");
        setUser(null);
      }
    };

    // Listen custom event từ interceptor
    window.addEventListener("auth:logout", handleAuthLogout);
    // Listen storage event (khi localStorage thay đổi)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
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

  // Đợi initialization xong mới render children
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
