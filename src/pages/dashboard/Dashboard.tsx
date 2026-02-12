import React, { useMemo } from "react";
import {
  CheckCircle,
  Clock,
  FileText,
  Package,
  Shield,
  Signal,
  Truck,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { mockOrders } from "@/data/mockOrders";
import { motion } from "framer-motion";

const statusMeta: Record<string, { label: string; accent: string }> = {
  pending: { label: "Processing", accent: "text-amber-600 bg-amber-100" },
  printing: { label: "Printing", accent: "text-sky-600 bg-sky-100" },
  ready: { label: "Ready to Dispatch", accent: "text-emerald-600 bg-emerald-100" },
  delivered: { label: "Delivered", accent: "text-gray-600 bg-gray-100" },
};

const capabilityTiles = [
  "Small-format (A4/A5)",
  "Business stationery",
  "Posters + banners",
  "Signs & decals",
  "Cardstock + booklets",
];

const assetList = [
  { name: "HP Indigo 7900", type: "Digital press", status: "Active", load: "86%" },
  { name: "Kornit Atlas", type: "Direct-to-garment", status: "Active", load: "68%" },
  { name: "Roland VersaSTUDIO", type: "Large-format", status: "Maintenance", load: "N/A" },
];

const teamRoster = [
  { name: "Nia Mwangi", role: "Production Lead", status: "On shift" },
  { name: "Joel Mutiso", role: "Quality Engineer", status: "Reviewing proofs" },
  { name: "Amina Wambui", role: "Dispatch", status: "Ready for pickup" },
];

const payoutHistory = [
  { label: "Jan 28 · Bank", amount: "$1,220", status: "Settled" },
  { label: "Jan 27 · Mobile money", amount: "$860", status: "Settled" },
  { label: "Jan 26 · Bank", amount: "$790", status: "Scheduled" },
];

const Dashboard = () => {
  const totalOrders = mockOrders.length;
  const pendingCount = mockOrders.filter((order) => order.status === "pending").length;
  const inFlight = mockOrders.filter((order) => order.status === "printing").length;
  const readyToDispatch = mockOrders.filter((order) => order.status === "ready").length;
  const totalEarnings = mockOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const healthScore = 94;
  const slaConfidence = 92;
  const dueSoon = mockOrders.filter((order) => {
    const due = order.estimatedDelivery ?? order.createdAt;
    return due instanceof Date ? due.getTime() - Date.now() < 1000 * 60 * 60 * 6 : false;
  }).length;
  const throughput = mockOrders.reduce((sum, order) => sum + order.copies, 0);

  const statCards = [
    {
      label: "Jobs in Queue",
      value: `${pendingCount + inFlight}`,
      detail: `${pendingCount} awaiting acceptance`,
      icon: <Clock size={20} className="text-printa-red" />,
    },
    {
      label: "Ready to Dispatch",
      value: readyToDispatch,
      detail: `${dueSoon} due in 6h`,
      icon: <Truck size={20} className="text-printa-red" />,
    },
    {
      label: "Throughput",
      value: `${throughput} copies`,
      detail: `${mockOrders.length} jobs executed`,
      icon: <Package size={20} className="text-printa-red" />,
    },
    {
      label: "Earnings (7d)",
      value: `$${totalEarnings.toFixed(2)}`,
      detail: `${slaConfidence}% SLA compliance`,
      icon: <Shield size={20} className="text-printa-red" />,
    },
  ];

  return (
    <DashboardLayout pageTitle="Vendor Operations">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Overview Stats */}
        <section className="grid gap-4 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  {card.label}
                </span>
                {card.icon}
              </div>
              <p className="mt-3 text-3xl font-semibold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.detail}</p>
            </div>
          ))}
        </section>

        {/* Job feed + side panels */}
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Orders
                </p>
                <h2 className="text-xl font-semibold text-gray-900">Kitchen Queue</h2>
              </div>
              <div className="text-sm font-medium text-gray-500">{mockOrders.length} jobs</div>
            </div>
            <div className="space-y-3">
              {mockOrders.map((order) => {
                const status = statusMeta[order.status] ?? statusMeta.pending;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.accent}`}>
                        {status.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <FileText size={16} className="text-gray-300" />
                      <span className="font-medium text-gray-900">{order.fileName}</span>
                      <span>·</span>
                      <span>{order.pageCount} pages · {order.copies} copies</span>
                      <span>·</span>
                      <span>{order.colorMode === "color" ? "Color" : "B&W"}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>Due: {order.dueDate ?? "TBD"}</div>
                      <div>Assigned: {order.printer.name}</div>
                      <div>ETA: {order.estimatedDelivery ? order.estimatedDelivery.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Pending"}</div>
                      <div>SLA target: 4h</div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-printa-red transition hover:bg-printa-red/5">
                        Accept
                      </button>
                      <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500">
                        Start Production
                      </button>
                      <button className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500">
                        Mark Ready
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Online Status</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Online
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Scheduled downtime off this week: Thursday, 14:00‑16:00
              </p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-2xl bg-printa-red px-3 py-2 text-xs font-semibold text-white hover:bg-printa-red/90">
                  Go Offline
                </button>
                <button className="flex-1 rounded-2xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500">
                  Schedule Downtime
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Assets</h3>
                <Signal size={16} className="text-gray-500" />
              </div>
              <div className="mt-3 space-y-3">
                {assetList.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{asset.name}</p>
                      <p className="text-xs">{asset.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">{asset.status}</p>
                      <p className="text-xs font-semibold">{asset.load}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Team</h3>
                <Users size={16} className="text-gray-500" />
              </div>
              <div className="mt-3 space-y-2">
                {teamRoster.map((member) => (
                  <div key={member.name} className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                      <p className="text-xs">{member.role}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{member.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* Capability + Payout + Health */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Active Capabilities</h3>
              <BadgePercentIcon />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {capabilityTiles.map((capability) => (
                <span
                  key={capability}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Payout Timeline</h3>
              <Shield size={16} className="text-gray-500" />
            </div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {payoutHistory.map((entry) => (
                <li key={entry.label} className="flex items-center justify-between">
                  <span>{entry.label}</span>
                  <span className="font-semibold text-gray-900">{entry.amount}</span>
                  <span className="text-xs text-emerald-500">{entry.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Health Score</h3>
              <Signal size={16} className="text-gray-500" />
            </div>
            <p className="mt-2 text-4xl font-semibold text-gray-900">{healthScore}%</p>
            <p className="text-sm text-gray-500">On-time rate · Reprint rate · Acceptance rate</p>
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
                <span>On-time</span>
                <span>{slaConfidence}%</span>
              </div>
              <div className="h-1 rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-printa-red"
                  style={{ width: `${slaConfidence}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </DashboardLayout>
  );
};

const BadgePercentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#EF4444" strokeWidth="2" />
    <path
      d="M7 9h2l1.2 4L13 5l-2 4-1.8-3H7l1.5 4.5L7 9z"
      fill="#EF4444"
    />
  </svg>
);

export default Dashboard;
