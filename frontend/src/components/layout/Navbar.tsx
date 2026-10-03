import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FaBell,
  FaCheck,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationApi";

import type { Notification } from "../../services/notificationApi";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/revenue": "Revenue",
  "/users": "Users",
  "/reports": "Reports",
  "/notifications/create": "Create Notification",
};

function Navbar() {
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] ?? "Dashboard";

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);

  const [loading, setLoading] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await getNotifications();

      if (response.success) {
        setNotifications(response.data.notifications);

        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(notification._id);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    if (type === "success") {
      return <FaCheckCircle className="text-green-500" size={16} />;
    }

    if (type === "warning") {
      return <FaExclamationTriangle className="text-yellow-500" size={16} />;
    }

    if (type === "error") {
      return <FaTimesCircle className="text-red-500" size={16} />;
    }

    return <FaInfoCircle className="text-blue-500" size={16} />;
  };

  const formatNotificationTime = (date: string) => {
    const notificationDate = new Date(date);

    return notificationDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Page Title */}
      <h2 className="text-lg font-semibold text-slate-900">{pageTitle}</h2>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => {
              const nextState = !showNotifications;

              setShowNotifications(nextState);

              if (nextState) {
                fetchNotifications();
              }
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <FaBell size={18} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "All caught up"}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <FaCheck size={11} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <FaBell className="mx-auto text-slate-300" size={24} />

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      You're all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        !notification.isRead ? "bg-blue-50/50" : "bg-white"
                      }`}
                    >
                      <div className="mt-1 shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              notification.isRead
                                ? "font-medium text-slate-700"
                                : "font-semibold text-slate-900"
                            }`}
                          >
                            {notification.title}
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[11px] text-slate-400">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            A
          </div>

          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            Ankita
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
