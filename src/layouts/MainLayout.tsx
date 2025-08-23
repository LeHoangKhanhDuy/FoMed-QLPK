import type { ReactNode } from "react";


type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};
export default MainLayout;
