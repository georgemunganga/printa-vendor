import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  BadgeCheck,
  Calendar,
  Printer,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { useJobContext } from "@/context/job-context";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { availableStores, activeStore } = useStore();
  const { jobs } = useJobContext();

  // Calculate vendor stats
  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === "delivered").length,
    [jobs]
  );

  const totalRevenue = useMemo(
    () =>
      jobs
        .filter((job) => job.status === "delivered")
        .reduce((sum, job) => sum + job.totalPrice, 0),
    [jobs]
  );

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status === "printing" || job.status === "ready").length,
    [jobs]
  );

  const averageRating = 4.7; // This would come from backend
  const totalReviews = 127; // This would come from backend
  const verificationStatus = "verified"; // verified, pending, unverified

  const quickActions = [
    {
      title: "Manage Stores",
      subtitle: `${availableStores.length} location${availableStores.length !== 1 ? "s" : ""}`,
      icon: Store,
      href: "/dashboard/stores",
      color: "bg-printa-red/10 text-printa-red",
    },
    {
      title: "Business Settings",
      subtitle: "Hours, pricing & more",
      icon: Settings,
      href: "/dashboard/settings",
      color: "bg-printa-red/10 text-printa-red",
    },
    {
      title: "Team Management",
      subtitle: "Staff & permissions",
      icon: Users,
      href: "/dashboard/team",
      color: "bg-printa-red/10 text-printa-red",
    },
    {
      title: "Help & Support",
      subtitle: "Get assistance",
      icon: HelpCircle,
      href: "/dashboard/support",
      color: "bg-printa-red/10 text-printa-red",
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };

  const formattedRevenue = new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    minimumFractionDigits: 0,
  }).format(totalRevenue);

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-5">
        {/* Vendor Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-printa-red to-red-700 rounded-2xl p-4 md:p-6 text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-5">
              {/* Business Info */}
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                    <span className="text-2xl md:text-3xl font-bold">
                      {user?.name?.charAt(0) ?? "V"}
                    </span>
                  </div>
                  {verificationStatus === "verified" && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <BadgeCheck className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {user?.name ?? "Vendor Business"}
                    </h1>
                  </div>
                  <p className="text-red-100 text-sm md:text-base mb-2">
                    {user?.email ?? "business@example.com"}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      <span className="font-semibold">{averageRating}</span>
                      <span className="text-red-100 text-sm">({totalReviews})</span>
                    </div>

                    {activeStore && (
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{activeStore.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => navigate("/dashboard/profile/edit")}
                className="absolute right-0 lg:relative self-start bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-3 py-2 rounded-lg font-semibold text-xs md:text-sm transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden md:inline">Edit Profile</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 mt-5">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Package className="w-4 h-4 text-white/80" />
                  <span className="text-[10px] md:text-[11px] text-white/80 uppercase tracking-wide font-semibold">
                    Completed
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-bold leading-none">{completedJobs}</p>
                <p className="text-[11px] text-white/60 mt-1">Total jobs</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-white/80" />
                  <span className="text-[10px] md:text-[11px] text-white/80 uppercase tracking-wide font-semibold">
                    Revenue
                  </span>
                </div>
                <p className="text-lg md:text-xl font-bold leading-none">{formattedRevenue}</p>
                <p className="text-[11px] text-white/60 mt-1">All time</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Printer className="w-4 h-4 text-white/80" />
                  <span className="text-[10px] md:text-[11px] text-white/80 uppercase tracking-wide font-semibold">
                    Active
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-bold leading-none">{activeJobs}</p>
                <p className="text-[11px] text-white/60 mt-1">In progress</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Store className="w-4 h-4 text-white/80" />
                  <span className="text-[10px] md:text-[11px] text-white/80 uppercase tracking-wide font-semibold">
                    Locations
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-bold leading-none">{availableStores.length}</p>
                <p className="text-[11px] text-white/60 mt-1">
                  {availableStores.length === 1 ? "Store" : "Stores"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="group bg-white rounded-xl border border-gray-100 p-4 md:p-5 hover:border-printa-red/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg ${action.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">{action.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-printa-red transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Business Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6"
        >
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-5">
            Business Information
          </h2>

          <div className="space-y-4 md:space-y-5">
            {/* Verification Status */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-printa-red/10 flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="w-4 h-4 text-printa-red" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900">Verification Status</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-500">
                  Your business has been verified by Printa
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-printa-red/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-printa-red" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1">Member Since</h3>
                <p className="text-xs md:text-sm text-gray-500">
                  Joined January 2024 • Active for 2 months
                </p>
              </div>
            </div>

            {/* Business Type */}
           
           
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <Link
            to="/dashboard/notifications"
            className="flex items-center justify-between px-4 md:px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-printa-red/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-printa-red" />
              </div>
              <div>
                <p className="font-semibold text-sm md:text-base text-gray-900">Notifications</p>
                <p className="text-xs md:text-sm text-gray-500">Manage your alerts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>

          <Link
            to="/dashboard/subscription"
            className="flex items-center justify-between px-4 md:px-5 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-printa-red/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-printa-red" />
              </div>
              <div>
                <p className="font-semibold text-sm md:text-base text-gray-900">Subscription & Billing</p>
                <p className="text-xs md:text-sm text-gray-500">View plans and invoices</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          <p className="text-xs text-gray-400">Printa Vendor v1.0.0</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
