import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Inbox, Layers, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { PrintJob, PrintJobStatus } from "@/types";
import type { OrderStatusDto } from "@/services/contracts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiveFeedTopBar } from "@/components/dashboard/live-feed/LiveFeedTopBar";
import {
  LiveFeedFilterBar,
  StatusFilter,
} from "@/components/dashboard/live-feed/LiveFeedFilterBar";
import { IncomingJobCard } from "@/components/dashboard/live-feed/IncomingJobCard";
import { ActiveJobCard } from "@/components/dashboard/live-feed/ActiveJobCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common";
import { useStore } from "@/context/store-context";
import { ordersService } from "@/services/orders.service";
import { inventoryService } from "@/services/inventory.service";
import { catalogService } from "@/services/catalog.service";
import { buildStoreProductDisplayMap } from "@/lib/order-display";
import { mapOrderToPrintJob } from "@/lib/print-job";

const addHistory = (job: PrintJob, status: PrintJobStatus) => {
  const history = job.statusHistory ? [...job.statusHistory] : [];
  return [...history, { status, timestamp: new Date() }];
};

const DashboardV2: React.FC = () => {
  const { activeStore } = useStore();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!activeStore?.id) {
        if (!cancelled) {
          setJobs([]);
          setJobsError(null);
          setIsLoadingJobs(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoadingJobs(true);
        setJobsError(null);
      }
      try {
        const [orders, storeProducts, catalogueProducts] = await Promise.all([
          ordersService.listByStore(activeStore.id),
          inventoryService.listProducts(activeStore.id),
          catalogService.listProducts({ active: true }),
        ]);
        const productMap = buildStoreProductDisplayMap(storeProducts, catalogueProducts);
        if (!cancelled) {
          setJobs(orders.map((order) => mapOrderToPrintJob(order, productMap)).filter((job) => job.orderKind === "print_job"));
        }
      } catch (error) {
        if (!cancelled) {
          setJobs([]);
          setJobsError(error instanceof Error ? error.message : "Unable to load the production queue.");
        }
      } finally {
        if (!cancelled) setIsLoadingJobs(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeStore?.id, reloadKey]);


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
      const current = jobs.find((job) => job.id === id);
      if (!current) return;
      if (current.backendStatus === "CONFIRMED" || current.backendStatus === "IN_PRODUCTION") {
        updateJob(id, (job) => ({
          ...job,
          status: "printing" as PrintJobStatus,
          backendStatus: current.backendStatus,
          acceptedAt: job.acceptedAt ?? new Date(),
          statusHistory: addHistory(job, "printing"),
        }));
        toast.info("Job is already accepted.");
        return;
      }
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
          backendStatus: "CONFIRMED",
          acceptedAt: new Date(),
          statusHistory: addHistory(job, "printing"),
        };
      });
      toast.success("Job accepted — moved to active queue");
    },
    [jobs, updateJob]
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
      const current = jobs.find((job) => job.id === id);
      if (!current) return;
      if (current.backendStatus === "IN_PRODUCTION") {
        updateJob(id, (job) => ({
          ...job,
          productionStartedAt: job.productionStartedAt ?? new Date(),
          backendStatus: "IN_PRODUCTION",
        }));
        toast.info("Print job is already in production.");
        return;
      }
      if (current.backendStatus !== "CONFIRMED") {
        toast.error("Accept this job before starting production.");
        return;
      }
      try {
        await ordersService.updateStatus(id, "IN_PRODUCTION");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to start this job.");
        return;
      }
      updateJob(id, (job) => ({
        ...job,
        productionStartedAt: job.productionStartedAt ?? new Date(),
        backendStatus: "IN_PRODUCTION",
        statusHistory: addHistory(job, "printing"),
      }));
      toast.success("Print job started");
    },
    [jobs, updateJob]
  );

  const handleMarkReady = useCallback(
    async (id: string) => {
      try {
        const current = jobs.find((j) => j.id === id);
        if (!current) return;
        if (current.backendStatus !== "IN_PRODUCTION" && current.backendStatus !== "READY") {
          toast.error("Start production before marking this job ready.");
          return;
        }
        const nextStatus: OrderStatusDto = current.backendStatus === "READY"
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
            backendStatus: "DELIVERED",
            statusHistory: addHistory(job, "delivered"),
          };
        }
        return {
          ...job,
          status: "ready" as PrintJobStatus,
          backendStatus: "READY",
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

  const handlePreview = useCallback((id: string) => {
    navigate(`/dashboard/job/${id}`);
  }, [navigate]);

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
    <DashboardLayout pageTitle="Production Queue">
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
              toast(isOnline ? "You are now offline" : "You are now accepting print jobs");
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
              {isLoadingJobs ? (
                <LoadingState variant="cards" rows={2} />
              ) : jobsError ? (
                <ErrorState title="Unable to load incoming jobs" message={jobsError} onRetry={() => setReloadKey((key) => key + 1)} />
              ) : (
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
                    <EmptyState icon={Inbox} title="No incoming orders" className="border-gray-100 bg-white py-16" />
                  )}
                </AnimatePresence>
              )}
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
            {isLoadingJobs ? (
              <LoadingState variant="cards" rows={2} />
            ) : jobsError ? (
              <ErrorState title="Unable to load active jobs" message={jobsError} onRetry={() => setReloadKey((key) => key + 1)} />
            ) : (
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
                  <EmptyState icon={Layers} title="No active jobs" className="border-gray-100 bg-white py-16" />
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardV2;
