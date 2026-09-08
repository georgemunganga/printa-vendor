import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Camera,
  Car,
  CreditCard,
  FileText,
  Flag,
  Gift,
  Minus,
  Newspaper,
  Package,
  Plus,
  Printer,
  Mail,
  CheckCircle2,
  ExternalLink,
  Shirt,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { POSOrderSummary, POSRightOrderPanel } from "@/components/dashboard/pos/POSRightOrderPanel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorState, LoadingState, SearchBar } from "@/components/common";
import { useStore } from "@/context/store-context";
import { inventoryService } from "@/services/inventory.service";
import { catalogService } from "@/services/catalog.service";
import { ordersService } from "@/services/orders.service";
import { posService } from "@/services/pos.service";
import { commsService } from "@/services/comms.service";
import { isPrintProduct, orderKindNote } from "@/lib/order-kind";
import { formatMoney } from "@/lib/money";
import { playOperationalSound, unlockOperationalSound } from "@/lib/operational-sound";
import type { OrderDto } from "@/services/contracts";

interface ServiceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  requiresProduction: boolean;
}

interface OrderLine {
  service: ServiceItem;
  qty: number;
}

interface CompletedSale {
  order: OrderDto;
  lines: OrderLine[];
  paymentMethod: "cash" | "card" | "ewallet";
  requiresProduction: boolean;
  completedAt: Date;
}

