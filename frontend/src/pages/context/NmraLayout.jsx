import { Outlet } from "react-router-dom";
import SidebarNMRA from "./SidebarNMRA";
import Topbar from "./Topbar";

export default function NmraLayout() {
  return (
    <div className="flex h-screen">
      <SidebarNMRA />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
