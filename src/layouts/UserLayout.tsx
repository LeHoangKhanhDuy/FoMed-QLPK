import React, { useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "../component/Navbar/Navbar";
import Footer from "../component/Footer/Footer";
import Sidebar from "../component/Account/Sidebar";

type UserLayoutProps = {
  children: ReactNode;
};

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row min-h-screen p-4 mx-auto max-w-7xl px-4 lg:px-0 space-y-4 md:space-y-0 md:space-x-4">
        <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        <div
          className={`w-full transition-all duration-300 ${
            isCollapsed ? "md:w-[calc(100%-70px)]" : "md:w-3/4"
          } bg-white p-6 rounded-lg shadow-xs ring-1 ring-slate-100`}
        >
          {children}
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
      <Footer />
    </>
  );
};

export default UserLayout;
