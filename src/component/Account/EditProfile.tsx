
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { updateProfile } from "../../services/auth";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdated?: () => void;
}
interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  phone: string | number;
  avatar?: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdated
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Track xem đã khởi tạo giá trị cho lần mở modal này chưa
  const initializedRef = useRef(false);

  // Reset khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
    }
  }, [isOpen]);

  // Chỉ set giá trị ban đầu khi modal mở lần đầu, không reset khi đang nhập
  useEffect(() => {
    if (isOpen && user && !initializedRef.current) {
      setName(user.name || "");
      setPhone(user.phone?.toString() || "");
      setEmail(user.email || "");
      initializedRef.current = true;
    }
  }, [isOpen, user]); // Bây giờ có thể thêm user vào dependency an toàn

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    
    // Validate phone nếu có nhập
    if (phone && !/^0\d{9}$/.test(phone)) {
      toast.error("Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)");
      return;
    }

    setLoading(true);
    try {
      const updateData: { name: string; phone?: string } = {
        name: name.trim(),
      };
      
      // CHỈ gửi phone nếu có giá trị và khác rỗng
      if (phone && phone.trim()) {
        updateData.phone = phone.trim();
      }
      
      console.log("Submitting update profile with:", updateData);
      
      await updateProfile(updateData);
      
      toast.success("Cập nhật thông tin thành công!");
      onClose();
      
      // Trigger refresh user info
      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Cập nhật thất bại";
      toast.error(errorMessage);
      console.error("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4 sm:px-6 md:px-0">
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">
          Chỉnh sửa thông tin cá nhân
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Họ và tên</label>
            <input
              className="w-full mt-2 p-2 border rounded-[var(--rounded)] px-4 py-2.5 border-gray-300 focus:border-gray-400 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <input
              className="w-full mt-2 p-2 border rounded-[var(--rounded)] px-4 py-2.5 border-gray-300 focus:border-gray-400 outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full mt-2 p-2 border rounded-[var(--rounded)] px-4 py-2.5 border-gray-300 bg-gray-100 cursor-not-allowed outline-none"
              value={email}
              disabled
              readOnly
              title="Email không thể thay đổi"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-[var(--rounded)] border text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 rounded-[var(--rounded)] bg-primary-linear text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;
