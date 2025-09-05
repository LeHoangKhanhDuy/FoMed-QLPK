import { useState, type ReactNode } from "react";

import CMSNavbar from "../component/Admin/Menu/CMSNavbar";
import CMSSidebar from "../component/Admin/Menu/CMSSidebar";

type CSMLayoutProps = {
  children: ReactNode;
};

export default function CSMLayout({ children }: CSMLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CMSNavbar onToggleSidebar={() => setOpen((v) => !v)} />

      {/* Sidebar mobile */}
      <div
        className={[
          "fixed inset-0 z-30 sm:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        onClick={() => setOpen(false)}
      >
        <div
          className={[
            "absolute left-0 top-14 h-[calc(100dvh-56px)] w-72 bg-white border-r shadow-xl transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <CMSSidebar />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden sm:block">
        <div className="fixed left-0 top-0 h-screen pt-14">
          <CMSSidebar />
        </div>
      </div>

      {/* Content */}
      <main className="pt-2 sm:pl-64">
        <div className="max-w-screen-3xl mx-auto p-3 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
