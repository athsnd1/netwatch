import { lazy } from "react";

export const WelcomePage = lazy(() => import("@/pages/WelcomePage"));
export const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
export const LogsPage = lazy(() => import("@/pages/LogsPage"));
export const DevicesPage = lazy(() => import("@/pages/DevicesPage"));
export const AddDevicePage = lazy(() => import("@/pages/AddDevicePage"));
export const EditDevicePage = lazy(() => import("@/pages/EditDevicePage"));
export const DeviceDetailPage = lazy(() => import("@/pages/DeviceDetailPage"));
export const WebServerMonitorPage = lazy(() => import("@/pages/WebServerMonitorPage"));
export const SignInPage = lazy(() => import("@/pages/SignInPage"));
export const SignUpPage = lazy(() => import("@/pages/SignUpPage"));