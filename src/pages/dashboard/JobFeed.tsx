import React, { useEffect, useRef, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Package,
  Search,
  Store,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { useJobContext } from "@/context/job-context";
import { useStore } from "@/context/store-context";
import { PrintJob } from "@/types";
import { Button } from "@/components/ui/button";
import { productionService, type ProductionJobDto } from "@/services/production.service";

/* ─── Channel filter ─── */
type ChannelFilter = "all" | "online" | "walk-in";
type StatusFilter = "all" | "pending" | "printing" | "ready" | "delivered" | "cancelled";

const statusConfig: Record<string, { label: string; icon: React.ElementType; dot: string; badge: string }> = {
  pending: { label: "Processing", icon: Clock, dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700" },
  printing: { label: "Printing", icon: FileText, dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700" },
  ready: { label: "Ready", icon: CheckCircle, dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700" },
  delivered: { label: "Delivered", icon: Truck, dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", icon: XCircle, dot: "bg-rose-400", badge: "bg-rose-50 text-rose-600" },
};

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Processing" },
  { key: "printing", label: "Printing" },
  { key: "ready", label: "Ready" },
  { key: "delivered", label: "Delivered" },
];

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const toPrintJob = (job: ProductionJobDto): PrintJob => ({
  id: job.id,
  fileName: `Production job ${job.order_id.slice(0, 8)}`,
  status: job.status === "QUEUED" ? "pending" : job.status === "COMPLETED" ? "delivered" : job.status === "CANCELLED" ? "cancelled" : "printing",
  totalPrice: 0,
  pageCount: 1,
  copies: 1,
  colorMode: "color",
  printer: { name: "Production queue" },
  createdAt: new Date(job.created_at),
  lastUpdated: new Date(job.updated_at),
  productionStartedAt: job.started_at ? new Date(job.started_at) : undefined,
  readyAt: job.completed_at ? new Date(job.completed_at) : undefined,
  notes: job.notes,
  orderChannel: "online",
});

/* ─── Order Card ─── */
const OrderGridCard: React.FC<{ order: PrintJob }> = ({ order }) => {
  const config = statusConfig[order.status] ?? statusConfig.pending;
  const isOnline = order.orderChannel === "online" || !order.orderChannel;

  return (
    <Link
      to={`/dashboard/job/${order.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      {/* Top row: channel badge + status */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          isOnline ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
        }`}>
          {isOnline ? <Globe size={10} /> : <Store size={10} />}
          {isOnline ? "Online" : "Walk-in"}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </div>

      {/* File name */}
      <h3 className="text-sm font-semibold text-gray-900 truncate">{order.fileName}</h3>

      {/* Details */}
      <p className="text-xs text-gray-400 mt-1">
        {order.pageCount} pg · {order.copies} {order.copies === 1 ? "copy" : "copies"} · {order.colorMode === "color" ? "Color" : "B&W"}
      </p>

      {/* Customer */}
      {order.customerName && (
        <p className="text-xs text-gray-500 mt-2 truncate">
          {order.customerName}
        </p>
      )}

      {/* Bottom row: price + date + chevron */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="text-sm font-bold text-gray-900">${order.totalPrice.toFixed(2)}</span>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>{formatDate(order.createdAt)}</span>
          <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 transition" />
        </div>
      </div>
    </Link>
  );
};

/* ─── Main Page ─── */
const OrderHistoryPage: React.FC = () => {
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { jobs: fallbackJobs } = useJobContext();
  const { activeStore } = useStore();
  const [jobs, setJobs] = useState<PrintJob[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!activeStore?.id) {
        if (!cancelled) setJobs([]);
        return;
      }
      try {
        const productionJobs = await productionService.listStoreJobs(activeStore.id);
        if (!cancelled) setJobs(productionJobs.map(toPrintJob));
      } catch {
        if (!cancelled) setJobs(fallbackJobs);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeStore?.id, fallbackJobs]);

  const filtered = useMemo(() => {
    let list = jobs;
    if (channelFilter !== "all") {
      list = list.filter((o) => (o.orderChannel ?? "online") === channelFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.fileName.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
      );
    }
    return list;
  }, [jobs, channelFilter, statusFilter, searchQuery]);

  const getStatusCount = (key: StatusFilter) => {
    let list = jobs;
    if (channelFilter !== "all") {
      list = list.filter((o) => (o.orderChannel ?? "online") === channelFilter);
    }
    if (key === "all") return list.length;
    return list.filter((o) => o.status === key).length;
  };

  const onlineCount = jobs.filter((o) => (o.orderChannel ?? "online") === "online").length;
  const walkInCount = jobs.filter((o) => o.orderChannel === "walk-in").length;

  return (
    <DashboardLayout>
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className={searchOpen ? "hidden md:block" : ""}>
            <h1 className="dashboard-page-title">Order History</h1>
            <p className="dashboard-page-subtitle">
              {activeStore?.name ?? "Store"} · {jobs.length} total orders
            </p>
          </div>

          {/* Search: icon on mobile, expands full-width; always visible on desktop */}
          {searchOpen ? (
            <div className="flex-1 relative md:hidden">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                autoFocus
                className="pl-9 pr-9 py-4"
              />
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              className="md:hidden bg-printa-black flex items-center justify-center transition shrink-0"
            >
              <Search size={18} />
            </Button>
          )}
          {/* Desktop: always visible */}
          <div className="hidden md:block relative w-64 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="pl-9 pr-9 py-4"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Channel pill switch ── */}
      <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-4">
        {([
          { key: "all" as ChannelFilter, label: "All", count: jobs.length },
          { key: "online" as ChannelFilter, label: "Online", count: onlineCount, icon: Globe },
          { key: "walk-in" as ChannelFilter, label: "Walk-in", count: walkInCount, icon: Store },
        ]).map((ch) => {
          const isActive = channelFilter === ch.key;
          const Icon = ch.icon;
          return (
            <button
              key={ch.key}
              type="button"
              onClick={() => setChannelFilter(ch.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {Icon && <Icon size={12} />}
              {ch.label}
              <span className={`text-[10px] ${isActive ? "text-gray-400" : "text-gray-400"}`}>
                {ch.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Status filter pills ── */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {statusFilters.map((f) => {
          const count = getStatusCount(f.key);
          const isActive = statusFilter === f.key;
          const config = f.key !== "all" ? statusConfig[f.key] : null;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {config && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/60" : config.dot}`} />
              )}
              {f.label}
              <span className={`text-[10px] ${isActive ? "text-white/50" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Order grid ── */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={`${channelFilter}-${statusFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
          >
            {filtered.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <OrderGridCard order={order} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-white border border-gray-100 p-12 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
              <Package size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-900">No orders found</p>
            <p className="mt-1 text-xs text-gray-400">
              {channelFilter !== "all"
                ? `No ${channelFilter === "online" ? "online" : "walk-in"} orders`
                : statusFilter !== "all"
                ? `No ${statusFilters.find((f) => f.key === statusFilter)?.label.toLowerCase()} orders`
                : "No orders yet"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default OrderHistoryPage;
