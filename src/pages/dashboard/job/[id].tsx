import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useJobContext } from "@/context/job-context";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Paperclip,
  Phone,
  Printer,
  User,
  AlertCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Status config ─── */

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Awaiting Accept",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock className="w-4 h-4" />,
  },
  printing: {
    label: "In Production",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: <Printer className="w-4 h-4" />,
  },
  ready: {
    label: "Ready",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "text-gray-500",
    bg: "bg-gray-50 border-gray-200",
    icon: <Package className="w-4 h-4" />,
  },
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Order Received" },
  { key: "printing", label: "In Production" },
  { key: "ready", label: "Ready for Pickup" },
  { key: "delivered", label: "Delivered" },
];

/* ─── Page ─── */

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getJobById,
    acceptJob,
    startProduction,
    markReady,
    getSlaLabel,
    getSlaProgress,
  } = useJobContext();
  const order = getJobById(id);

  if (!order) {
    return (
      <DashboardLayout pageTitle="Job Details">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Job not found
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              This job may have been removed or doesn't exist.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/orders")}
              className="rounded-xl"
            >
              Back to Orders
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const canAccept = order.status === "pending";
  const canStart = order.status === "printing";
  const canMarkReady = order.status === "printing";
  const slaLabel = getSlaLabel(order);
  const slaProgress = getSlaProgress(order);

  const formattedPrice = new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
  }).format(order.totalPrice);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.id);
    toast.success("Order ID copied");
  };

  const statusIdx = TIMELINE_STEPS.findIndex((s) => s.key === order.status);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <DashboardLayout pageTitle={`Job ${order.id}`}>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* ── Back + Order ID row ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">{order.id}</h1>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-lg hover:bg-gray-100 transition"
            >
              <Copy size={12} className="text-gray-400" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {order.urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-[10px] font-bold text-red-600 uppercase">
                <Zap size={10} />
                Urgent
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>
        </motion.div>

        {/* ── Hero card: File + Price + SLA ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-gray-900 p-5 text-white"
        >
          {/* Top row: file icon + name + price */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-white/70" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {order.fileName}
                </p>
                <p className="text-xs text-white/50">
                  {order.pageCount} pages &middot;{" "}
                  {order.copies} {order.copies === 1 ? "copy" : "copies"} &middot;{" "}
                  {order.colorMode === "color" ? "Color" : "B&W"}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold">{formattedPrice}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">
                Total
              </p>
            </div>
          </div>

          {/* SLA bar */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-white/50 mb-1.5">
            <span>{slaLabel}</span>
            <span>{Math.round(slaProgress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${
                slaProgress > 80
                  ? "bg-red-400"
                  : slaProgress > 50
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(slaProgress, 100)}%` }}
            />
          </div>

          {/* Preview + Download Attachments */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-white text-gray-900 hover:bg-gray-100 py-2.5 text-sm font-semibold transition"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              type="button"
              onClick={() => {
                if (order.fileUrl) {
                  window.open(order.fileUrl, "_blank");
                  toast.success("Downloading attachments...");
                } else {
                  toast.error("No attachments available");
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-sm font-semibold transition"
            >
              <Paperclip size={16} />
              Attachments
            </button>
          </div>
        </motion.div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Print Specs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Print Specifications
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Pages", value: order.pageCount },
                { label: "Copies", value: order.copies },
                {
                  label: "Color",
                  value: order.colorMode === "color" ? "Color" : "B&W",
                },
                { label: "Paper", value: order.paperSize || "A4" },
                {
                  label: "Sides",
                  value: order.doubleSided ? "Double" : "Single",
                },
                {
                  label: "Delivery",
                  value: order.deliveryType === "rider" ? "Rider" : "Pickup",
                },
              ].map((spec) => (
                <div key={spec.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                    {spec.label}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <AlertCircle
                  size={14}
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-amber-800">{order.notes}</p>
              </div>
            )}
          </motion.div>

          {/* Customer + Dates */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Customer
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-printa-red/10 flex items-center justify-center">
                <User size={18} className="text-printa-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {order.customerName || "Walk-in Customer"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {order.orderChannel === "walk-in" ? "Walk-in" : "Online"}{" "}
                  &middot; {order.printer.name}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {order.customerPhone && (
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  <Phone size={14} className="text-gray-400" />
                  {order.customerPhone}
                </a>
              )}
              {order.customerEmail && (
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 hover:bg-gray-100 transition truncate"
                >
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{order.customerEmail}</span>
                </a>
              )}
              {order.printer.address && (
                <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{order.printer.address}</span>
                </div>
              )}
            </div>

            {/* Key dates */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                  Ordered
                </p>
                <p className="text-xs font-medium text-gray-900">
                  {order.createdAt.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                  Due
                </p>
                <p className="text-xs font-medium text-gray-900">
                  {order.dueDate ||
                    order.estimatedDelivery?.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }) ||
                    "ASAP"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Timeline ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-100 bg-white p-5"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Progress
          </h2>
          <div className="flex items-start justify-between">
            {TIMELINE_STEPS.map((step, index) => {
              const isComplete = index <= statusIdx;
              const isCurrent = index === statusIdx;

              return (
                <div key={step.key} className="flex-1 relative">
                  {/* Connector line */}
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`absolute top-3.5 left-[calc(50%+14px)] right-0 h-0.5 ${
                        index < statusIdx ? "bg-printa-red" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? "bg-printa-red text-white"
                          : "bg-gray-100 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-red-100 scale-110" : ""}`}
                    >
                      {isComplete ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <p
                      className={`text-[10px] font-semibold mt-2 ${
                        isComplete ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Chat with Customer ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-gray-100 bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-printa-red/10 flex items-center justify-center">
                <MessageCircle size={18} className="text-printa-red" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Chat with Customer</h2>
                <p className="text-xs text-gray-400">
                  Ask questions about the order
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/chat?order=${order.id}`)}
              className="rounded-xl text-xs font-semibold h-9 px-4"
            >
              Open Chat
            </Button>
          </div>
        </motion.div>

        {/* ── Sticky action bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky bottom-4 z-20"
        >
          <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-xl shadow-gray-900/5">
            <div className="grid grid-cols-3 gap-2">
              <Button
                disabled={!canAccept}
                onClick={() => acceptJob(order.id)}
                className="h-11 rounded-xl text-xs font-semibold"
              >
                <CheckCircle2 size={15} className="mr-1.5" />
                Accept
              </Button>
              <Button
                variant="outline"
                disabled={!canStart}
                onClick={() => startProduction(order.id)}
                className="h-11 rounded-xl text-xs font-semibold"
              >
                <Printer size={15} className="mr-1.5" />
                Start Print
              </Button>
              <Button
                variant="outline"
                disabled={!canMarkReady}
                onClick={() => markReady(order.id)}
                className="h-11 rounded-xl text-xs font-semibold"
              >
                <Package size={15} className="mr-1.5" />
                Mark Ready
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── File Preview Modal ── */}
      <ResponsiveModal
        open={showPreview}
        onOpenChange={(open) => !open && setShowPreview(false)}
        className="sm:max-w-4xl"
        title={
          <span className="flex items-center gap-2">
            <Eye size={18} className="text-printa-red" />
            File Preview
          </span>
        }
        description={order.fileName}
      >
        <div className="space-y-4 py-2">
          {/* Preview area */}
          <div className="rounded-2xl bg-gray-100 border border-gray-200 min-h-[400px] flex flex-col items-center justify-center p-4">
            {order.fileUrl ? (
              <iframe
                src={order.fileUrl}
                title="File Preview"
                className="w-full h-[60vh] rounded-xl bg-white"
              />
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mb-4">
                  <FileText size={28} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Preview not available
                </p>
                <p className="text-xs text-gray-400 text-center">
                  The file hasn't been uploaded yet or is in an unsupported format.
                </p>
              </>
            )}
          </div>

          {/* File details */}
          <div className="rounded-xl bg-gray-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-printa-red/10 flex items-center justify-center">
                <FileText size={16} className="text-printa-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[400px]">
                  {order.fileName}
                </p>
                <p className="text-[11px] text-gray-400">
                  {order.pageCount} pages &middot;{" "}
                  {order.colorMode === "color" ? "Color" : "B&W"} &middot;{" "}
                  {order.paperSize || "A4"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (order.fileUrl) {
                  window.open(order.fileUrl, "_blank");
                  toast.success("Downloading...");
                }
              }}
              disabled={!order.fileUrl}
              className="p-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-600 transition disabled:opacity-40"
            >
              <Download size={16} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="flex-1 rounded-xl h-11"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (order.fileUrl) {
                  window.open(order.fileUrl, "_blank");
                  toast.success("Downloading attachments...");
                }
              }}
              disabled={!order.fileUrl}
              className="flex-1 rounded-xl h-11 bg-gray-900"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default JobDetailsPage;
