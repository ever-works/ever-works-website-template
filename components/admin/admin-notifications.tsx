"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  createdAt: string;
}

interface AdminNotificationsProps {
  className?: string;
}

export function AdminNotifications({ className }: AdminNotificationsProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications/mark-all-read", {
        method: "PATCH",
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "item_submission":
        return "📝";
      case "comment_reported":
        return "⚠️";
      case "user_registered":
        return "👤";
      case "payment_failed":
        return "💳";
      case "system_alert":
        return "🔔";
      default:
        return "📢";
    }
  };

  // Get notification link
  const getNotificationLink = (notification: Notification) => {
    if (!notification.data) return null;
    
    try {
      const data = JSON.parse(notification.data);
      switch (notification.type) {
        case "item_submission":
          return `/admin/items/${data.itemId}`;
        case "comment_reported":
          return `/admin/comments/${data.commentId}`;
        case "user_registered":
          return `/admin/users/${data.userId}`;
        default:
          return null;
      }
    } catch {
      return null;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    const link = getNotificationLink(notification);
    if (link) {
      window.open(link, "_blank");
    }
    
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 z-50">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          !notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`font-medium text-sm ${
                                !notification.isRead ? "text-blue-900 dark:text-blue-100" : ""
                              }`}>
                                {notification.title}
                              </h4>
                              
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 -mt-1 -mr-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: enUS,
                                })}
                              </span>
                              
                              {getNotificationLink(notification) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(getNotificationLink(notification)!, "_blank");
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
