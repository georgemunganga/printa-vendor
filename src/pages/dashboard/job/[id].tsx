import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BackButton } from "@/components/dashboard/BackButton";
import { useJobContext } from "@/context/job-context";
import { motion } from "framer-motion";
import { CheckCircle, Clock, FilePlus, MessageCircle } from "lucide-react";

const timeline = [
  { key: "pending", label: "New" },
  { key: "printing", label: "In Production" },
  { key: "ready", label: "Ready for Dispatch" },
  { key: "delivered", label: "Dispatched" },
];

const statusMeta: Record<string, { badge: string; color: string }> = {
  pending: { badge: "bg-amber-100 text-amber-700", color: "text-amber-600" },
  printing: { badge: "bg-sky-100 text-sky-700", color: "text-sky-600" },
  ready: { badge: "bg-emerald-100 text-emerald-700", color: "text-emerald-600" },
  delivered: { badge: "bg-gray-100 text-gray-700", color: "text-gray-500" },
};

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobById, acceptJob, startProduction, markReady, getSlaLabel, getSlaProgress } =
    useJobContext();
  const order = getJobById(id);

  if (!order) {
    return (
      <DashboardLayout pageTitle="Job Details">
        <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-lg font-semibold text-gray-900">Job not found</p>
          <p className="text-sm text-gray-500 mt-2">Check the job feed for active work.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate("/dashboard/orders")}>
              Back to Orders
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusMeta[order.status] ?? statusMeta.pending;
  const canAccept = order.status === "pending";
  const canStart = order.status === "printing";
  const canMarkReady = order.status === "printing";
  const slaLabel = getSlaLabel(order);
  const slaProgress = getSlaProgress(order);

  return (
    <DashboardLayout pageTitle={`Job ${order.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {order.printer.name}
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">{order.fileName}</h1>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>
              {order.status}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
            <div>Pages: {order.pageCount}</div>
            <div>Copies: {order.copies}</div>
            <div>{order.colorMode === "color" ? "Color" : "B&W"}</div>
            <div>Due: {order.dueDate}</div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{slaLabel}</span>
            <span className="text-xs font-semibold uppercase tracking-wider">{order.paperSize ?? "Draft"}</span>
          </div>
          <div className="mt-3 h-1 rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-printa-red" style={{ width: `${slaProgress}%` }} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button
              disabled={!canAccept}
              className="justify-between"
              onClick={() => acceptJob(order.id)}
            >
              <span>Accept job</span>
              <CheckCircle size={16} />
            </Button>
            <Button
              variant="ghost"
              disabled={!canStart}
              className="justify-between"
              onClick={() => startProduction(order.id)}
            >
              <span>Start production</span>
              <Clock size={16} />
            </Button>
            <Button
              variant="outline"
              disabled={!canMarkReady}
              className="justify-between"
              onClick={() => markReady(order.id)}
            >
              <span>Mark ready</span>
              <FilePlus size={16} />
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Status timeline</h2>
            <BackButton onClick={() => navigate(-1)} ariaLabel="Go back" />
          </div>
          <div className="mt-4 space-y-4">
            {timeline.map((step, index) => {
              const isComplete = timeline.findIndex((entry) => entry.key === order.status) >= index;
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className={`mt-1 h-3 w-3 rounded-full ${isComplete ? "bg-printa-red" : "bg-gray-200"}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                    <p className="text-xs text-gray-500">ETA: {order.estimatedDelivery?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) ?? "Pending"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Communications</h2>
            <MessageCircle size={16} className="text-gray-500" />
          </div>
          <div className="text-sm text-gray-500">
            <p>Chat is limited to job-specific updates. No price or payment discussion allowed.</p>
            <p className="mt-2">Logged by the system for audit ahead of dispatch.</p>
          </div>
        </section>
      </motion.div>
    </DashboardLayout>
  );
};

export default JobDetailsPage;
