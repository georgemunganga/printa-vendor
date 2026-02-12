import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronRight, CreditCard, HelpCircle, LogOut, MapPin, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/auth-context";
import { mockOrders } from "@/data/mockOrders";
import { motion } from "framer-motion";

const menuItems = [
  {
    title: "Personal Information",
    subtitle: "Update your account details",
    icon: User,
    href: "/dashboard/profile/edit",
    color: "bg-printa-red/10",
  },
  {
    title: "My Locations",
    subtitle: "Pickup & delivery addresses",
    icon: MapPin,
    href: "/dashboard/locations",
    color: "bg-printa-red/10",
  },
  {
    title: "Payment Methods",
    subtitle: "Cards, wallets & more",
    icon: CreditCard,
    href: "/dashboard/payment-methods",
    color: "bg-printa-red/10",
  },
  {
    title: "Help & Support",
    subtitle: "Get help with orders",
    icon: HelpCircle,
    href: "/dashboard/support",
    color: "bg-printa-red/10",
  },
  {
    title: "Settings",
    subtitle: "Notifications & preferences",
    icon: Settings,
    href: "/dashboard/settings",
    color: "bg-printa-red/10",
  },
];

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const totalSpent = useMemo(
    () => mockOrders.reduce((sum, order) => sum + order.totalPrice, 0),
    []
  );

  const stats = [
    { label: "Orders", value: mockOrders.length.toString() },
    { label: "Spent", value: `$${totalSpent.toFixed(0)}` },
    { label: "Rating", value: "4.9" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:max-w-3xl md:mx-auto">
        {/* Profile Header - Banking app style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-printa-red to-red-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                {user?.name?.charAt(0) ?? "G"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-printa-red rounded-full border-2 border-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                {user?.name ?? "Guest User"}
              </h1>
              <p className="text-sm text-gray-500 truncate">
                {user?.email ?? user?.phone ?? "Manage your profile"}
              </p>
              <button
                onClick={() => navigate("/dashboard/profile/edit")}
                className="mt-2 text-xs font-semibold text-printa-red hover:underline"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-around mt-5 pt-5 border-t border-gray-100">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center flex-1">
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Menu Items - Cleaner mobile style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 md:py-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className={`p-2.5 rounded-xl ${item.color} text-printa-red`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.subtitle}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </Link>
            );
          })}
        </motion.div>

        {/* Sign Out & Version */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3 py-4"
        >
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
          <p className="text-xs text-gray-400">Printa v1.0.0</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
