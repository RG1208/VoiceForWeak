// src/components/ProtectedLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import ProtectedHeader from "./protectedHeader";

export default function ProtectedLayout() {
  const location = useLocation();

  // Define routes where header should be shown
  const showHeaderRoutes = ["/dashboard", "/scheme-recommendor"];
  const shouldShowHeader = showHeaderRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {shouldShowHeader && <ProtectedHeader />}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
