import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type Props = {
    children: React.ReactNode;
};

export default function PublicOnlyRoute({ children }: Props) {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
