import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '@clerk/react';
import LoadingPage from "@/pages/LoadingPage";

export default function ProtectedLayout() {

    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return <LoadingPage />
    }

    if (!isSignedIn) {
        return <Navigate to="/" replace/>
    }

  return <Outlet />
}
