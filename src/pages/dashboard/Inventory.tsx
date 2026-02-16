import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  Edit2,
  Eye,
  FileText,
  Grid3x3,
  Image,
  Link,
  List,
  Mail,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  Printer,
  Receipt,
  Search,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/* ─── Types ─── */
interface Product {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  price: number;
  stock: number;
  salesCount: number;
  viewCount: number;
  rating: number;
  visible: boolean;
}

/* ─── Mock data ─── */
const CATEGORIES = ["Paper", "Ink & Toner", "Accessories", "Stationery", "Equipment"];

const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "A4 Ream (500 sheets)", icon: FileText, category: "Paper", price: 45.00, stock: 920, salesCount: 3420, viewCount: 12400, rating: 4.5, visible: true },
  { id: "p2", name: "HP 26A Toner Cartridge", icon: Printer, category: "Ink & Toner", price: 350.00, stock: 28, salesCount: 994, viewCount: 8200, rating: 4.7, visible: true },
  { id: "p3", name: "Lamination Pouch A4 (100pk)", icon: Sparkles, category: "Accessories", price: 85.00, stock: 156, salesCount: 637, viewCount: 5100, rating: 4.3, visible: true },
  { id: "p4", name: "Spiral Binding Coils", icon: Link, category: "Accessories", price: 12.00, stock: 540, salesCount: 1850, viewCount: 6700, rating: 4.1, visible: true },
  { id: "p5", name: "A3 Glossy Photo Paper (20pk)", icon: Image, category: "Paper", price: 120.00, stock: 73, salesCount: 412, viewCount: 3900, rating: 4.6, visible: false },
  { id: "p6", name: "Canon PG-545 Ink", icon: Palette, category: "Ink & Toner", price: 180.00, stock: 42, salesCount: 289, viewCount: 4200, rating: 4.4, visible: true },
  { id: "p7", name: "Envelope C5 (50pk)", icon: Mail, category: "Stationery", price: 25.00, stock: 380, salesCount: 1240, viewCount: 5800, rating: 4.2, visible: true },
  { id: "p8", name: "Receipt Roll 80mm (5pk)", icon: Receipt, category: "Accessories", price: 35.00, stock: 210, salesCount: 2100, viewCount: 7300, rating: 4.0, visible: true },
];

const perfLabel = (sales: number) => {
  if (sales > 2000) return { text: "Excellent", color: "text-emerald-600" };
  if (sales > 500) return { text: "Good", color: "text-blue-600" };
  return { text: "Average", color: "text-amber-600" };
};

const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const ICON_OPTIONS: { icon: LucideIcon; label: string }[] = [
  { icon: Package, label: "Package" },
  { icon: FileText, label: "Document" },
  { icon: Printer, label: "Printer" },
  { icon: Sparkles, label: "Sparkles" },
  { icon: Link, label: "Binding" },
  { icon: Image, label: "Image" },
  { icon: Palette, label: "Ink" },
  { icon: Mail, label: "Mail" },
  { icon: Receipt, label: "Receipt" },
];

