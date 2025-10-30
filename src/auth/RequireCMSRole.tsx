import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import type { JSX } from "react";

const CMS_ROLES = ["ADMIN", "DOCTOR", "EMPLOYEE"] as const;
type CmsRole = (typeof CMS_ROLES)[number];

export default function RequireCMSRole({
  children,
}: {
  children: JSX.Element;
}) {
  const { user } = useAuth();
  const loc = useLocation();

  // Chưa đăng nhập -> về trang login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  // Không có quyền CMS -> 403
  const ok = user.roles.some((r) => {
    const normalized = r.toUpperCase();
    return CMS_ROLES.includes(normalized as CmsRole);
  });

  if (!ok) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
