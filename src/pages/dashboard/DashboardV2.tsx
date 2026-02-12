import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, Layers, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { PrintJob, PrintJobStatus } from "@/types";
import { mockLiveOrders } from "@/data/mockLiveOrders";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LiveFeedTopBar } from "@/components/dashboard/live-feed/LiveFeedTopBar";
import {
  LiveFeedFilterBar,
  StatusFilter,
} from "@/components/dashboard/live-feed/LiveFeedFilterBar";
import { IncomingJobCard } from "@/components/dashboard/live-feed/IncomingJobCard";
import { ActiveJobCard } from "@/components/dashboard/live-feed/ActiveJobCard";

const addHistory = (job: PrintJob, status: PrintJobStatus) => {
  const history = job.statusHistory ? [...job.statusHistory] : [];
  return [...history, { status, timestamp: new Date() }];
};

// ── Notification sound ──
const notificationAudio = new Audio("/audio/liveorder.mp3");
const playNotificationSound = () => {
  try {
    notificationAudio.currentTime = 0;
    notificationAudio.play();
  } catch {
    // Audio not available
  }
};

// ── Simulated incoming orders pool ──
const simulatedOrders: Omit<PrintJob, "createdAt" | "acceptDeadline" | "lastUpdated" | "statusHistory">[] = [
  {
    id: "LV-3001",
    fileName: "graduation-photos.pdf",
    status: "pending",
    totalPrice: 55.0,
    pageCount: 20,
    copies: 5,
    colorMode: "color",
    printer: { name: "HP LaserJet Pro" },
    paperSize: "A4",
    doubleSided: false,
    customerName: "Mwamba Kaunda",
    deliveryType: "rider",
    distance: 2.1,
  },
  {
    id: "LV-3002",
    fileName: "cv-resume.docx",
    status: "pending",
    totalPrice: 12.0,
    pageCount: 3,
    copies: 10,
    colorMode: "bw",
    printer: { name: "HP LaserJet Pro" },
    paperSize: "A4",
    doubleSided: true,
    customerName: "Mulenga Chilufya",
    deliveryType: "pickup",
  },
  {
    id: "LV-3003",
    fileName: "church-bulletin.pdf",
    status: "pending",
    totalPrice: 28.0,
    pageCount: 4,
    copies: 100,
    colorMode: "color",
    printer: { name: "HP LaserJet Pro" },
    paperSize: "A5",
    doubleSided: true,
    customerName: "Pastor Mumba",
    deliveryType: "pickup",
    urgent: true,
  },
  {
    id: "LV-3004",
    fileName: "product-catalogue.pdf",
    status: "pending",
    totalPrice: 150.0,
    pageCount: 24,
    copies: 50,
    colorMode: "color",
    printer: { name: "HP LaserJet Pro" },
    paperSize: "A4",
    doubleSided: true,
    customerName: "Thandiwe Ngoma",
    deliveryType: "rider",
    distance: 5.4,
  },
  {
    id: "LV-3005",
    fileName: "exam-paper.pdf",
    status: "pending",
    totalPrice: 18.5,
    pageCount: 8,
    copies: 30,
    colorMode: "bw",
    printer: { name: "HP LaserJet Pro" },
    paperSize: "A4",
    doubleSided: false,
    customerName: "Mr. Kapambwe",
    deliveryType: "pickup",
  },
  {
    id: "LV-3006",
    fileName: "birthday-banner.pdf",
    status: "pending",
    totalPrice: 75.0,
    pageCount: 1,
    copies: 2,
    colorMode: "color",
    printer: { name: "HP LaserJet Pro" },
    paperSize: "A1",
    doubleSided: false,
    customerName: "Chimwemwe Banda",
    deliveryType: "rider",
    distance: 3.7,
    urgent: true,
  },
];

const DashboardV2: React.FC = () => {
  const [jobs, setJobs] = useState<PrintJob[]>(() =>
    mockLiveOrders.map((o) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      estimatedDelivery: o.estimatedDelivery
        ? new Date(o.estimatedDelivery)
        : undefined,
      acceptDeadline: o.acceptDeadline
        ? new Date(o.acceptDeadline)
        : undefined,
      lastUpdated: new Date(),
      statusHistory: [{ status: o.status, timestamp: new Date(o.createdAt) }],
    }))
  );

  const [isOnline, setIsOnline] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");

  // ── Simulate incoming orders ──
  const simIndexRef = useRef(0);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    if (!isOnline) return;

    // Random interval between 8–20 seconds
    const scheduleNext = () => {
      const delay = 8_000 + Math.random() * 12_000;
      return setTimeout(() => {
        if (simIndexRef.current >= simulatedOrders.length) {
          simIndexRef.current = 0; // loop back
        }

        const template = simulatedOrders[simIndexRef.current];
        simIndexRef.current += 1;

        const now = new Date();
        const newJob: PrintJob = {
          ...template,
          id: `${template.id}-${Date.now()}`, // unique id
          createdAt: now,
          acceptDeadline: new Date(now.getTime() + 15 * 60_000),
          lastUpdated: now,
          statusHistory: [{ status: "pending", timestamp: now }],
        };

        setJobs((prev) => [newJob, ...prev]);

        if (soundEnabledRef.current) {
          playNotificationSound();
        }

        toast("New order received!", {
          description: `${newJob.customerName} — ${newJob.fileName}`,
        });

        timerId = scheduleNext();
      }, delay);
    };

    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, [isOnline]);

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
    (id: string) => {
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
    (id: string) => {
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
    (id: string) => {
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
    (id: string) => {
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
    [updateJob]
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
              Downtown Cafe
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
