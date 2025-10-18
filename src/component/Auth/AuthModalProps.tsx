import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { Fragment, useState } from "react";
import LoginForm from "../Auth/LoginForm";
import SignupForm from "../Auth/SignupForm";
import type { AppUser } from "../../types/auth/login";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (u: AppUser) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const toggleMode = () => setIsLogin(!isLogin);

  // callback nhận user từ form
  const handleSuccess = (u: AppUser) => {
    window.dispatchEvent(new Event("auth:updated"));
    onSuccess?.(u); // báo ngược cho Navbar setUser(...)
    onClose(); // đóng modal
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[12000]" onClose={onClose}>
        {/* Overlay mờ nền */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-md bg-white shadow-xl relative">
                {/* Nút đóng */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-600 cursor-pointer transition"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Nội dung cuộn nếu dài */}
                <div className="pt-12 px-6 pb-6 overflow-y-auto max-h-[90vh]">
                  {isLogin ? (
                    <LoginForm
                      onSuccess={handleSuccess}
                      onSwitchMode={toggleMode}
                    />
                  ) : (
                    <SignupForm
                      //onSuccess={handleSuccess}
                      onSwitchMode={toggleMode}
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
