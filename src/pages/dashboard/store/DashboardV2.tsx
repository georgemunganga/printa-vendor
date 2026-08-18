import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, Layers, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { PrintJob, PrintJobStatus } from "@/types";
import type { OrderDto, OrderStatusDto } from "@/services/contracts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiveFeedTopBar } from "@/components/dashboard/live-feed/LiveFeedTopBar";
import {
  LiveFeedFilterBar,
  StatusFilter,
} from "@/components/dashboard/live-feed/LiveFeedFilterBar";
import { IncomingJobCard } from "@/components/dashboard/live-feed/IncomingJobCard";
import { ActiveJobCard } from "@/components/dashboard/live-feed/ActiveJobCard";
import { useStore } from "@/context/store-context";
import { ordersService } from "@/services/orders.service";

const addHistory = (job: PrintJob, status: PrintJobStatus) => {
  const history = job.statusHistory ? [...job.statusHistory] : [];
  return [...history, { status, timestamp: new Date() }];
};

const toPrintJobStatus = (status: OrderStatusDto): PrintJobStatus => {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
    case "IN_PRODUCTION":
      return "printing";
    case "READY":
      return "ready";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
  }
};

const mapOrderToPrintJob = (order: OrderDto): PrintJob => {
  const items = order.items ?? [];
  const copies = items.reduce((total, item) => total + item.quantity, 0) || 1;
  return {
    id: order.id,
    fileName: order.order_number,
    status: toPrintJobStatus(order.status),
    totalPrice: order.total,
    pageCount: copies,
    copies,
    colorMode: "color",
    printer: { name: "Production queue" },
    createdAt: new Date(order.created_at),
    lastUpdated: new Date(order.updated_at),
    customerName: order.customer_id ? `Customer ${order.customer_id.slice(0, 8)}` : "Walk-in customer",
    deliveryType: order.delivery_address ? "rider" : "pickup",
    orderChannel: order.channel === "POS" ? "walk-in" : "online",
    notes: order.notes,
    statusHistory: [{ status: toPrintJobStatus(order.status), timestamp: new Date(order.updated_at) }],
  };
};


