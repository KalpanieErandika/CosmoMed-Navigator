import React, { useState, useRef, useEffect } from "react";
import { IoLogOutOutline, IoChevronDown } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

export default function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const storedUser = localStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.pharmacist_name ||
      user.email
    : "User";

  const userRole = user?.user_type ? 
    user.user_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
    : "User";

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center justify-between style={{ backgroundColor: '#f4be0bff' }} shadow-md border-b border-gray-200 px-5 py-1 w-full">
      <div className="flex items-center gap-3">
      
        <div>
         <h2 className="text-gray-700! font-bold text-lg">NMRA Dashboard</h2>

        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 hover:bg-gray-50 px-4  rounded-lg transition-all duration-200 border border-gray-200" >
          <FaUserCircle size={32} className="text-green-600" />
          <div className="text-left hidden md:block">
            <p className="text-gray-800 font-medium text-sm">{displayName}</p>
            <p className="text-gray-500 text-xs">{userRole}</p>
          </div>
          <IoChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}/>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-12 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-800">{displayName}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200">
              <IoLogOutOutline size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}