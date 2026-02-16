import React, { useState, useRef, useEffect } from "react";
import { IoLogOutOutline, IoChevronDown, IoNotificationsOutline, IoCheckmarkDone } from "react-icons/io5";
import { FaUserCircle, FaBoxOpen } from "react-icons/fa";
import { BsBell } from "react-icons/bs";
import axios from "axios";

export default function TopbarNMRA() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsButtonRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  
  const storedUser = localStorage.getItem("userInfo");  //user and token retrieval
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log('Click outside handler fired');
      
      //check if click is outside user dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('Click outside user dropdown');
        setIsDropdownOpen(false);
      }
      
      //check if click is outside notifications dropdown and not on the notifications button
      if (isNotificationsOpen && 
          notificationsDropdownRef.current && 
          !notificationsDropdownRef.current.contains(event.target) &&
          notificationsButtonRef.current && 
          !notificationsButtonRef.current.contains(event.target)) {
        console.log('Click outside notifications dropdown and button');
        setIsNotificationsOpen(false);
      }
    };  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationsOpen]);

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      //auto refresh notifications 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await axios.get("http://127.0.0.1:8000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("API Response:", response.data);
      console.log("Response structure:", {
        status: response.data.status,
        data: response.data.data,
        unread_count: response.data.unread_count,
        count: response.data.data?.length
      });

      if (response.data.status) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/notifications/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order':
        return <FaBoxOpen className="text-green-500 text-lg" />;
      default:
        return <BsBell className="text-gray-500 text-lg" />;
    }
  };

  const getNotificationStyle = (notification) => {
    if (!notification.is_read) {
      return "bg-blue-50 border-l-4 border-blue-500";
    }
    return "border-l-4 border-transparent";
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000); //converts milliseconds into minutes math.floor-removes decimals
    const diffHours = Math.floor(diffMs / 3600000); //hours
    const diffDays = Math.floor(diffMs / 86400000); //day

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = (notification) => {
    // mark as read when clicked
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    //handle navigation based on notification type
    if (notification.type === 'order') {
      // Redirect to order-requests page for pharmacist
      window.location.href = `/pharmacist/order-requests`;
    }  
    setIsNotificationsOpen(false);
  };

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

  const handleNotificationsButtonClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    console.log('Notifications button clicked');
    if (!isNotificationsOpen) {
      fetchNotifications();
    }
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false); // Close user dropdown if open
  };

  return (
    <div className="flex items-center justify-between bg-white shadow-sm border-b border-gray-100 px-6 py-3 w-full">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-gray-800 font-semibold text-base">
            Pharmacist Dashboard
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Button and Dropdown */}
        <div className="relative">
          <button ref={notificationsButtonRef} onClick={handleNotificationsButtonClick} className="relative p-2 hover:bg-gray-50 rounded-full transition-colors duration-150" title="Notifications">
            <div className="relative">
              <IoNotificationsOutline size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div ref={notificationsDropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
style={{ maxHeight: '400px', minWidth: '320px'}}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded transition-colors">
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setIsNotificationsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <BsBell className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No notifications</p>
                    <p className="text-gray-400 text-sm mt-1">We'll notify you when something arrives</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 10).map((notification) => (
                      <div key={notification.id} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationStyle(notification)}`}
onClick={() => handleNotificationClick(notification)}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {notification.title || 'Notification'}
                              </p>
                              {!notification.is_read && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {notification.message || 'No message provided'}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <span>{formatTime(notification.created_at)}</span>
                              {notification.related_type && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {notification.related_type}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {!notification.is_read && (
                            <button onClick={(e) => {e.stopPropagation(); markAsRead(notification.id);}} className="ml-2 p-1 hover:bg-gray-200 rounded" title="Mark as read">
                              <IoCheckmarkDone className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <a href="/notifications"className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={() => setIsNotificationsOpen(false)}>
                    View all notifications
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={(e) => {
              e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); setIsNotificationsOpen(false); // Close notifications if open
}} className="flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all duration-150 border border-gray-200">
            <FaUserCircle size={24} className="text-green-500" />
            <div className="text-left hidden md:block">
              <p className="text-gray-700 font-medium text-xs leading-tight">{displayName}</p>
              <p className="text-gray-400 text-[10px] leading-tight">{userRole}</p>
            </div>
            <IoChevronDown size={14} className={`text-gray-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}/>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-10 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1.5 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-medium text-gray-800 text-xs">{displayName}</p>
                <p className="text-gray-500 text-[10px] truncate">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <a href="/pharmacist-home/pharmacist-account" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors duration-150 text-xs">
                  <FaUserCircle size={12} className="text-gray-400" />
                  <span className="font-medium">My Profile</span>
                </a>
              </div>
              
              <div className="border-t border-gray-100 pt-1">
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-red-50 transition-colors duration-150 text-xs">
                  <IoLogOutOutline size={12} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}