import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useJobContext } from "@/context/job-context";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  Printer,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: "New Order",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    icon: <AlertCircle className="w-5 h-5" />,
  },
  printing: {
    label: "In Production",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    icon: <Printer className="w-5 h-5" />,
  },
  ready: {
    label: "Ready",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  delivered: {
    label: "Delivered",
    color: "text-gray-500",
    bgColor: "bg-gray-50 border-gray-200",
    icon: <Package className="w-5 h-5" />,
  },
};

const JobDetailsV2Page = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobById, acceptJob, startProduction, markReady, getSlaLabel } =
    useJobContext();
  const order = getJobById(id);

  const handleCopyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
    }
  };

  const handleDownloadFile = () => {
    if (order?.fileUrl) {
      window.open(order.fileUrl, "_blank");
    }
  };

  if (!order) {
    return (
      <DashboardLayout pageTitle="Job Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h2>
            <p className="text-sm text-gray-500 mb-6">
              This job may have been removed or doesn't exist.
            </p>
            <Button onClick={() => navigate("/dashboard/orders")}>
              Back to Orders
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = statusConfig[order.status] ?? statusConfig.pending;
  const canAccept = order.status === "pending";
  const canStart = order.status === "printing";
  const canMarkReady = order.status === "printing";
  const slaLabel = getSlaLabel(order);

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
  }).format(order.totalPrice);

  return (
    <DashboardLayout pageTitle={`Order ${order.id}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header Section - Order ID & Price */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border-2 border-gray-100 p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Order ID */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Order ID
                </span>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy order ID"
                >
                  <Copy className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                {order.id}
              </h1>
              <p className="text-sm text-gray-500 mt-2">{order.fileName}</p>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Total Amount
              </div>
              <div className="text-5xl md:text-6xl font-bold text-printa-red">
                {formattedPrice}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusInfo.bgColor}`}
            >
              <span className={statusInfo.color}>{statusInfo.icon}</span>
              <span className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {order.urgent && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 bg-red-50 border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-600">URGENT</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Attachment */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-printa-red to-red-600 rounded-3xl p-6 md:p-8 text-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Print File</h2>
                  <p className="text-sm text-red-100">
                    Download the file to print
                  </p>
                </div>
                <FileText className="w-8 h-8 text-red-100" />
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{order.fileName}</p>
                    <p className="text-sm text-red-100">
                      {order.pageCount} pages • {order.colorMode === "color" ? "Color" : "B&W"}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDownloadFile}
                disabled={!order.fileUrl}
                className="w-full bg-white text-printa-red hover:bg-gray-50 font-semibold h-12"
              >
                <Download className="w-5 h-5 mr-2" />
                Download File
              </Button>

              {!order.fileUrl && (
                <p className="text-xs text-red-100 text-center mt-2">
                  File not available for download
                </p>
              )}
            </motion.div>

            {/* Print Specifications */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl border-2 border-gray-100 p-6 md:p-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Print Specifications
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Pages
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {order.pageCount}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Copies
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {order.copies}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Color Mode
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {order.colorMode === "color" ? "Color" : "Black & White"}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Paper Size
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {order.paperSize || "A4"}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Sides
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {order.doubleSided ? "Double-Sided" : "Single-Sided"}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Delivery
                  </div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {order.deliveryType || "Pickup"}
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
                        Special Instructions
                      </div>
                      <p className="text-sm text-amber-900">{order.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Customer & Timeline */}
          <div className="space-y-6">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border-2 border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-printa-red/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-printa-red" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
                  <p className="text-xs text-gray-500">
                    {order.orderChannel === "walk-in" ? "Walk-in" : "Online Order"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Name
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.customerName || "Anonymous"}
                  </p>
                </div>

                {order.customerPhone && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Phone
                    </div>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="text-sm font-medium text-printa-red hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </a>
                  </div>
                )}

                {order.customerEmail && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Email
                    </div>
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-sm font-medium text-printa-red hover:underline flex items-center gap-1 break-all"
                    >
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {order.customerEmail}
                    </a>
                  </div>
                )}

                {order.printer.address && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Location
                    </div>
                    <p className="text-sm font-medium text-gray-900 flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {order.printer.address}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Deadline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl border-2 border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Deadline</h2>
                  <p className="text-xs text-gray-500">{slaLabel}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Due Date
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.dueDate || "ASAP"}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Estimated Delivery
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.estimatedDelivery?.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }) || "Pending"}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Order Placed
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.createdAt.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl border-2 border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Progress
              </h2>

              <div className="space-y-4">
                {[
                  { key: "pending", label: "Order Received", time: order.createdAt },
                  { key: "printing", label: "In Production", time: order.acceptedAt },
                  { key: "ready", label: "Ready for Pickup", time: order.readyAt },
                  { key: "delivered", label: "Delivered", time: order.lastUpdated },
                ].map((step, index, array) => {
                  const statusIndex = array.findIndex((s) => s.key === order.status);
                  const isComplete = index <= statusIndex;
                  const isCurrent = index === statusIndex;

                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isComplete
                              ? "bg-printa-red text-white"
                              : "bg-gray-100 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-red-100" : ""}`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        {index < array.length - 1 && (
                          <div
                            className={`absolute left-4 top-8 w-0.5 h-6 ${
                              isComplete ? "bg-printa-red" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p
                          className={`text-sm font-semibold ${
                            isComplete ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.time && isComplete && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {step.time.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons - Sticky Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="sticky bottom-0 mt-6 bg-white rounded-3xl border-2 border-gray-100 p-4 md:p-6 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              disabled={!canAccept}
              onClick={() => acceptJob(order.id)}
              className="h-14 text-base font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Accept Order
            </Button>

            <Button
              variant="outline"
              disabled={!canStart}
              onClick={() => startProduction(order.id)}
              className="h-14 text-base font-semibold"
            >
              <Printer className="w-5 h-5 mr-2" />
              Start Printing
            </Button>

            <Button
              variant="outline"
              disabled={!canMarkReady}
              onClick={() => markReady(order.id)}
              className="h-14 text-base font-semibold"
            >
              <Package className="w-5 h-5 mr-2" />
              Mark Ready
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/orders")}
            className="w-full mt-3"
          >
            Back to Orders
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetailsV2Page;
