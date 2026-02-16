import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationsDropdown = ({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  onClose,
  onRefresh,
}) => {
  
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button onClick={onMarkAllAsRead} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-500" title="Close">
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div>
            {notifications.slice(0, 10).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onMarkAsRead={onMarkAsRead} onClick={onNotificationClick} showMarkAsRead={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;