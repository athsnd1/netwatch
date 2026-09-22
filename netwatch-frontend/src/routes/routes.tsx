import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import LoadingPage from "@/pages/LoadingPage";
import ErrorPage from "@/pages/ErrorPage";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import { WelcomePage, DashboardPage, LogsPage, DevicesPage, AddDevicePage, EditDevicePage, DeviceDetailPage, WebServerMonitorPage, SignInPage, SignUpPage } from './LazyRoutes';


const router = createBrowserRouter([
    {
        path: "/",
        element: (<Suspense fallback={<LoadingPage />}><WelcomePage /></Suspense>),
        errorElement: <ErrorPage />
    },

    {
        element: <ProtectedLayout />,
        children:[
            {
            path: "/dashboard",
            element: (<Suspense fallback={<LoadingPage />}><DashboardLayout /></Suspense>),
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: "logs",
                    element: <LogsPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: "devices",
                    element: <DevicesPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: "devices/:id",
                    element: <DeviceDetailPage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: "add",
                    element: <AddDevicePage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: "devices/:id/edit",
                    element: <EditDevicePage />,
                    errorElement: <ErrorPage />
                },
                {
                    path: "webserver",
                    element: <WebServerMonitorPage />,
                    errorElement: <ErrorPage />
                }
            ],
            errorElement: <ErrorPage />
    }]},

    {
        path: "/sign-in/*",
        element: (<Suspense fallback={<LoadingPage />}>
                    <SignInPage />
                </Suspense>),
        errorElement: <ErrorPage />
    },

    {
        path: "/sign-up/*",
        element: (<Suspense fallback={<LoadingPage />}> 
                    <SignUpPage />
                </Suspense>),
        errorElement: <ErrorPage />
    },

]);

export default router;