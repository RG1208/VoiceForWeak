import { Outlet } from "react-router-dom";
import PublicHeader from "./PublicHeader"; // your existing non-protected header

export default function Layout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
    </>
  );
}
