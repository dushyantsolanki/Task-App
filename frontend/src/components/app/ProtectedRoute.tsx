// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

import { useAuthStore } from "@/store/authStore";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles = [] }: Props) {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    console.log('allowRoles :: ', allowedRoles)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }



    // if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    //     return <Navigate to="/unauthorized" replace />;
    // }

    return <>{children}</>;
}