/* ─── Main Page ─── */
const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", category: CATEGORIES[0], price: "", stock: "", icon: Package as LucideIcon, visible: true,
  });

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, searchQuery]);

  // Stats
  const activeCount = products.filter((p) => p.visible).length;
  const totalSold = products.reduce((s, p) => s + p.salesCount, 0);
  const totalReturns = Math.round(totalSold * 0.034);
  const bestSeller = [...products].sort((a, b) => b.salesCount - a.salesCount)[0];
  const avgPerf = perfLabel(totalSold / products.length);

  // CRUD
  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", category: CATEGORIES[0], price: "", stock: "", icon: Package, visible: true });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), icon: p.icon, visible: p.visible });
    setModalOpen(true);
    setActionMenuId(null);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price || !form.stock) {
      toast.error("Fill in all required fields");
      return;
    }
    if (editingId) {
      setProducts((prev) => prev.map((p) => p.id === editingId ? {
        ...p, name: form.name, category: form.category, price: parseFloat(form.price),
        stock: parseInt(form.stock), icon: form.icon, visible: form.visible,
      } : p));
      toast.success("Product updated");
    } else {
      const newProduct: Product = {
        id: `p-${Date.now()}`, name: form.name, icon: form.icon, category: form.category,
        price: parseFloat(form.price), stock: parseInt(form.stock),
        salesCount: 0, viewCount: 0, rating: 0, visible: form.visible,
      };
      setProducts((prev) => [...prev, newProduct]);
      toast.success("Product added");
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product removed");
    setActionMenuId(null);
  };

  const toggleVisibility = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, visible: !p.visible } : p));
  };

  return (
    <DashboardLayout pageTitle="Inventory">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className={searchOpen ? "hidden md:block" : ""}>
            <h1 className="dashboard-page-title">Inventory</h1>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} products</p>
          </div>

          {/* Mobile search expand */}
          {searchOpen ? (
            <div className="flex-1 relative md:hidden">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." autoFocus className="pl-9 pr-9" />
              <button type="button" onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }} className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-700 transition shrink-0">
              <Search size={16} />
            </button>
          )}

          <div className="flex items-center gap-2">
            {/* Desktop search */}
            <div className="hidden md:block relative w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="pl-9 pr-9" />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            {/* View toggle */}
            <div className="hidden md:flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2 transition ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-400 hover:text-gray-600"}`}><Grid3x3 size={18} /></button>
              <button onClick={() => setViewMode("list")} className={`p-2 transition ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-400 hover:text-gray-600"}`}><List size={18} /></button>
            </div>
            <Button onClick={openAdd} className="gap-2 bg-gray-900 hover:bg-gray-800" size="sm">
              <Plus size={16} />
              <span className="hidden sm:inline">New Product</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-5 overflow-hidden">
        <button type="button" onClick={() => setStatsOpen((p) => !p)} className="w-full flex items-center justify-between px-5 py-3">
          <span className="text-sm font-semibold text-gray-900">Product Statistics</span>
          <ChevronUp size={18} className={`text-gray-400 transition-transform ${statsOpen ? "" : "rotate-180"}`} />
        </button>
        <AnimatePresence>
          {statsOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-5 pb-4 border-t border-gray-50 pt-4">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount} <span className="text-sm font-normal text-gray-400">products</span></p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">Best Seller</p>
                  <div className="flex items-center gap-2 mt-1">
                    {bestSeller && <bestSeller.icon size={18} className="text-gray-500 shrink-0" />}
                    <span className="text-sm font-semibold text-gray-900 truncate">{bestSeller?.name.split(" ").slice(0, 2).join(" ")}...</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">Avg Performance</p>
                  <p className={`text-lg font-bold mt-1 ${avgPerf.color}`}>{avgPerf.text}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">Products Sold</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalSold)} <span className="text-sm font-normal text-gray-400">items</span></p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">Returns</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalReturns} <span className="text-sm font-normal text-gray-400">items</span></p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product List View */}
      {viewMode === "list" && (
        <div className="space-y-2">
          {/* Desktop header row */}
          <div className="hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.6fr_80px] gap-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            <span>Product</span>
            <span>Performance</span>
            <span>Stock</span>
            <span>Price</span>
            <span>Visibility</span>
            <span />
          </div>
          {filtered.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition">
              {/* Desktop row */}
              <div className="hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.6fr_80px] gap-4 items-center px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"><p.icon size={20} className="text-gray-500" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span>{p.category}</span>
                      {p.rating > 0 && (
                        <>
                          <span>·</span>
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          <span>{p.rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-semibold ${perfLabel(p.salesCount).color}`}>{perfLabel(p.salesCount).text}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <TrendingUp size={10} />
                    <span>{formatNumber(p.salesCount)}</span>
                    <span>·</span>
                    <Eye size={10} />
                    <span>{formatNumber(p.viewCount)}</span>
                  </div>
                </div>
                <div>
                  <span className={`text-sm font-semibold ${p.stock < 50 ? "text-rose-600" : p.stock < 100 ? "text-amber-600" : "text-gray-900"}`}>{p.stock}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">K{p.price.toFixed(2)}</span>
                </div>
                <div>
                  <button type="button" onClick={() => toggleVisibility(p.id)} className={`relative w-10 h-6 rounded-full transition-colors ${p.visible ? "bg-gray-900" : "bg-gray-200"}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${p.visible ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <button type="button" onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"><Edit2 size={14} /></button>
                  <button type="button" onClick={() => setActionMenuId(actionMenuId === p.id ? null : p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"><MoreHorizontal size={14} /></button>
                  {actionMenuId === p.id && (
                    <div className="absolute right-4 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[120px]">
                      <button type="button" onClick={() => openEdit(p)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit2 size={14} /> Edit</button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"><Trash2 size={14} /> Delete</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile card */}
              <div className="md:hidden p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0"><p.icon size={22} className="text-gray-500" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}</p>
                      </div>
                      <button type="button" onClick={() => toggleVisibility(p.id)} className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${p.visible ? "bg-gray-900" : "bg-gray-200"}`}>
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${p.visible ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="font-bold text-gray-900">K{p.price.toFixed(2)}</span>
                      <span className={`font-semibold ${p.stock < 50 ? "text-rose-600" : "text-gray-500"}`}>Stock: {p.stock}</span>
                      {p.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-gray-400">
                          <Star size={10} className="text-amber-400 fill-amber-400" />{p.rating}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span className={`font-medium ${perfLabel(p.salesCount).color}`}>{perfLabel(p.salesCount).text}</span>
                      <span>{formatNumber(p.salesCount)} sold</span>
                      <span>{formatNumber(p.viewCount)} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(p)}><Edit2 size={14} /> Edit</Button>
                  <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center"><p.icon size={22} className="text-gray-500" /></div>
                <button type="button" onClick={() => toggleVisibility(p.id)} className={`relative w-10 h-6 rounded-full transition-colors ${p.visible ? "bg-gray-900" : "bg-gray-200"}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${p.visible ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 truncate">{p.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-sm font-bold text-gray-900">K{p.price.toFixed(2)}</span>
                <span className={`text-xs font-semibold ${p.stock < 50 ? "text-rose-600" : "text-gray-500"}`}>{p.stock} in stock</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(p)}><Edit2 size={12} /> Edit</Button>
                <Button variant="outline" size="sm" className="text-rose-600 hover:bg-rose-50 px-2" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
            <Package size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-900">No products found</p>
          <p className="mt-1 text-xs text-gray-400">{searchQuery ? "Try a different search term" : "Add your first product to get started"}</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen}>
        <div className="p-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? "Edit Product" : "New Product"}</h2>
          <div className="space-y-4">
            <div>
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. A4 Ream (500 sheets)" className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-printa-red">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ICON_OPTIONS.map((opt) => {
                  const isActive = form.icon === opt.icon;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, icon: opt.icon }))}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${isActive ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}
                      title={opt.label}
                    >
                      <opt.icon size={18} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (K) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="0" className="mt-1" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <Label className="mb-0">Visible to customers</Label>
              <button type="button" onClick={() => setForm((f) => ({ ...f, visible: !f.visible }))} className={`relative w-10 h-6 rounded-full transition-colors ${form.visible ? "bg-gray-900" : "bg-gray-200"}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.visible ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-gray-900 hover:bg-gray-800" onClick={handleSubmit}>{editingId ? "Save Changes" : "Add Product"}</Button>
            </div>
          </div>
        </div>
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default Inventory;
