import { useCallback, useEffect, useState } from "react";
import {
  getProfile,
  readUserFromStorage,
  USER_TOKEN_KEY,
} from "../services/auth";

// Kiểu UI bạn đang dùng tại component UserInfo
export type UserUI = {
  id: number;
  email: string;
  name: string;
  created_at: string;
  phone: string | number;
  points: number;
  avatar: string;
};

function mapToUserUI(profile: {
  userId: number;
  email: string;
  name: string;
  phone: string;
  // các field khác từ profile không cần cho UI này
}): UserUI {
  return {
    id: profile.userId,
    email: profile.email,
    name: profile.name || profile.email,
    created_at: new Date().toISOString(), // nếu BE chưa trả, tạm thời dùng now
    phone: profile.phone || "",
    points: 0, // nếu BE có điểm, map lại ở đây
    avatar: "", // nếu BE có avatar, map vào đây
  };
}

export function useUserInfo() {
  const [user, setUser] = useState<UserUI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(USER_TOKEN_KEY) || "";
      if (!token) {
        setUser(null);
        return;
      }

      // lấy nhanh từ storage để có UI tức thì
      const cached = readUserFromStorage();
      if (cached) setUser(mapToUserUI(cached));

      // gọi /profile để có userId & dữ liệu mới
      const fresh = await getProfile(token);
      setUser(mapToUserUI(fresh));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    // Khi login/logout ở nơi khác, ta tự refresh
    const h = () => fetchUser();
    window.addEventListener("auth:updated", h);
    return () => window.removeEventListener("auth:updated", h);
  }, [fetchUser]);

  return { user, loading, refresh: fetchUser, setUser };
}
