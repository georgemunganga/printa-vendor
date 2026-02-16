import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  DollarSign,
  Package,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "order" | "payment" | "team" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const NOTIFICATION_ICONS = {
  order: Package,
  payment: DollarSign,
  team: Users,
  system: Settings,
};

const NOTIFICATION_COLORS = {
  order: "bg-printa-red/10 text-printa-red",
  payment: "bg-printa-red/10 text-printa-red",
  team: "bg-printa-red/10 text-printa-red",
  system: "bg-printa-red/10 text-printa-red",
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "order",
    title: "New order received",
    message: "Order #1234 from John Doe - 50 pages color print",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    read: false,
    actionUrl: "/dashboard/orders",
  },
  {
    id: "notif-2",
    type: "payment",
    title: "Payment received",
    message: "K150 payment received for Order #1233",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
  },
  {
    id: "notif-3",
    type: "team",
    title: "New team member added",
    message: "Sarah Johnson joined as Manager",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    actionUrl: "/dashboard/team",
  },
  {
    id: "notif-4",
    type: "order",
    title: "Order completed",
    message: "Order #1232 has been marked as delivered",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
  },
  {
    id: "notif-5",
    type: "system",
    title: "Subscription renewal",
    message: "Your Pro plan will renew on Mar 15, 2026",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    actionUrl: "/dashboard/subscription",
  },
  {
    id: "notif-6",
    type: "payment",
    title: "Low balance alert",
    message: "Your account balance is below K50",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
  },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Marked as read");
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="dashboard-page-title">Notifications</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-100">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              filter === "all"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition relative ${
              filter === "unread"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-printa-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-sm text-gray-500">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type];
              const colorClass = NOTIFICATION_COLORS[notification.type];

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition ${
                    notification.read
                      ? "bg-white border-gray-100"
                      : "bg-printa-red/10/30 border-blue-100"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 ${colorClass}`}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`text-sm font-semibold ${
                          notification.read ? "text-gray-700" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                        <Clock size={12} />
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs font-medium text-printa-red hover:text-blue-700 flex items-center gap-1"
                        >
                          <Check size={12} />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-xs font-medium text-gray-400 hover:text-red-600 flex items-center gap-1 transition"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-printa-red rounded-full flex-shrink-0 mt-2" />
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
