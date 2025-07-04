import { Outlet, useLocation } from "react-router-dom";
import ProtectedHeader from "./protectedHeader";
import PublicHeader from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const location = useLocation();

  const protectedPaths = ["/dashboard", "/voice-assistant", "/scheme-recommender"];
  const isProtected = protectedPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      {isProtected ? <ProtectedHeader /> : <PublicHeader />}

      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
