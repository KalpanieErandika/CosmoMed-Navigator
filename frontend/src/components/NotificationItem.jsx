import React from 'react';
import {CheckCircleIcon, ExclamationIcon, XCircleIcon,ShoppingBagIcon, UserIcon, InformationCircleIcon, } from '@heroicons/react/solid';
import { CheckIcon } from '@heroicons/react/outline';

const NotificationItem = ({ notification, onMarkAsRead, onClick, showMarkAsRead = true }) => {
  const formatDate = (dateString) => {
    // Add null/undefined check
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Just now';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Just now';
    }
  };

  const getTypeConfig = () => {
    //if notification is read and no specific type use default styling
    if (notification.is_read && !notification.type) {
      return {
        icon: InformationCircleIcon,
        iconColor: 'text-gray-300',
        bgColor: 'bg-white',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-600',
      };
    }

    switch (notification.type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          iconColor: 'text-green-400',
          bgColor: notification.is_read ? 'bg-white' : 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-800',
        };
      case 'warning':
        return {
          icon: ExclamationIcon,
          iconColor: 'text-yellow-400',
          bgColor: notification.is_read ? 'bg-white' : 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-800',
        };
      case 'error':
        return {
          icon: XCircleIcon,
          iconColor: 'text-red-400',
          bgColor: notification.is_read ? 'bg-white' : 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800',
        };
      case 'order':
        return {
          icon: ShoppingBagIcon,
          iconColor: 'text-blue-400',
          bgColor: notification.is_read ? 'bg-white' : 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-800',
        };
      case 'pharmacist':
        return {
          icon: UserIcon,
          iconColor: 'text-purple-400',
          bgColor: notification.is_read ? 'bg-white' : 'bg-purple-50',
          borderColor: 'border-purple-500',
          textColor: 'text-purple-800',
        };
      default:
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-gray-400',
          bgColor: notification.is_read ? 'bg-white' : 'bg-gray-50',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-800',
        };
    }
  };

  const handleContainerClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const typeConfig = getTypeConfig();
  const Icon = typeConfig.icon;

  return (
    <div className={`block hover:bg-gray-50 transition-colors cursor-pointer ${
        notification.is_read ? 'opacity-75' : '' }`} onClick={handleContainerClick}>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${typeConfig.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className={`text-sm font-medium ${typeConfig.textColor} truncate`}>
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
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>{formatDate(notification.created_at)}</span>
                {notification.related_type && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {notification.related_type}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {showMarkAsRead && !notification.is_read && onMarkAsRead && (
            <button onClick={handleMarkAsRead} className="ml-4 flex-shrink-0 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <CheckIcon className="h-4 w-4 mr-1" />
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;