const categories: ServiceCategory[] = [
  { id: "all", name: "All", icon: ShoppingCart, color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-300" },
  { id: "s1", name: "Paper Printing", icon: FileText, color: "text-printa-red", bg: "bg-red-50", border: "border-red-200" },
  { id: "s2", name: "Cards & Stationery", icon: CreditCard, color: "text-printa-red", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "s3", name: "Periodicals", icon: Newspaper, color: "text-printa-red", bg: "bg-purple-50", border: "border-purple-200" },
  { id: "s4", name: "Books & Binding", icon: BookOpen, color: "text-printa-red", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "s5", name: "Apparel & Fabric", icon: Shirt, color: "text-printa-red", bg: "bg-green-50", border: "border-green-200" },
  { id: "s6", name: "Promotional Items", icon: Gift, color: "text-printa-red", bg: "bg-pink-50", border: "border-pink-200" },
  { id: "s7", name: "Large Format", icon: Flag, color: "text-printa-red", bg: "bg-orange-50", border: "border-orange-200" },
  { id: "s8", name: "Stickers & Labels", icon: Tag, color: "text-printa-red", bg: "bg-teal-50", border: "border-teal-200" },
  { id: "s9", name: "Vinyl & Wraps", icon: Car, color: "text-printa-red", bg: "bg-indigo-50", border: "border-indigo-200" },
  { id: "s10", name: "Packaging", icon: Package, color: "text-printa-red", bg: "bg-rose-50", border: "border-rose-200" },
  { id: "s11", name: "Photo Printing", icon: Camera, color: "text-printa-red", bg: "bg-cyan-50", border: "border-cyan-200" },
];


const TAX_RATE = 0.16;

const createClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const escapeReceiptText = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const POSPage: React.FC = () => {
  const { activeStore } = useStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<OrderLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "ewallet">("cash");
  const [showMobileOrder, setShowMobileOrder] = useState(false);
  const [liveServices, setLiveServices] = useState<ServiceItem[]>([]);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [catalogueReloadKey, setCatalogueReloadKey] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [showEmailReceiptForm, setShowEmailReceiptForm] = useState(false);
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);
  const cartIdRef = useRef(createClientId());

  const servicesForStore = liveServices;

  useEffect(() => {
    setOrder([]);
    setSearch("");
    setActiveCategory("all");
    setShowMobileOrder(false);
    setLiveServices([]);
    setCatalogueError(null);
    if (!activeStore?.id) return;
    let cancelled = false;
    setCatalogueLoading(true);
    void (async () => {
      try {
        const storeProducts = await inventoryService.listProducts(activeStore.id);
        const catalogue = await Promise.all(storeProducts.map(async (storeProduct) => ({
          storeProduct,
          product: await catalogService.getProduct(storeProduct.platform_product_id),
        })));
        if (!cancelled) {
          setLiveServices(catalogue.filter(({ storeProduct }) => storeProduct.is_available).map(({ storeProduct, product }) => ({
            id: storeProduct.id,
            categoryId: categories.find((category) => category.name.toLowerCase() === product.category.toLowerCase())?.id ?? "s1",
            name: product.name,
            price: storeProduct.vendor_price,
            requiresProduction: isPrintProduct(product),
          })));
        }
      } catch (error) {
        if (!cancelled) {
          setLiveServices([]);
          setCatalogueError(error instanceof Error ? error.message : "Unable to load the store catalogue.");
        }
      } finally {
        if (!cancelled) setCatalogueLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeStore?.id, catalogueReloadKey]);

  const filtered = useMemo(() => {
    let list = servicesForStore;
    if (activeCategory !== "all") list = list.filter((s) => s.categoryId === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [servicesForStore, activeCategory, search]);

  const catMap = useMemo(() => {
    const m: Record<string, ServiceCategory> = {};
    categories.forEach((c) => {
      m[c.id] = c;
    });
    return m;
  }, []);

  const addToOrder = (service: ServiceItem) => {
    setOrder((prev) => {
      const idx = prev.findIndex((l) => l.service.id === service.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { service, qty: 1 }];
    });
  };

  const updateQty = (serviceId: string, delta: number) => {
    setOrder((prev) => prev
      .map((l) => (l.service.id === serviceId ? { ...l, qty: l.qty + delta } : l))
      .filter((l) => l.qty > 0));
  };

  const removeItem = (serviceId: string) => setOrder((prev) => prev.filter((l) => l.service.id !== serviceId));
  const resetCartId = () => {
    cartIdRef.current = createClientId();
  };

  const clearOrder = () => {
    setOrder([]);
    resetCartId();
  };

  const subtotal = order.reduce((sum, l) => sum + l.service.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const itemCount = order.reduce((sum, l) => sum + l.qty, 0);
  const hasItems = order.length > 0;

  const handleCharge = async (): Promise<boolean> => {
    if (!order.length || isCharging) return false;
    unlockOperationalSound();
    if (!activeStore?.id) {
      toast.error("Live POS checkout requires an available store inventory connection.");
      return false;
    }
    setIsCharging(true);
    try {
      const saleLines = order.map((line) => ({ ...line }));
      const requiresProduction = saleLines.some((line) => line.service.requiresProduction);
      const checkoutId = cartIdRef.current;
      const createdOrder = await ordersService.place({
        store_id: activeStore.id,
        channel: "POS",
        items: saleLines.map((line) => ({ vendor_store_product_id: line.service.id, quantity: line.qty })),
        notes: orderKindNote(requiresProduction ? "print_job" : "retail_sale"),
      }, `pos-order-${activeStore.id}-${checkoutId}`);
      const method = paymentMethod === "cash" ? "CASH" : paymentMethod === "card" ? "CARD" : "MOBILE_MONEY";
      await posService.recordPayment({
        order_id: createdOrder.id,
        store_id: activeStore.id,
        amount: createdOrder.total,
        payment_method: method,
        notes: "Recorded from Vendor POS terminal",
      }, `pos-payment-${createdOrder.id}-${checkoutId}`);
      setCompletedSale({
        order: createdOrder,
        lines: saleLines,
        paymentMethod,
        requiresProduction,
        completedAt: new Date(),
      });
      toast.success(`Sale complete: ${formatMoney(createdOrder.total, createdOrder.currency)}`);
      playOperationalSound("success");
      setOrder([]);
      setShowMobileOrder(false);
      resetCartId();
      setCatalogueReloadKey((current) => current + 1);
      return true;
    } catch (error) {
      playOperationalSound("error");
      toast.error(error instanceof Error ? error.message : "Unable to complete the POS transaction.");
      return false;
    } finally {
      setIsCharging(false);
    }
  };

  const printReceipt = () => {
    if (!completedSale) return;
    const receiptWindow = window.open("", "_blank", "width=420,height=720");
    if (!receiptWindow) {
      toast.error("Allow popups to print the receipt.");
      return;
    }

    const rows = completedSale.lines
      .map((line) => `
        <tr>
          <td>${escapeReceiptText(line.service.name)}</td>
          <td style="text-align:center">${line.qty}</td>
          <td style="text-align:right">${formatMoney(line.service.price * line.qty, completedSale.order.currency)}</td>
        </tr>`)
      .join("");

    receiptWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>Receipt ${completedSale.order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { font-size: 20px; margin: 0 0 4px; }
            .muted { color: #6b7280; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; }
            td { padding: 8px 0; border-bottom: 1px dashed #e5e7eb; }
            .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-top: 16px; }
          </style>
        </head>
        <body>
          <h1>${escapeReceiptText(activeStore?.name ?? "Printa Vendor")}</h1>
          <div class="muted">${completedSale.order.order_number}</div>
          <div class="muted">${completedSale.completedAt.toLocaleString()}</div>
          <table>${rows}</table>
          <div class="total"><span>Total</span><span>${formatMoney(completedSale.order.total, completedSale.order.currency)}</span></div>
          <p class="muted">Payment: ${completedSale.paymentMethod === "ewallet" ? "E-Wallet" : completedSale.paymentMethod === "cash" ? "Cash" : "Debit Card"}</p>
        </body>
      </html>`);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
  };

  const buildReceiptText = (sale: CompletedSale) => [
    `${activeStore?.name ?? "Printa Vendor"} receipt`,
    `Order: ${sale.order.order_number}`,
    `Total: ${formatMoney(sale.order.total, sale.order.currency)}`,
    `Payment: ${sale.paymentMethod === "ewallet" ? "E-Wallet" : sale.paymentMethod === "cash" ? "Cash" : "Debit Card"}`,
    sale.requiresProduction ? "Type: Print job" : "Type: Till sale",
    "",
    "Items:",
    ...sale.lines.map((line) => `- ${line.qty} x ${line.service.name} = ${formatMoney(line.service.price * line.qty, sale.order.currency)}`),
  ].join("\n");

  const buildReceiptHtml = (sale: CompletedSale) => {
    const rows = sale.lines
      .map((line) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${escapeReceiptText(line.service.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${line.qty}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(line.service.price * line.qty, sale.order.currency)}</td>
        </tr>`)
      .join("");

    return `
      <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;max-width:560px;margin:0 auto;">
        <div style="background:#111827;color:white;border-radius:20px;padding:20px;margin-bottom:18px;">
          <div style="font-size:12px;text-transform:uppercase;color:rgba(255,255,255,.65);letter-spacing:.08em;">${escapeReceiptText(activeStore?.name ?? "Printa Vendor")}</div>
          <h1 style="font-size:22px;margin:6px 0 2px;">Receipt ${escapeReceiptText(sale.order.order_number)}</h1>
          <div style="font-size:13px;color:rgba(255,255,255,.7);">${sale.completedAt.toLocaleString()}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead><tr><th align="left">Item</th><th>Qty</th><th align="right">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:700;margin-top:18px;padding-top:14px;border-top:2px solid #111827;">
          <span>Total paid</span><span>${formatMoney(sale.order.total, sale.order.currency)}</span>
        </div>
        <p style="font-size:13px;color:#6b7280;">Payment: ${sale.paymentMethod === "ewallet" ? "E-Wallet" : sale.paymentMethod === "cash" ? "Cash" : "Debit Card"}</p>
        <p style="font-size:13px;color:#6b7280;">${sale.requiresProduction ? "Your print job has been added to the production queue." : "Your till sale has been recorded."}</p>
      </div>`;
  };

  const isValidReceiptEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiptEmail.trim());

  const sendReceiptEmail = async () => {
    if (!completedSale || !isValidReceiptEmail || isSendingReceipt) return;
    setIsSendingReceipt(true);
    try {
      await commsService.send({
        channel: "EMAIL",
        recipient: receiptEmail.trim(),
        subject: `Receipt ${completedSale.order.order_number} from ${activeStore?.name ?? "Printa Vendor"}`,
        body: buildReceiptText(completedSale),
        html_body: buildReceiptHtml(completedSale),
        metadata: {
          type: "POS_RECEIPT",
          order_id: completedSale.order.id,
          order_number: completedSale.order.order_number,
          store_id: activeStore?.id ?? completedSale.order.store_id,
        },
      }, `pos-receipt-${completedSale.order.id}-${receiptEmail.trim().toLowerCase()}`);
      toast.success(`Receipt sent to ${receiptEmail.trim()}`);
      setShowEmailReceiptForm(false);
      setReceiptEmail("");
    } catch (error) {
      playOperationalSound("error");
      toast.error(error instanceof Error ? error.message : "Unable to send the receipt email.");
    } finally {
      setIsSendingReceipt(false);
    }
  };

  return (
    <DashboardLayout pageTitle="POS Terminal" hideMobileBottomNav={hasItems}>
      {showMobileOrder && (
        <div className="fixed inset-0 z-50 bg-gray-50 lg:hidden flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <Button
              type="button"
              onClick={() => setShowMobileOrder(false)}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <X size={18} className="text-gray-600" />
            </Button>
            <h2 className="text-lg font-bold text-gray-900">Order</h2>
          </div>
          <div className="flex-1 overflow-y-auto bg-white rounded-t-2xl mt-2">
            <POSOrderSummary
              order={order}
              subtotal={subtotal}
              tax={tax}
              total={total}
              itemCount={itemCount}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              onClear={clearOrder}
              onCharge={handleCharge}
              catMap={catMap}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              layoutMode="mobile"
            />
          </div>
        </div>
      )}

      <div className={`flex items-start gap-6 ${hasItems ? "pb-24 lg:pb-0" : ""}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="dashboard-page-title">Point of Sale</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeStore?.name ?? "Store"} · Select services & products for walk-in orders
              </p>
            </div>
          </div>

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search services..."
            className="mb-4"
            inputClassName="py-3 placeholder:text-gray-300 focus:ring-2 focus:ring-printa-red/20 focus:border-printa-red"
          />

          <div className="flex gap-1.5 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition whitespace-nowrap ${
                    isActive ? "bg-printa-red text-white" : "text-gray-400 hover:text-gray-600 hover:bg-white/60"
                  }`}
                >
                  <Icon size={12} />
                  {cat.name}
                </button>
              );
            })}
          </div>

          <hr className="border-gray-200 mb-4" />

          <div className={`grid gap-2.5 ${hasItems ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"}`}>
            <AnimatePresence mode="popLayout">
              {filtered.map((svc) => {
                const cat = catMap[svc.categoryId];
                const Icon = cat?.icon ?? FileText;
                const inOrder = order.find((l) => l.service.id === svc.id);
                const qty = inOrder?.qty ?? 0;
                return (
                  <motion.div
                    key={svc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => addToOrder(svc)}
                    className={`group relative p-3 rounded-xl transition-all duration-200 active:scale-[0.99] cursor-pointer ${
                      inOrder
                        ? "bg-printa-red border border-printa-red shadow-sm hover:bg-printa-black"
                        : "bg-white/70 border border-printa-red/30 hover:bg-printa-black hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold truncate leading-tight transition-colors duration-200 ${inOrder ? "text-white" : "text-gray-800 group-hover:text-white"}`}>
                          {svc.name}
                        </p>
                        <p className={`text-xs font-bold mt-1 transition-colors duration-200 ${inOrder ? "text-white/95" : "text-gray-900 group-hover:text-white/95"}`}>
                          {formatMoney(svc.price)}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl  flex items-center justify-center flex-shrink-0`}>
                        <Icon size={26} className={`transition-colors duration-200 ${inOrder ? "text-white" : `group-hover:text-white ${cat?.color ?? "text-gray-500"}`}`} />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (qty > 0) updateQty(svc.id, -1);
                        }}
                        className={`h-7 w-7 rounded-xl flex items-center justify-center transition-colors duration-200 disabled:opacity-40 ${
                          inOrder
                            ? "border border-white/40 bg-white/10 text-white hover:bg-white/20"
                            : "border border-gray-300 bg-white text-gray-600 group-hover:border-white/40 group-hover:bg-white/10 group-hover:text-white"
                        }`}
                        disabled={qty === 0}
                      >
                        <Minus size={12} />
                      </button>
                      <span className={`text-sm font-semibold w-5 text-center transition-colors duration-200 ${inOrder ? "text-white" : "text-gray-800 group-hover:text-white"}`}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToOrder(svc);
                        }}
                        className={`h-7 w-7 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                          inOrder
                            ? "border border-white/40 bg-white/10 text-white hover:bg-white/20"
                            : "border border-gray-300 bg-white text-gray-600 group-hover:border-white/40 group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            catalogueLoading ? (
              <LoadingState title="Loading store catalogue…" variant="cards" rows={4} />
            ) : catalogueError ? (
              <ErrorState title="Unable to load POS catalogue" message={catalogueError} onRetry={() => setCatalogueReloadKey((current) => current + 1)} />
            ) : (
              <EmptyState icon={Package} title="No live products" description="No live products are available for this store." className="bg-white py-16" />
            )
          )}
        </div>

        <POSRightOrderPanel
          hasItems={hasItems}
          order={order}
          subtotal={subtotal}
          tax={tax}
          total={total}
          itemCount={itemCount}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClear={clearOrder}
          onCharge={handleCharge}
          catMap={catMap}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
        />
      </div>


      <ResponsiveModal
        open={Boolean(completedSale)}
        onOpenChange={(open) => { if (!open) { setCompletedSale(null); setShowEmailReceiptForm(false); setReceiptEmail(""); } }}
        className="sm:max-w-lg"
        title={
          <span className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            Sale complete
          </span>
        }
        description="Receipt actions are ready for this completed POS sale."
      >
        {completedSale && (
          <div className="space-y-5 py-2">
            <div className="rounded-3xl bg-gray-950 p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">Order</p>
                  <h3 className="mt-1 text-lg font-bold">{completedSale.order.order_number}</h3>
                  <p className="mt-1 text-xs text-white/50">
                    {completedSale.requiresProduction ? "Print job added to production queue" : "Till sale recorded"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-white/50">Total paid</p>
                  <p className="mt-1 text-2xl font-bold">{formatMoney(completedSale.order.total, completedSale.order.currency)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              {completedSale.lines.map((line) => (
                <div key={line.service.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{line.service.name}</p>
                    <p className="text-xs text-gray-400">Qty {line.qty}</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatMoney(line.service.price * line.qty, completedSale.order.currency)}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={printReceipt}
                className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 text-sm font-bold text-gray-900 transition hover:border-printa-red/40 hover:bg-printa-red/5 hover:text-printa-red"
              >
                <Printer size={22} className="mb-2" />
                Print receipt
              </button>
              <button
                type="button"
                onClick={() => setShowEmailReceiptForm((current) => !current)}
                className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 text-sm font-bold text-gray-900 transition hover:border-printa-red/40 hover:bg-printa-red/5 hover:text-printa-red"
              >
                <Mail size={22} className="mb-2" />
                Email receipt
              </button>
            </div>



            {showEmailReceiptForm && (
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt-email" className="text-sm font-semibold text-gray-900">
                    Customer email
                  </Label>
                  <Input
                    id="receipt-email"
                    type="email"
                    value={receiptEmail}
                    onChange={(event) => setReceiptEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void sendReceiptEmail();
                      }
                    }}
                    placeholder="customer@example.com"
                    autoFocus
                    className="h-12 bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    The receipt will be sent by Printa, not by opening the device email app.
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowEmailReceiptForm(false);
                      setReceiptEmail("");
                    }}
                    disabled={isSendingReceipt}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-printa-red text-white hover:bg-red-700"
                    onClick={() => void sendReceiptEmail()}
                    disabled={!isValidReceiptEmail || isSendingReceipt}
                  >
                    {isSendingReceipt ? "Sending..." : "Send receipt"}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setCompletedSale(null); setShowEmailReceiptForm(false); setReceiptEmail(""); }}>
                New sale
              </Button>
              <Button asChild className="flex-1 bg-printa-red text-white hover:bg-red-700">
                <Link to={`/dashboard/job/${completedSale.order.id}`}>
                  <ExternalLink size={16} className="mr-2" />
                  View order
                </Link>
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>

      {hasItems && !showMobileOrder && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <div className="flex items-center gap-2">
           
            <Button
              type="button"
              onClick={() => setShowMobileOrder(true)}
              className="flex-1 text-white text-sm font-bold flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} />
              Proceed to Order ({itemCount})
            </Button>
             <Button
              type="button"
              onClick={clearOrder}
              className="h-11 px-4 rounded-xl text-sm font-semibold"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default POSPage;
