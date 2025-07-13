import { lazy, type FC, type JSX, type LazyExoticComponent } from "react";
import AuthLayout from "@/layout/AuthLayout";
import ForgotPasswordForm from "@/form/ForgotPasswordForm";
import ProtectedRoute from "@/components/app/ProtectedRoute";
import PublicOnlyRoute from "@/components/app/PublicOnlyRoute";
import { Search } from "@/pages/Search";
import { Dashboard } from "@/components/app/components/Dashboard";
import { Todo } from "@/components/app/components/Todo";
import Profile from "@/components/app/components/Profile";

const LoginForm = lazy(() => import("@/form/LoginForm"));
const RegisterForm = lazy(() => import("@/form/RegisterForm"));
const OtpVerifyForm = lazy(() => import("@/form/OtpVerifyForm"));
const DashboardLayout = lazy(() => import("@/layout/DashboardLayout"));

const Home = () => {
  return <div>Home</div>;
};

type RouteChild = {
  path: string;
  element: JSX.Element;
  allowedRoles?: string[];
};

export type RouteConfig = {
  layout: FC<{}> | LazyExoticComponent<() => JSX.Element>;
  guard?: FC<{ children: React.ReactNode }>;
  children: RouteChild[];
};

export const routes: RouteConfig[] = [

  {
    layout: AuthLayout,
    guard: PublicOnlyRoute,
    children: [
      { path: "/login", element: <LoginForm /> },
      { path: "/register", element: <RegisterForm /> },
      { path: "/verify-otp", element: <OtpVerifyForm /> },
      { path: "/forgot-password", element: <ForgotPasswordForm /> },
    ],
  },
  {
    layout: DashboardLayout,
    guard: ProtectedRoute,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/search", element: <Search /> },
      { path: "/todo", element: <Todo /> },
      { path: "/settings/profile", element: <Profile /> },
      // { path: '/dashboard/profile', element: <Profile /> },
      // {
      //   path: '/dashboard/admin',
      //   element: <AdminPanel />,
      //   allowedRoles: ['admin'],
      // },
    ],
  },
];
