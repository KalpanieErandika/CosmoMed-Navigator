import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BellIcon } from '@heroicons/react/outline';
import NotificationItem from './NotificationItem';
import NotificationsDropdown from './NotificationsDropdown';

const Notifications = ({ showDropdown = true }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Notifications API Response:', response.data);
      
      if (response.data.status === true) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:8000/api/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/notifications/mark-all-read', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const now = new Date().toISOString();
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          is_read: true,
          read_at: now,
        }))
      );
      setUnreadCount(0);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.related_id && notification.related_type) {
      switch (notification.related_type) {
        case 'order':
          window.location.href = `/orders/${notification.related_id}`;
          break;
        case 'prescription':
          window.location.href = `/prescriptions/${notification.related_id}`;
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // For navbar bell icon
  if (showDropdown) {
    return (
      <div className="relative">
        <button
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => {
            if (!dropdownOpen) {
              fetchNotifications();
            }
            setDropdownOpen(!dropdownOpen);
          }}
        >
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40"  onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 mt-2 z-50">

              <NotificationsDropdown notifications={notifications} unreadCount={unreadCount} onMarkAsRead={markAsRead}
onMarkAllAsRead={markAllAsRead} onNotificationClick={handleNotificationClick} onClose={() => setDropdownOpen(false)} onRefresh={fetchNotifications} />
            </div>
          </>
        )}
      </div>
    );
  }
};

export default Notifications;