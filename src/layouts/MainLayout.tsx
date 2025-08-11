import type { ReactNode } from "react";


type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      {children}
      {/* <Toaster position="top-right" reverseOrder={false} />
      <Footer />
      <ScrollToTop /> */}
    </>
  );
};
export default MainLayout;
