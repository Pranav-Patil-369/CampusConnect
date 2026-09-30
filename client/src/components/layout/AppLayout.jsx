import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-6 py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;