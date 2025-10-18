import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { Link } from "react-router-dom";
import EditProfileModal from "./EditProfile";

/* ==== Lấy từ services/auth ==== */
import {
  getProfile,
  readUserFromStorage,
  USER_TOKEN_KEY,
} from "../../services/auth";
import type { AppUser } from "../../types/auth/login";

/* ==== Kiểu dữ liệu UI hiện tại ==== */
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  phone: string | number;
  points: number;
  avatar: string;
}

type Props = {
  /** (Tuỳ chọn) dữ liệu do parent cung cấp; nếu không có, component sẽ tự fetch */
  user?: User | null;
  /** Upload avatar (parent sẽ gọi API ở ngoài) */
  onChangeAvatar?: (file: File) => void | Promise<void>;
  /** Cho phép hiện dot online xanh ở avatar (mặc định true) */
  showOnlineDot?: boolean;
};

function mapToUserUI(appUser: AppUser): User {
  return {
    id: appUser.userId,
    email: appUser.email,
    name: appUser.name || appUser.email,
    created_at: appUser.createdAt || "", // ✅
    phone: appUser.phone || "",
    points: appUser.points ?? 0,
    avatar: appUser.avatarUrl ?? "",
  };
}
export default function UserInfo({
  user: userFromProps,
  onChangeAvatar,
  showOnlineDot = true,
}: Props) {
  const [user, setUser] = useState<User | null>(userFromProps ?? null);
  const [loading, setLoading] = useState<boolean>(!userFromProps);
  const [showPhone, setShowPhone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChangeAvatar?.(file);
  };

  // Tự fetch user nếu parent không truyền vào
  useEffect(() => {
    if (userFromProps) {
      setUser(userFromProps);
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(USER_TOKEN_KEY) || "";
        if (!token) {
          setUser(null);
          return;
        }

        // Hiển thị nhanh từ localStorage (nếu có)
        const cached = readUserFromStorage();
        if (cached) setUser(mapToUserUI(cached));

        // Lấy mới từ /profile để có userId, tên chuẩn, v.v.
        const fresh = await getProfile(token);
        setUser(mapToUserUI(fresh));
      } finally {
        setLoading(false);
      }
    };

    run();

    // Tự refresh khi login/logout nơi khác
    const h = () => run();
    window.addEventListener("auth:updated", h);
    return () => window.removeEventListener("auth:updated", h);
  }, [userFromProps]);

  return (
    <div className="min-h-screen p-4 px-0 sm:px-2 lg:px-0 mx-auto max-w-screen-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Avatar - 1/4 */}
        <div className="col-span-1 p-5 border border-gray-200 rounded-lg lg:p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-24 h-24">
              <div className="w-24 h-24 overflow-hidden border border-gray-200 rounded-full">
                <img
                  src={
                    user && user.avatar && user.avatar.trim() !== ""
                      ? user.avatar
                      : defaultAvatar
                  }
                  alt="Avatar"
                  onClick={openFilePicker}
                  className="w-full h-full rounded-full object-cover cursor-pointer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                />
              </div>

              {showOnlineDot && (
                <div className="absolute top-2 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <p className="text-xs text-center text-gray-800">
              Chọn ảnh dưới 5MB. Ảnh phải phù hợp không được phản cảm
            </p>

            <button
              type="button"
              onClick={openFilePicker}
              className="w-full flex justify-center items-center gap-2 rounded-[var(--rounded)] bg-primary-linear px-4 py-2 text-white text-sm font-medium cursor-pointer"
            >
              <Pencil size={16} />
              Sửa ảnh
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Thông tin cá nhân - 3/4 */}
        <div className="col-span-1 lg:col-span-3 p-5 border border-gray-200 rounded-2xl lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Thông tin cá nhân</h2>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-[var(--rounded)] bg-primary-linear px-4 py-2 text-sm text-white font-medium cursor-pointer"
            >
              <Pencil size={16} />
              Sửa
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
            {loading ? (
              <div className="col-span-2 text-gray-500">
                Đang tải thông tin…
              </div>
            ) : user ? (
              <>
                <div>
                  <p>Họ và tên</p>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>

                <div>
                  <p>Email</p>
                  <p className="text-lg font-semibold break-all">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p>Số điện thoại</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">
                      {!showPhone ? (
                        <>
                          <span className="tracking-widest">********</span>
                          {user.phone ? user.phone.toString().slice(-3) : "???"}
                        </>
                      ) : (
                        user.phone || "Chưa có"
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowPhone((v) => !v)}
                      className="text-gray-500 cursor-pointer"
                      aria-label={
                        showPhone ? "Ẩn số điện thoại" : "Hiện số điện thoại"
                      }
                      title={
                        showPhone ? "Ẩn số điện thoại" : "Hiện số điện thoại"
                      }
                    >
                      {showPhone ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <p>Ngày tham gia</p>
                  <p className="text-lg font-semibold">
                    {user.created_at ? new Date(user.created_at).toLocaleString("vi-VN") : "—"}
                  </p>
                </div>

                <div className="mt-4">
                  <Link to="/user/details/change-password">
                    <span className="bg-primary-linear rounded-[var(--rounded)] text-white py-2 px-4 cursor-pointer">
                      Đổi mật khẩu
                    </span>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-red-500">Không có dữ liệu người dùng!</p>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
    </div>
  );
}
