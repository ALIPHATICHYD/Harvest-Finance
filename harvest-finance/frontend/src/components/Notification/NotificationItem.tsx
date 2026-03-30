'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins,
  X
} from 'lucide-react';
import { Notification, NotificationType } from '@/types/notification';
import { cn } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.DEPOSIT:
      return <ArrowUpRight className="w-5 h-5 text-green-500" />;
    case NotificationType.WITHDRAWAL:
      return <ArrowDownLeft className="w-5 h-5 text-orange-500" />;
    case NotificationType.REWARD:
      return <Coins className="w-5 h-5 text-yellow-500" />;
    case NotificationType.VAULT_CREATED:
      return <CheckCircle className="w-5 h-5 text-harvest-green-600" />;
    case NotificationType.LARGE_TRANSACTION:
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case NotificationType.ERROR:
      return <X className="w-5 h-5 text-red-600" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onRead 
}) => {
  const icon = getNotificationIcon(notification.type);
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "p-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors relative",
        notification.isRead ? "bg-white" : "bg-harvest-green-50/30 border-l-4 border-l-harvest-green-500"
      )}
      onClick={() => !notification.isRead && onRead(notification.id)}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className={cn(
              "text-sm font-semibold truncate",
              notification.isRead ? "text-gray-900" : "text-harvest-green-900"
            )}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-harvest-green-500 rounded-full mt-2" />
        )}
      </div>
    </motion.div>
  );
};
