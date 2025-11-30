import toast from "react-hot-toast";

/**
 * Hiện thông báo toast khi người dùng mở chức năng chưa sẵn sàng.
 */
export function showComingSoon() {
  toast("Chức năng đang được phát triển", {
    icon: "🚧",
    style: {
      borderRadius: "12px",
      background: "#1e293b",
      color: "#f8fafc",
    },
  });
}
