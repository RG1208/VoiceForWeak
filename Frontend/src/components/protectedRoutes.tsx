import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute() {
    const token = localStorage.getItem("token");
    const location = useLocation();

    // If token not found, redirect to /login
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Allow access
    return <Outlet />;
}
