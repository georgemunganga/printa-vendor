import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Store as StoreIcon,
  WalletCards,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { getOrderKindFromItems } from "@/lib/order-display";
import { formatMoney } from "@/lib/money";
import { ordersService } from "@/services/orders.service";
import { posService, type POSTransactionDto } from "@/services/pos.service";
import type { OrderDto } from "@/services/contracts";

type Period = 7 | 30 | 90 | 0;
type ReportRow = { order: OrderDto; transaction?: POSTransactionDto };
type DayPoint = { label: string; value: number };

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 0, label: "All time" },
];

const statusStyle: Record<string, string> = {
  DELIVERED: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  READY: "bg-blue-50 text-blue-700",
  IN_PRODUCTION: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-violet-50 text-violet-700",
  PENDING: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-red-50 text-red-700",
};

const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("en-ZM", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
const shortDate = (date: Date) =>
  new Intl.DateTimeFormat("en-ZM", { day: "2-digit", month: "short" }).format(
    date,
  );
const channelLabel = (channel: OrderDto["channel"]) =>
  channel === "POS"
    ? "Till sale"
    : channel === "KIOSK"
      ? "Kiosk order"
      : "Online order";
const rowName = (order: OrderDto) =>
  order.items
    ?.map((item) => item.product_name)
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ") ||
  (getOrderKindFromItems(order) === "retail_sale"
    ? "Retail sale"
    : "Print order");

const MetricCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  note: string;
  trend?: number;
  tone: string;
  depth?: "red" | "orange" | "violet";
}> = ({ icon: Icon, label, value, note, trend, tone, depth }) => (
  <div
    className={`reports-depth-card rounded-2xl ${depth ? "border-2 border-printa-red" : "border border-gray-100"} bg-white p-4 shadow-sm sm:p-5 ${depth ? `reports-depth-card--${depth}` : ""}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon size={19} />
      </div>
      {trend !== undefined && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}
        >
          {trend >= 0 ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}
          {Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    <p className="mt-5 text-xs font-medium text-gray-500">{label}</p>
    <p className="mt-1 truncate text-2xl font-bold tracking-tight text-gray-950">
      {value}
    </p>
    <p className="mt-1 text-[11px] text-gray-400">{note}</p>
  </div>
);

const Reports = () => {
  const { isOwner } = useAuth();
  const { activeStore, availableStores, setActiveStore } = useStore();
  const [period, setPeriod] = useState<Period>(30);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [transactions, setTransactions] = useState<POSTransactionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const load = useCallback(async () => {
    if (!activeStore?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [storeOrders, storeTransactions] = await Promise.all([
        ordersService.listByStore(activeStore.id),
        posService.listByStore(activeStore.id),
      ]);
      setOrders(storeOrders);
      setTransactions(storeTransactions);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Reports could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeStore?.id]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [period, activeStore?.id]);

  const report = useMemo(() => {
    const now = new Date();
    const cutoff =
      period === 0 ? null : new Date(now.getTime() - period * 86400000);
    const previousCutoff =
      period === 0 ? null : new Date(now.getTime() - period * 2 * 86400000);
    const inCurrent = (date: string) => !cutoff || new Date(date) >= cutoff;
    const inPrevious = (date: string) =>
      period !== 0 &&
      previousCutoff !== null &&
      new Date(date) >= previousCutoff &&
      new Date(date) < cutoff;
    const currentOrders = orders.filter((order) => inCurrent(order.created_at));
    const currentTransactions = transactions.filter((transaction) =>
      inCurrent(transaction.created_at),
    );
    const previousOrders = orders.filter((order) =>
      inPrevious(order.created_at),
    );
    const previousTransactions = transactions.filter((transaction) =>
      inPrevious(transaction.created_at),
    );
    const currentTxByOrder = new Map(
      currentTransactions.map((transaction) => [
        transaction.order_id,
        transaction,
      ]),
    );
    const orderSales = (list: OrderDto[]) =>
      list
        .filter(
          (order) => order.channel === "ONLINE" && order.status !== "CANCELLED",
        )
        .reduce((sum, order) => sum + order.total, 0);
    const tillSales = (list: POSTransactionDto[]) =>
      list
        .filter((transaction) => transaction.status === "COMPLETED")
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    const sales = orderSales(currentOrders) + tillSales(currentTransactions);
    const previousSales =
      orderSales(previousOrders) + tillSales(previousTransactions);
    const trend =
      previousSales === 0
        ? undefined
        : ((sales - previousSales) / previousSales) * 100;
    const completedTx = currentTransactions.filter(
      (transaction) => transaction.status === "COMPLETED",
    );
    const refunds = currentTransactions
      .filter((transaction) => transaction.status === "REFUNDED")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const channelTotals = {
      online: orderSales(currentOrders),
      till: tillSales(completedTx),
      other: currentOrders
        .filter(
          (order) => order.channel === "KIOSK" && order.status !== "CANCELLED",
        )
        .reduce((sum, order) => sum + order.total, 0),
    };
    const sourceOrders = currentOrders.filter(
      (order) => order.channel !== "POS",
    );
    const rows: ReportRow[] = [...currentOrders]
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .map((order) => ({ order, transaction: currentTxByOrder.get(order.id) }));
    const points: DayPoint[] = [];
    const pointCount =
      period === 7 ? 7 : period === 90 ? 6 : period === 0 ? 6 : 6;
    const span = period === 0 ? 180 : period;
    for (let index = pointCount - 1; index >= 0; index -= 1) {
      const start = new Date(
        now.getTime() - (index + 1) * (span / pointCount) * 86400000,
      );
      const end = new Date(
        now.getTime() - index * (span / pointCount) * 86400000,
      );
      const value =
        currentOrders
          .filter(
            (order) =>
              order.channel !== "POS" &&
              new Date(order.created_at) >= start &&
              new Date(order.created_at) < end,
          )
          .reduce((sum, order) => sum + order.total, 0) +
        currentTransactions
          .filter(
            (tx) =>
              tx.status === "COMPLETED" &&
              new Date(tx.created_at) >= start &&
              new Date(tx.created_at) < end,
          )
          .reduce((sum, tx) => sum + tx.amount, 0);
      points.push({
        label: period === 7 ? shortDate(start) : `Week ${pointCount - index}`,
        value,
      });
    }
    const maxPoint = Math.max(...points.map((point) => point.value), 1);
    return {
      sales,
      trend,
      orders: currentOrders,
      previousOrders,
      refunds,
      channelTotals,
      rows,
      points,
      maxPoint,
      average: currentOrders.length ? sales / currentOrders.length : 0,
      mobile: completedTx
        .filter((tx) => tx.payment_method === "MOBILE_MONEY")
        .reduce((sum, tx) => sum + tx.amount, 0),
      cash: completedTx
        .filter((tx) => tx.payment_method === "CASH")
        .reduce((sum, tx) => sum + tx.amount, 0),
      sourceOrders,
    };
  }, [orders, period, transactions]);

  const currency = orders[0]?.currency || transactions[0]?.currency || "ZMW";
  const percentOfSales = (value: number) =>
    report.sales ? `${Math.round((value / report.sales) * 100)}%` : "0%";
  const storeScopeLabel =
    isOwner() && availableStores.length > 1
      ? "Choose a store to view its report"
      : `${activeStore?.name ?? "Store"} report`;
  const filteredRows = report.rows.filter(({ order }) =>
    `${order.order_number} ${rowName(order)} ${channelLabel(order.channel)}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <DashboardLayout pageTitle="Reports">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="dashboard-page-heading">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-printa-red">
              <BarChart3 size={15} />
              Store performance
            </div>
            <h1 className="dashboard-page-title">Reports</h1>
            <p className="dashboard-page-subtitle">
              See sales, orders, and payment activity for{" "}
              {activeStore?.name ?? "your store"}.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {isOwner() && availableStores.length > 1 ? (
              <label className="relative flex items-center">
                <StoreIcon
                  size={16}
                  className="pointer-events-none absolute left-3 text-gray-400"
                />
                <select
                  aria-label="Report store"
                  value={activeStore?.id ?? ""}
                  onChange={(event) => {
                    const store = availableStores.find(
                      (item) => item.id === event.target.value,
                    );
                    if (store) setActiveStore(store);
                  }}
                  className="h-10 min-w-52 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm font-medium text-gray-700 shadow-sm"
                >
                  <option value="" disabled>
                    Select store
                  </option>
                  {availableStores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 text-gray-400"
                />
              </label>
            ) : null}
            <div
              className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
              aria-label="Report period"
            >
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${period === option.value ? "bg-printa-red text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
                >
                  {option.value === 0 ? "All time" : `${option.value} days`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <ErrorState
            title="Reports are unavailable"
            message={error}
            onRetry={() => void load()}
          />
        ) : isLoading ? (
          <>
            <LoadingState
              title="Loading report metrics…"
              variant="cards"
              rows={4}
            />
            <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
              <LoadingState title="Loading sales trend…" variant="panel" />
              <LoadingState title="Loading sales mix…" variant="panel" />
            </div>
            <LoadingState
              title="Loading recent activity…"
              variant="table"
              rows={5}
            />
          </>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              {storeScopeLabel} ·{" "}
              {period === 0 ? "All recorded activity" : `Last ${period} days`}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={CircleDollarSign}
                label="Total sales"
                value={formatMoney(report.sales, currency)}
                note="Completed sales in this period"
                trend={report.trend}
                tone="bg-printa-red/10 text-printa-red"
                depth="red"
              />
              <MetricCard
                icon={ShoppingBag}
                label="Total orders"
                value={report.orders.length.toLocaleString()}
                note={`${report.sourceOrders.length} online · ${report.orders.length - report.sourceOrders.length} till`}
                tone="bg-violet-50 text-violet-700"
              />
              <MetricCard
                icon={WalletCards}
                label="Average order"
                value={formatMoney(report.average, currency)}
                note="Sales divided by orders"
                tone="bg-amber-50 text-amber-700"
                depth="orange"
              />
              <MetricCard
                icon={RefreshCw}
                label="Refunds"
                value={formatMoney(report.refunds, currency)}
                note="POS refunds recorded"
                tone="bg-emerald-50 text-emerald-700"
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Sales overview
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Completed activity across this store
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2 text-gray-500">
                    <CalendarDays size={18} />
                  </div>
                </div>
                <div className="mt-8 flex h-52 items-end gap-2 sm:gap-3">
                  {report.points.map((point) => (
                    <div
                      key={point.label}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="group relative flex h-full w-full items-end">
                        <div
                          className="w-full rounded-t-lg bg-printa-red/80 transition hover:bg-printa-red"
                          style={{
                            height: `${Math.max(5, (point.value / report.maxPoint) * 100)}%`,
                          }}
                          title={formatMoney(point.value, currency)}
                        >
                          <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white group-hover:block">
                            {formatMoney(point.value, currency)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {point.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  {report.trend === undefined
                    ? "No previous period to compare"
                    : `${report.trend >= 0 ? "Up" : "Down"} ${Math.abs(report.trend).toFixed(1)}% compared with the previous period`}
                </div>
              </section>
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Sales by channel
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Where this store’s sales came from
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2 text-gray-500">
                    <Package size={18} />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-5">
                  <div
                    className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#e51b23 ${report.sales ? (report.channelTotals.online / report.sales) * 360 : 0}deg, #7c3aed 0 ${report.sales ? ((report.channelTotals.online + report.channelTotals.till) / report.sales) * 360 : 0}deg, #f59e0b 0)`,
                    }}
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-center">
                      <span className="text-xl font-bold text-gray-950">
                        {report.orders.length}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-gray-600">
                        <i className="h-2.5 w-2.5 rounded-full bg-printa-red" />
                        Online orders
                      </span>
                      <span className="font-semibold text-gray-900">
                        {percentOfSales(report.channelTotals.online)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-gray-600">
                        <i className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                        Till sales
                      </span>
                      <span className="font-semibold text-gray-900">
                        {percentOfSales(report.channelTotals.till)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-gray-600">
                        <i className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        Kiosk orders
                      </span>
                      <span className="font-semibold text-gray-900">
                        {percentOfSales(report.channelTotals.other)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">Cash</p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {formatMoney(report.cash, currency)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500">Mobile money</p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {formatMoney(report.mobile, currency)}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {report.rows.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No activity in this period"
                description="Completed orders and till sales will appear here when this store has activity."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPeriod(0)}
                    className="rounded-xl"
                  >
                    View all activity
                  </Button>
                }
              />
            ) : (
              <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-950">
                      Recent activity
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Orders and till sales from{" "}
                      {activeStore?.name ?? "this store"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="relative flex items-center">
                      <Search size={14} className="pointer-events-none absolute left-3 text-gray-400" />
                      <input aria-label="Search report activity" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search activity" className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-printa-red sm:w-44" />
                    </label>
                    <Button type="button" variant="outline" size="sm" onClick={() => void load()} className="w-fit gap-2 rounded-xl"><RefreshCw size={14} />Refresh</Button>
                  </div>
                </div>
                {filteredRows.length === 0 ? <EmptyState icon={Search} title="No matching activity" description="Try a different order number, item name, or channel." className="m-4" /> : <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Order</th>
                        <th className="px-5 py-3 font-semibold">Type</th>
                        <th className="px-5 py-3 font-semibold">Date</th>
                        <th className="px-5 py-3 font-semibold">Payment</th>
                        <th className="px-5 py-3 text-right font-semibold">
                          Amount
                        </th>
                        <th className="px-5 py-3 text-right font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {visibleRows
                        .map(({ order, transaction }) => (
                          <tr key={order.id} className="text-gray-700">
                            <td className="max-w-56 truncate px-5 py-4 font-semibold text-gray-900">
                              {rowName(order)}
                              <span className="mt-1 block text-[11px] font-normal text-gray-400">
                                {order.order_number}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {channelLabel(order.channel)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                              {dateLabel(order.created_at)}
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-500">
                              {transaction?.payment_method?.replace("_", " ") ??
                                "Online"}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-900">
                              {formatMoney(
                                transaction?.amount ?? order.total,
                                order.currency,
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span
                                className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyle[transaction?.status ?? order.status] ?? "bg-gray-100 text-gray-600"}`}
                              >
                                {transaction?.status ?? order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="divide-y divide-gray-100 md:hidden">
                  {visibleRows.map(({ order, transaction }) => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {rowName(order)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {order.order_number} · {channelLabel(order.channel)}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatMoney(
                            transaction?.amount ?? order.total,
                            order.currency,
                          )}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {dateLabel(order.created_at)} ·{" "}
                          {transaction?.payment_method?.replace("_", " ") ??
                            "Online"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyle[transaction?.status ?? order.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {transaction?.status ?? order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length}</span>
                  <div className="flex items-center gap-1"><Button type="button" variant="outline" size="sm" aria-label="Previous report page" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="h-8 w-8 rounded-lg p-0"><ChevronLeft size={15} /></Button><span className="min-w-16 text-center font-semibold text-gray-700">Page {page} of {pageCount}</span><Button type="button" variant="outline" size="sm" aria-label="Next report page" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="h-8 w-8 rounded-lg p-0"><ChevronRight size={15} /></Button></div>
                </div>
                </>}
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
