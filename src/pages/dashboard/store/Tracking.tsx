import React, { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Star,
  Clock,
  Package,
  ChevronDown,
  User,
  MessageCircle,
  HelpCircle,
  Menu,
} from "lucide-react";
import { BackButton } from "@/components/dashboard/BackButton";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { toast } from "sonner";
import { DEFAULT_LOCATIONS } from "@/data/locations";
import { useStore } from "@/context/store-context";
import { ordersService } from "@/services/orders.service";
import type { OrderDto } from "@/services/contracts";

const MapPicker = lazy(() => import("@/components/MapPicker"));

interface DeliveryDriver {
  name: string;
  photo?: string;
  vehicle: string;
  rating: number;
  phone: string;
}

const mockDriver: DeliveryDriver = {
  name: "Farid Bayramov",
  vehicle: "Mercedes",
  rating: 5.0,
  phone: "+254 712 345 678",
};

const mockTrackingStats = {
  trackingId: "#43434",
  totalTime: "2hr 15m",
  totalDistance: "25km",
  estimatedArrival: "15 min",
};

const TrackingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeStore } = useStore();
  const [showPanel, setShowPanel] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [storeOrders, setStoreOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!activeStore?.id) {
        if (!cancelled) setStoreOrders([]);
        return;
      }

      try {
        const orders = await ordersService.listByStore(activeStore.id);
        if (!cancelled) setStoreOrders(orders);
      } catch {
        // Tracking must remain empty rather than displaying fabricated delivery work.
        if (!cancelled) setStoreOrders([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeStore?.id]);

  // Get the selected live order, or show live work that is currently in production or ready.
  const order = id ? storeOrders.find((storeOrder) => storeOrder.id === id) : null;
  const activeOrders = storeOrders.filter(
    (storeOrder) => storeOrder.status === "IN_PRODUCTION" || storeOrder.status === "READY"
  );

  const handleLogout = () => {
    toast.success("Logged out successfully");
    setTimeout(() => navigate("/login"), 800);
  };

  const mapFallback = (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-printa-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-100">
      {/* Dashboard Sidebar - Desktop Only */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onLogout={handleLogout}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Full Screen Map Background */}
      <div className={`absolute inset-0 transition-all duration-300 ${isSidebarOpen ? "md:left-[220px]" : "md:left-[72px]"}`}>
        <Suspense fallback={mapFallback}>
          <MapPicker
            locations={DEFAULT_LOCATIONS}
            selectedLocationId={null}
            onLocationSelect={() => {}}
            className="h-full w-full"
            height="100%"
            zoom={14}
            showRoute={true}
          />
        </Suspense>
      </div>

      {/* Header Bar - Mobile */}
      <div className="absolute top-0 left-0 right-0 z-30 md:hidden">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-white/90 backdrop-blur shadow-md rounded-xl p-2.5 h-auto"
          >
            <Menu size={20} className="text-gray-700" />
          </Button>
        </div>
      </div>

      {/* ETA Badge on Map - Mobile */}
      <div className="md:hidden absolute left-4 top-1/3 z-20">
        <div className="text-printa-red text-2xl font-bold">
          11:26
        </div>
      </div>

      {/* Floating Panel - Desktop */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`hidden md:block absolute top-6 bottom-6 w-[380px] z-20 transition-all duration-300 ${isSidebarOpen ? "left-[236px]" : "left-[88px]"}`}
          >
            <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
              {/* Panel Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BackButton
                    size={18}
                    className="text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => navigate("/dashboard/orders")}
                  />
                  <span className="text-sm font-semibold text-gray-900">Active Orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search"
                    className="text-xs bg-gray-100 rounded-xl px-3 py-1.5 w-24 focus:outline-none focus:ring-1 focus:ring-printa-red"
                  />
                </div>
              </div>

              {/* Driver Info Card */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <User size={24} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{mockDriver.name}</p>
                      <p className="text-xs text-gray-500">1 June, 2025</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-printa-red hover:bg-printa-red/90 rounded-xl text-xs gap-1.5"
                    onClick={() => window.open(`tel:${mockDriver.phone}`)}
                  >
                    <Phone size={14} />
                    Call
                  </Button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase">Tracking ID</p>
                    <p className="text-sm font-semibold text-gray-900">{mockTrackingStats.trackingId}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase">Vehicle</p>
                    <p className="text-sm font-semibold text-gray-900">{mockDriver.vehicle}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase">Review</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center justify-center gap-1">
                      {mockDriver.rating.toFixed(1)}
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    </p>
                  </div>
                </div>

                {/* Trip Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase">Total Time</p>
                    <p className="text-sm font-bold text-gray-900">{mockTrackingStats.totalTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase">Total Distance</p>
                    <p className="text-sm font-bold text-gray-900">{mockTrackingStats.totalDistance}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase">ETA</p>
                    <p className="text-sm font-bold text-printa-red">{mockTrackingStats.estimatedArrival}</p>
                  </div>
                </div>
              </div>

              {/* Orders Timeline */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeOrders.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No active orders to track.</p>
                ) : activeOrders.slice(0, 2).map((orderItem) => (
                  <div key={orderItem.id} className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-900">Order ID: {orderItem.order_number}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          orderItem.status === "READY"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {orderItem.status === "READY" ? "Ready" : "In production"}
                      </span>
                    </div>

                    {/* Timeline Stops */}
                    <div className="space-y-3">
                      {[0, 1].map((stopIndex) => (
                        <div key={stopIndex} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                stopIndex === 0 ? "bg-printa-red" : "bg-gray-300"
                              }`}
                            />
                            {stopIndex < 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-gray-500">
                                  {stopIndex === 0 ? "02.03.2025" : "12.03.2025"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {stopIndex === 0 ? "06:00" : "12:00"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  Location {stopIndex + 1}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Street {stopIndex === 0 ? "12" : "23"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver Marker on Map */}
      <div className={`absolute top-1/2 z-10 transform -translate-y-1/2 transition-all duration-300 ${isSidebarOpen ? "md:right-1/4 right-1/3" : "md:right-1/3 right-1/3"}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="bg-white rounded-xl shadow-md px-2 py-1 text-[10px] font-medium whitespace-nowrap flex items-center gap-1">
              <span>Farid Bayr...</span>
              <Button
                size="sm"
                className="h-5 px-1.5 bg-printa-red hover:bg-printa-red/90 text-[10px]"
                onClick={() => window.open(`tel:${mockDriver.phone}`)}
              >
                <Phone size={10} />
                Call
              </Button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-0.5">1 June, 2025</p>
          </div>
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-printa-red/20 animate-ping" />
        </motion.div>
      </div>

      {/* Floating Toggle Button - Mobile */}
      <motion.button
        initial={false}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowPanel(!showPanel)}
        className="md:hidden fixed right-4 z-40 w-14 h-14 rounded-full bg-printa-red shadow-lg flex items-center justify-center transition-all duration-300"
        style={{
          bottom: showPanel ? "calc(60vh + 16px)" : "24px"
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: showPanel ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={24} className="text-white" />
        </motion.div>
      </motion.button>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="md:hidden absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl"
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-gray-300" />
            </div>

            {/* Distance & ETA - Main Info */}
            <div className="px-6 pb-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {mockTrackingStats.totalDistance} <span className="text-gray-400 font-normal">•</span> {mockTrackingStats.estimatedArrival}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {activeStore?.address || "Store location unavailable"}
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="px-4 pb-4 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => window.open(`tel:${mockDriver.phone}`)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle size={20} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">Guest</span>
                  <span className="text-[10px] text-gray-500">Chat</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Clock size={20} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">Delivery time</span>
                  <span className="text-[10px] text-gray-500">11:30</span>
                </button>
                <button
                  onClick={() => navigate("/dashboard/support")}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <HelpCircle size={20} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">Help?</span>
                  <span className="text-[10px] text-printa-red">Tell us</span>
                </button>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  I'll be late 5min
                </button>
                <button className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  I'm here
                </button>
                <button className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Call me
                </button>
              </div>
            </div>

            {/* Order Details Section */}
            <div className="px-4 py-4 max-h-[30vh] overflow-y-auto">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Order Details
              </p>
              {activeOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No active orders to track.</p>
              ) : activeOrders.slice(0, 2).map((orderItem) => (
                <button
                  key={orderItem.id}
                  onClick={() => navigate(`/dashboard/order/${orderItem.id}`)}
                  className="w-full flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="p-2 bg-printa-red/10 rounded-xl">
                    <Package size={18} className="text-printa-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      Order {orderItem.order_number}
                    </p>
                    <p className="text-xs text-gray-500">{activeStore?.name ?? "Active store"}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      orderItem.status === "READY"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {orderItem.status === "READY" ? "Ready" : "In production"}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom Safe Area Padding */}
            <div className="h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackingPage;