const DashboardV2: React.FC = () => {
  const { activeStore } = useStore();

  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!activeStore?.id) {
        if (!cancelled) {
          setJobs([]);
        }
        return;
      }

      try {
        const orders = await ordersService.listByStore(activeStore.id);
        if (!cancelled) {
          setJobs(orders.map(mapOrderToPrintJob));
        }
      } catch {
        if (!cancelled) {
          // Operational queues must not fabricate orders when the live API is unavailable.
          setJobs([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeStore?.id]);


  // ── Job actions ──
  const updateJob = useCallback(
    (id: string, updater: (job: PrintJob) => PrintJob) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...updater(j), lastUpdated: new Date() } : j
        )
      );
    },
    []
  );

  const handleAccept = useCallback(
    async (id: string) => {
      try {
        await ordersService.updateStatus(id, "CONFIRMED");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to accept this job.");
        return;
      }
      updateJob(id, (job) => {
        if (job.status !== "pending") return job;
        return {
          ...job,
          status: "printing" as PrintJobStatus,
          acceptedAt: new Date(),
          statusHistory: addHistory(job, "printing"),
        };
      });
      toast.success("Job accepted — moved to active queue");
    },
    [updateJob]
  );

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await ordersService.cancel(id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to reject this job.");
        return;
      }
      updateJob(id, (job) => ({
        ...job,
        status: "cancelled" as PrintJobStatus,
        statusHistory: addHistory(job, "cancelled"),
      }));
      toast("Job rejected", { description: `Order ${id} declined` });
    },
    [updateJob]
  );

  const handleStartPrint = useCallback(
    async (id: string) => {
      try {
        await ordersService.updateStatus(id, "IN_PRODUCTION");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to start this job.");
        return;
      }
      updateJob(id, (job) => ({
        ...job,
        productionStartedAt: job.productionStartedAt ?? new Date(),
        statusHistory: addHistory(job, "printing"),
      }));
      toast.success("Print job started");
    },
    [updateJob]
  );

  const handleMarkReady = useCallback(
    async (id: string) => {
      try {
        const nextStatus: OrderStatusDto = jobs.find((j) => j.id === id)?.status === "ready"
          ? "DELIVERED"
          : "READY";
        await ordersService.updateStatus(id, nextStatus);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update this job.");
        return;
      }
      updateJob(id, (job) => {
        if (job.status === "ready") {
          return {
            ...job,
            status: "delivered" as PrintJobStatus,
            statusHistory: addHistory(job, "delivered"),
          };
        }
        return {
          ...job,
          status: "ready" as PrintJobStatus,
          readyAt: new Date(),
          statusHistory: addHistory(job, "ready"),
        };
      });
      toast.success("Job status updated");
    },
    [jobs, updateJob]
  );

  const handleCallRider = useCallback((_id: string) => {
    toast.success("Rider notified — ETA 8 min");
  }, []);

  const handlePreview = useCallback((_id: string) => {
    toast("Preview opening...", { description: "File preview not yet connected" });
  }, []);

  // ── Filtering ──
  const applyStatusFilter = useCallback(
    (list: PrintJob[]) => {
      if (activeStatus === "all") return list;
      return list.filter((j) => j.status === activeStatus);
    },
    [activeStatus]
  );

  // ── Derived lists ──
  const allVisible = useMemo(() => {
    return jobs.filter((j) => j.status !== "cancelled");
  }, [jobs]);

  const counts = useMemo<Record<StatusFilter, number>>(() => {
    const visible = jobs.filter((j) => j.status !== "cancelled");
    return {
      all: visible.length,
      pending: visible.filter((j) => j.status === "pending").length,
      printing: visible.filter((j) => j.status === "printing").length,
      ready: visible.filter((j) => j.status === "ready").length,
      delivered: visible.filter((j) => j.status === "delivered").length,
    };
  }, [jobs]);

  const incomingJobs = useMemo(
    () => applyStatusFilter(allVisible.filter((j) => j.status === "pending")),
    [allVisible, applyStatusFilter]
  );

  const activeJobs = useMemo(
    () =>
      applyStatusFilter(
        allVisible.filter(
          (j) =>
            j.status === "printing" ||
            j.status === "ready" ||
            j.status === "delivered"
        )
      ),
    [allVisible, applyStatusFilter]
  );

  return (
    <DashboardLayout pageTitle="Live Orders">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5"
      >
        {/* Welcome header + online switch */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide dashboard-page-heading">
              Welcome back
            </p>
            <h1 className="mt-0.5 dashboard-page-title">
              {activeStore?.name ?? "Store Dashboard"}
            </h1>
          </div>
          <LiveFeedTopBar
            isOnline={isOnline}
            onToggleOnline={() => {
              setIsOnline((p) => !p);
              toast(isOnline ? "You are now offline" : "You are now accepting jobs");
            }}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((p) => !p)}
          />
        </div>

        {/* Filter bar + stats */}
        <div className="flex items-center justify-between gap-4">
          <LiveFeedFilterBar
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            counts={counts}
          />
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-400 whitespace-nowrap">
            <span>{counts.pending} incoming</span>
            <span className="text-gray-200">|</span>
            <span>{counts.printing + counts.ready} active</span>
            <span className="">|</span>
            <span>{counts.delivered} completed</span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* ── Split view ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1px_2fr] gap-4">
          {/* Left: Incoming */}
          <div className={`space-y-3 relative ${!isOnline ? "pointer-events-none" : ""}`}>
            <div className="flex items-center gap-2 px-1">
              <Inbox size={15} className={isOnline ? "text-printa-red" : "text-gray-300"} />
              <span className={`text-xs font-bold uppercase tracking-wider ${isOnline ? "text-gray-500" : "text-gray-300"}`}>
                Incoming
              </span>
              <span className="ml-auto text-xs font-mono text-gray-400">
                {incomingJobs.length} jobs
              </span>
            </div>

            {!isOnline && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                <WifiOff size={40} strokeWidth={1.5} className="text-gray-300" />
                <p className="mt-3 text-sm font-semibold text-gray-400">You are offline</p>
                <p className="text-xs text-gray-300 mt-1">Go online to receive incoming orders</p>
              </div>
            )}

            <div className={`space-y-3 ${!isOnline ? "opacity-30 grayscale" : ""}`}>
              <AnimatePresence mode="popLayout">
                {incomingJobs.length > 0 ? (
                  incomingJobs.map((job) => (
                    <IncomingJobCard
                      key={job.id}
                      job={job}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onPreview={handlePreview}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-gray-100 bg-white">
                    <Inbox size={36} strokeWidth={1} className="text-gray-200" />
                    <p className="mt-3 text-sm text-gray-400">No incoming orders</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block bg-gray-200 w-px" />

          {/* Right: Active */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Layers size={15} className="text-amber-500" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Active Jobs
              </span>
              <span className="ml-auto text-xs font-mono text-gray-400">
                {activeJobs.length} jobs
              </span>
            </div>
            <AnimatePresence mode="popLayout">
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => (
                  <ActiveJobCard
                    key={job.id}
                    job={job}
                    onStartPrint={handleStartPrint}
                    onMarkReady={handleMarkReady}
                    onCallRider={handleCallRider}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-gray-100 bg-white">
                  <Layers size={36} strokeWidth={1} className="text-gray-200" />
                  <p className="mt-3 text-sm text-gray-400">No active jobs</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardV2;
