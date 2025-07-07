// src/components/ProtectedLayout.jsx
import { Outlet } from "react-router-dom";
import ProtectedHeader from "./protectedHeader";

export default function ProtectedLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ProtectedHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
