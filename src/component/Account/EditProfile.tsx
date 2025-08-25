
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  // onUpdated: () => void;
}
interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  phone: string | number;
  points: number;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  // onUpdated
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone?.toString() || "");
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name || !phone) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    const isValidPhone = /^0\d{9}$/.test(phone);
    if (!isValidPhone) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    try {
      onClose();
      //onUpdated(); 
    } catch (error) {
      toast.error("Cập nhật thất bại");
      console.error(error);
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
              className="w-full mt-2 p-2 border rounded-[var(--rounded)] px-4 py-2.5 border-gray-300 focus:border-gray-400 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            className="px-6 py-2 rounded-[var(--rounded)] bg-primary-linear text-white cursor-pointer"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;
