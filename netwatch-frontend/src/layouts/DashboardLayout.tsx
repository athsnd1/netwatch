import BottomBar from "@/components/BottomBar";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";


export default function DashboardLayout() {
  // Initialize notifications globally so they work across all dashboard pages
  useNotifications();


  return (
    <div className="h-dvh bg-bgcol w-screen overflow-x-hidden scrollbar-gutter-auto">

        <Navbar />

        <div className="flex gap-1 pr-4 h-full w-full bg-light">
            <Sidebar />
            <div className="ml-0 sm:ml-[160px] w-full h-full">
              <Outlet />
            </div>
        </div>

        <BottomBar />

    </div>
  )
}
