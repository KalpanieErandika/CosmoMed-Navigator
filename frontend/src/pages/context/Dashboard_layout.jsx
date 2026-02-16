import React from "react";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopbarNMRA from "./TopbarNMRA";

function Dashboard_layout() {
  return (
      <div className="flex h-screen">
        <Sidebar />
  
        <div className="flex-1 flex flex-col">
          <TopbarNMRA />
          <div className="p-6 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    );
}

export default Dashboard_layout;
