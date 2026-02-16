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
import { hashString } from "@/lib/store-scope";

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

const services: ServiceItem[] = [
  { id: "s1-a4-bw", categoryId: "s1", name: "A4 B&W Print", price: 2 },
  { id: "s1-a4-color", categoryId: "s1", name: "A4 Color Print", price: 5 },
  { id: "s1-a3-bw", categoryId: "s1", name: "A3 B&W Print", price: 5 },
  { id: "s1-a3-color", categoryId: "s1", name: "A3 Color Print", price: 10 },
  { id: "s1-a5", categoryId: "s1", name: "A5 Print", price: 1.5 },
  { id: "s1-flyer", categoryId: "s1", name: "Flyer", price: 3 },
  { id: "s1-brochure", categoryId: "s1", name: "Brochure", price: 15 },
  { id: "s1-leaflet", categoryId: "s1", name: "Leaflet", price: 4 },
  { id: "s1-poster-sm", categoryId: "s1", name: "Poster (Small)", price: 20 },
  { id: "s1-menu", categoryId: "s1", name: "Menu", price: 12 },
  { id: "s1-invoice", categoryId: "s1", name: "Invoice", price: 2 },
  { id: "s1-receipt", categoryId: "s1", name: "Receipt Book", price: 35 },
  { id: "s2-biz-card", categoryId: "s2", name: "Business Cards (x100)", price: 80 },
  { id: "s2-id-card", categoryId: "s2", name: "ID Card", price: 25 },
  { id: "s2-loyalty", categoryId: "s2", name: "Loyalty Cards (x100)", price: 65 },
  { id: "s2-invite", categoryId: "s2", name: "Invitation Card", price: 8 },
  { id: "s2-greeting", categoryId: "s2", name: "Greeting Card", price: 10 },
  { id: "s2-letterhead", categoryId: "s2", name: "Letterhead (x100)", price: 90 },
  { id: "s2-envelope", categoryId: "s2", name: "Envelope (x50)", price: 45 },
  { id: "s2-notepad", categoryId: "s2", name: "Notepad", price: 30 },
  { id: "s3-journal", categoryId: "s3", name: "Journal Print", price: 55 },
  { id: "s3-magazine", categoryId: "s3", name: "Magazine", price: 45 },
  { id: "s3-newsletter", categoryId: "s3", name: "Newsletter", price: 18 },
  { id: "s4-booklet", categoryId: "s4", name: "Booklet", price: 25 },
  { id: "s4-softcover", categoryId: "s4", name: "Softcover Book", price: 65 },
  { id: "s4-hardcover", categoryId: "s4", name: "Hardcover Book", price: 120 },
  { id: "s4-spiral", categoryId: "s4", name: "Spiral Binding", price: 15 },
  { id: "s4-comb", categoryId: "s4", name: "Comb Binding", price: 12 },
  { id: "s4-calendar", categoryId: "s4", name: "Calendar", price: 40 },
  { id: "s5-tshirt", categoryId: "s5", name: "T-shirt Print", price: 75 },
  { id: "s5-polo", categoryId: "s5", name: "Polo Shirt Print", price: 95 },
  { id: "s5-hoodie", categoryId: "s5", name: "Hoodie Print", price: 150 },
  { id: "s5-overall", categoryId: "s5", name: "Overall Branding", price: 120 },
  { id: "s5-lanyard", categoryId: "s5", name: "Lanyard", price: 15 },
  { id: "s5-apron", categoryId: "s5", name: "Apron Print", price: 55 },
  { id: "s6-mug", categoryId: "s6", name: "Mug Print", price: 45 },
  { id: "s6-tumbler", categoryId: "s6", name: "Tumbler Print", price: 60 },
  { id: "s6-pen", categoryId: "s6", name: "Branded Pen (x50)", price: 85 },
  { id: "s6-mousepad", categoryId: "s6", name: "Mouse Pad", price: 35 },
  { id: "s6-keyholder", categoryId: "s6", name: "Key Holder", price: 20 },
  { id: "s7-banner", categoryId: "s7", name: "Banner (per m2)", price: 85 },
  { id: "s7-rollup", categoryId: "s7", name: "Roll-up Banner", price: 250 },
  { id: "s7-xbanner", categoryId: "s7", name: "X-Banner", price: 200 },
  { id: "s7-backdrop", categoryId: "s7", name: "Backdrop (per m2)", price: 95 },
  { id: "s7-poster-lg", categoryId: "s7", name: "Poster (Large)", price: 45 },
  { id: "s7-flag", categoryId: "s7", name: "Flag", price: 120 },
  { id: "s8-paper", categoryId: "s8", name: "Paper Sticker Sheet", price: 8 },
  { id: "s8-vinyl", categoryId: "s8", name: "Vinyl Sticker Sheet", price: 15 },
  { id: "s8-product-label", categoryId: "s8", name: "Product Labels (x100)", price: 45 },
  { id: "s8-barcode", categoryId: "s8", name: "Barcode Labels (x100)", price: 30 },
  { id: "s9-vehicle", categoryId: "s9", name: "Vehicle Branding (per m2)", price: 150 },
  { id: "s9-window", categoryId: "s9", name: "Window Vinyl (per m2)", price: 85 },
  { id: "s9-wall", categoryId: "s9", name: "Wall Vinyl (per m2)", price: 75 },
  { id: "s10-box", categoryId: "s10", name: "Product Box", price: 18 },
  { id: "s10-paperbag", categoryId: "s10", name: "Paper Bag (x50)", price: 60 },
  { id: "s10-hangtag", categoryId: "s10", name: "Hang Tags (x100)", price: 35 },
  { id: "s11-passport", categoryId: "s11", name: "Passport Photos (x8)", price: 20 },
  { id: "s11-4x6", categoryId: "s11", name: "Photo 4x6", price: 5 },
  { id: "s11-8x10", categoryId: "s11", name: "Photo 8x10", price: 15 },
  { id: "s11-canvas", categoryId: "s11", name: "Canvas Print", price: 120 },
];

const TAX_RATE = 0.16;

const POSPage: React.FC = () => {
  const { activeStore } = useStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<OrderLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "ewallet">("cash");
  const [showMobileOrder, setShowMobileOrder] = useState(false);
  const priceMultiplier = useMemo(() => {
    if (!activeStore?.id) return 1;
    const step = hashString(activeStore.id) % 3; // 0,1,2
    return 1 + step * 0.05;
  }, [activeStore?.id]);

  const servicesForStore = useMemo(
    () =>
      services.map((service) => ({
        ...service,
        price: Number((service.price * priceMultiplier).toFixed(2)),
      })),
    [priceMultiplier]
  );

  useEffect(() => {
    setOrder([]);
    setSearch("");
    setActiveCategory("all");
    setShowMobileOrder(false);
  }, [activeStore?.id]);

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

  const handleCharge = () => {
    if (!order.length) return;
    toast.success(`Order charged: K${total.toFixed(2)}`);
    setOrder([]);
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
              <p className="text-xs font-medium">No services found</p>
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
              className="h-11 px-4 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold"
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
