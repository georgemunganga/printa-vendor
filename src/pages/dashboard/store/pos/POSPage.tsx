import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  Search,
  Shirt,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { POSOrderSummary, POSRightOrderPanel } from "@/components/dashboard/pos/POSRightOrderPanel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import { inventoryService } from "@/services/inventory.service";
import { catalogService } from "@/services/catalog.service";
import { ordersService } from "@/services/orders.service";
import { posService } from "@/services/pos.service";

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
}

interface OrderLine {
  service: ServiceItem;
  qty: number;
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
  const clearOrder = () => setOrder([]);

  const subtotal = order.reduce((sum, l) => sum + l.service.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const itemCount = order.reduce((sum, l) => sum + l.qty, 0);
  const hasItems = order.length > 0;

  const handleCharge = async () => {
    if (!order.length || isCharging) return;
    if (!activeStore?.id) {
      toast.error("Live POS checkout requires an available store inventory connection.");
      return;
    }
    setIsCharging(true);
    try {
      const createdOrder = await ordersService.place({
        store_id: activeStore.id,
        channel: "POS",
        items: order.map((line) => ({ vendor_store_product_id: line.service.id, quantity: line.qty })),
      });
      const method = paymentMethod === "cash" ? "CASH" : paymentMethod === "card" ? "CARD" : "MOBILE_MONEY";
      await posService.recordPayment({
        order_id: createdOrder.id,
        store_id: activeStore.id,
        amount: createdOrder.total,
        payment_method: method,
        notes: "Recorded from Vendor POS terminal",
      });
      toast.success(`Order charged: K${createdOrder.total.toFixed(2)}`);
      setOrder([]);
      setShowMobileOrder(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete the POS transaction.");
    } finally {
      setIsCharging(false);
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
              onCharge={() => {
                handleCharge();
                setShowMobileOrder(false);
              }}
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

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-printa-red/20 focus:border-printa-red transition"
            />
          </div>

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
                          K{svc.price.toFixed(2)}
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
            <div className="text-center py-16 text-gray-300">
              <Search size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-xs font-medium">
                {catalogueLoading ? "Loading store catalogue..." : catalogueError ? catalogueError : "No live products are available for this store"}
              </p>
              {catalogueError && (
                <button
                  type="button"
                  onClick={() => setCatalogueReloadKey((current) => current + 1)}
                  className="mt-3 text-xs font-semibold text-printa-red hover:underline"
                >
                  Try again
                </button>
              )}
            </div>
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
