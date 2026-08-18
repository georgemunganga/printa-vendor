import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  Edit2,
  Eye,
  FileText,
  Grid3X3,
  Image,
  Link,
  List,
  Mail,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  Printer,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useStore } from "@/context/store-context";
import { catalogService } from "@/services/catalog.service";
import { inventoryService } from "@/services/inventory.service";
import type { PlatformProductDto, VendorStoreProductDto } from "@/services/contracts";

interface Product {
  id: string;
  platformProductId: string;
  name: string;
  icon: LucideIcon;
  category: string;
  price: number;
  stock: number;
  visible: boolean;
}

interface ProductForm {
  platformProductId: string;
  price: string;
  stock: string;
  visible: boolean;
}

const emptyForm: ProductForm = {
  platformProductId: "",
  price: "",
  stock: "",
  visible: true,
};

const iconForCategory = (category?: string): LucideIcon => {
  const normalized = category?.toLowerCase() ?? "";
  if (normalized.includes("print") || normalized.includes("paper")) return FileText;
  if (normalized.includes("ink") || normalized.includes("toner")) return Printer;
  if (normalized.includes("photo") || normalized.includes("image")) return Image;
  if (normalized.includes("binding")) return Link;
  if (normalized.includes("design") || normalized.includes("art")) return Palette;
  if (normalized.includes("station")) return Mail;
  if (normalized.includes("label") || normalized.includes("sticker")) return Sparkles;
  return Package;
};

const toInventoryProduct = (storeProduct: VendorStoreProductDto, catalogueById: Map<string, PlatformProductDto>): Product => {
  const platformProduct = catalogueById.get(storeProduct.platform_product_id);
  return {
    id: storeProduct.id,
    platformProductId: storeProduct.platform_product_id,
    name: platformProduct?.name ?? "Unavailable catalogue product",
    icon: iconForCategory(platformProduct?.category),
    category: platformProduct?.category ?? "Catalogue unavailable",
    price: storeProduct.vendor_price,
    stock: storeProduct.stock_quantity,
    visible: storeProduct.is_available,
  };
};

const Inventory = () => {
  const { activeStore } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogueProducts, setCatalogueProducts] = useState<PlatformProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const refreshInventory = useCallback(async () => {
    if (!activeStore?.id) {
      setProducts([]);
      setCatalogueProducts([]);
      setLoadError(null);
      return;
    }

    setIsLoading(true);
    try {
      const [storeProducts, catalogue] = await Promise.all([
        inventoryService.listProducts(activeStore.id),
        catalogService.listProducts({ active: true }),
      ]);
      const catalogueList = Array.isArray(catalogue) ? catalogue : [];
      const storeProductList = Array.isArray(storeProducts) ? storeProducts : [];
      const catalogueById = new Map(catalogueList.map((product) => [product.id, product]));
      setCatalogueProducts(catalogueList);
      setProducts(storeProductList.map((product) => toInventoryProduct(product, catalogueById)));
      setLoadError(null);
    } catch (error) {
      setProducts([]);
      setCatalogueProducts([]);
      setLoadError(error instanceof Error ? error.message : "Unable to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [activeStore?.id]);

  useEffect(() => {
    void refreshInventory();
  }, [refreshInventory, reloadKey]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query));
  }, [products, searchQuery]);

  const activeCount = products.filter((product) => product.visible).length;
  const totalStock = products.reduce((total, product) => total + product.stock, 0);
  const lowestStock = products.length ? [...products].sort((left, right) => left.stock - right.stock)[0] : null;

  const openAdd = () => {
    if (!activeStore?.id) {
      toast.error("Select a store before adding products.");
      return;
    }
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      platformProductId: product.platformProductId,
      price: String(product.price),
      stock: String(product.stock),
      visible: product.visible,
    });
    setActionMenuId(null);
    setModalOpen(true);
  };

  const closeModal = (open: boolean) => {
    if (!open && !isSaving) {
      setModalOpen(false);
      setEditingProduct(null);
      setForm(emptyForm);
    }
  };

  const handleSubmit = async () => {
    if (!activeStore?.id || isSaving) return;
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.platformProductId || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
      toast.error("Select a catalogue product and enter a valid price and whole-number stock quantity.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingProduct) {
        if (editingProduct.stock !== stock) await inventoryService.updateStock(editingProduct.id, stock);
        if (editingProduct.price !== price) await inventoryService.updateVendorPrice(editingProduct.id, price);
        if (editingProduct.visible !== form.visible) await inventoryService.setAvailability(editingProduct.id, form.visible);
        toast.success("Inventory updated.");
      } else {
        const created = await inventoryService.addProduct(activeStore.id, {
          platform_product_id: form.platformProductId,
          vendor_price: price,
          currency: "ZMW",
          stock_quantity: stock,
        });
        if (!form.visible) await inventoryService.setAvailability(created.id, false);
        toast.success("Product added to this store.");
      }
      await refreshInventory();
      setModalOpen(false);
      setEditingProduct(null);
      setForm(emptyForm);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save inventory.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = async (product: Product) => {
    try {
      await inventoryService.setAvailability(product.id, !product.visible);
      await refreshInventory();
      toast.success(product.visible ? "Product hidden from customers." : "Product made visible to customers.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update product visibility.");
    }
  };

  const hideProduct = async (product: Product) => {
    if (!product.visible) {
      toast.info("This product is already hidden from customers.");
      setActionMenuId(null);
      return;
    }
    try {
      await inventoryService.setAvailability(product.id, false);
      await refreshInventory();
      toast.success("Product hidden from customers.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to hide this product.");
    } finally {
      setActionMenuId(null);
    }
  };

  const selectedCatalogueProduct = catalogueProducts.find((product) => product.id === form.platformProductId);

  return (
    <DashboardLayout pageTitle="Inventory">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className={searchOpen ? "hidden md:block" : ""}>
            <h1 className="dashboard-page-title">Inventory</h1>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} products</p>
          </div>

          {searchOpen ? (
            <div className="flex-1 relative md:hidden">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input ref={searchInputRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search products..." autoFocus className="pl-9 pr-9" />
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
            <div className="hidden md:block relative w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search products..." className="pl-9 pr-9" />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
              )}
            </div>
            <div className="hidden md:flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setViewMode("grid")} className={`p-2 transition ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-400 hover:text-gray-600"}`}><Grid3X3 size={18} /></button>
              <button type="button" onClick={() => setViewMode("list")} className={`p-2 transition ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-400 hover:text-gray-600"}`}><List size={18} /></button>
            </div>
            <Button onClick={openAdd} className="gap-2 bg-gray-900 hover:bg-gray-800" size="sm"><Plus size={16} /><span className="hidden sm:inline">New Product</span></Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 mb-5 overflow-hidden">
        <button type="button" onClick={() => setStatsOpen((open) => !open)} className="w-full flex items-center justify-between px-5 py-3">
          <span className="text-sm font-semibold text-gray-900">Product Statistics</span>
          <ChevronUp size={18} className={`text-gray-400 transition-transform ${statsOpen ? "" : "rotate-180"}`} />
        </button>
        <AnimatePresence>
          {statsOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-5 pb-4 border-t border-gray-50 pt-4">
                <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Active Products</p><p className="text-2xl font-bold text-gray-900 mt-1">{activeCount} <span className="text-sm font-normal text-gray-400">products</span></p></div>
                <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Total Stock</p><p className="text-2xl font-bold text-gray-900 mt-1">{totalStock}</p></div>
                <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Lowest Stock</p><p className="text-sm font-semibold text-gray-900 mt-2 truncate">{lowestStock ? `${lowestStock.name} (${lowestStock.stock})` : "—"}</p></div>
                <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Sales</p><p className="text-sm font-semibold text-gray-400 mt-2">Not available</p></div>
                <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">Returns</p><p className="text-sm font-semibold text-gray-400 mt-2">Not available</p></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-sm text-gray-500">Loading live inventory...</div>
      ) : (
        <>
          {viewMode === "list" && filtered.length > 0 && (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.6fr_80px] gap-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                <span>Product</span><span>Inventory</span><span>Stock</span><span>Price</span><span>Visibility</span><span />
              </div>
              {filtered.map((product) => {
                const Icon = product.icon;
                return (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition">
                    <div className="hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.6fr_80px] gap-4 items-center px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0"><div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"><Icon size={20} className="text-gray-500" /></div><div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p><p className="text-xs text-gray-400 truncate">{product.category}</p></div></div>
                      <div><span className="text-xs font-semibold text-gray-500">Live stock data</span><div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5"><Eye size={10} /><span>Sales analytics unavailable</span></div></div>
                      <div><span className={`text-sm font-semibold ${product.stock < 50 ? "text-rose-600" : product.stock < 100 ? "text-amber-600" : "text-gray-900"}`}>{product.stock}</span></div>
                      <div><span className="text-sm font-semibold text-gray-900">K{product.price.toFixed(2)}</span></div>
                      <div><button type="button" onClick={() => void toggleVisibility(product)} className={`relative w-10 h-6 rounded-full transition-colors ${product.visible ? "bg-gray-900" : "bg-gray-200"}`}><span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${product.visible ? "translate-x-4" : "translate-x-0"}`} /></button></div>
                      <div className="flex items-center gap-1 justify-end"><button type="button" onClick={() => openEdit(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"><Edit2 size={14} /></button><button type="button" onClick={() => setActionMenuId(actionMenuId === product.id ? null : product.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"><MoreHorizontal size={14} /></button>{actionMenuId === product.id && <div className="absolute right-4 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[120px]"><button type="button" onClick={() => openEdit(product)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit2 size={14} /> Edit</button><button type="button" onClick={() => void hideProduct(product)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"><Trash2 size={14} /> Hide</button></div>}</div>
                    </div>
                    <div className="md:hidden p-4"><div className="flex items-start gap-3"><div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0"><Icon size={22} className="text-gray-500" /></div><div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p><p className="text-xs text-gray-400">{product.category}</p></div><button type="button" onClick={() => void toggleVisibility(product)} className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${product.visible ? "bg-gray-900" : "bg-gray-200"}`}><span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${product.visible ? "translate-x-4" : "translate-x-0"}`} /></button></div><div className="flex items-center gap-3 mt-2 text-xs"><span className="font-bold text-gray-900">K{product.price.toFixed(2)}</span><span className={`font-semibold ${product.stock < 50 ? "text-rose-600" : "text-gray-500"}`}>Stock: {product.stock}</span></div><p className="mt-1.5 text-xs text-gray-400">Sales analytics unavailable</p></div></div><div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50"><Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(product)}><Edit2 size={14} /> Edit</Button><Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => void hideProduct(product)}><Trash2 size={14} /></Button></div></div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {viewMode === "grid" && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((product) => {
                const Icon = product.icon;
                return <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"><div className="flex items-center justify-between mb-3"><div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center"><Icon size={22} className="text-gray-500" /></div><button type="button" onClick={() => void toggleVisibility(product)} className={`relative w-10 h-6 rounded-full transition-colors ${product.visible ? "bg-gray-900" : "bg-gray-200"}`}><span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${product.visible ? "translate-x-4" : "translate-x-0"}`} /></button></div><h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3><p className="text-xs text-gray-400 mt-0.5">{product.category}</p><div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50"><span className="text-sm font-bold text-gray-900">K{product.price.toFixed(2)}</span><span className={`text-xs font-semibold ${product.stock < 50 ? "text-rose-600" : "text-gray-500"}`}>{product.stock} in stock</span></div><div className="flex items-center gap-2 mt-3"><Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(product)}><Edit2 size={12} /> Edit</Button><Button variant="outline" size="sm" className="text-rose-600 hover:bg-rose-50 px-2" onClick={() => void hideProduct(product)}><Trash2 size={12} /></Button></div></motion.div>;
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center"><div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center"><Package size={24} className="text-gray-300" /></div><p className="text-sm font-semibold text-gray-900">{loadError ? "Unable to load products" : "No products found"}</p><p className="mt-1 text-xs text-gray-400">{loadError ? loadError : searchQuery ? "Try a different search term" : "Add a product from the platform catalogue to get started"}</p>{loadError && <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-3 text-xs font-semibold text-printa-red hover:underline">Try again</button>}</div>
          )}
        </>
      )}

      <ResponsiveModal open={modalOpen} onOpenChange={closeModal}>
        <div className="p-1"><h2 className="text-lg font-semibold text-gray-900 mb-4">{editingProduct ? "Edit Product" : "New Product"}</h2><div className="space-y-4"><div><Label>Product Name *</Label>{editingProduct ? <Input value={editingProduct.name} readOnly className="mt-1 bg-gray-50" /> : <select value={form.platformProductId} onChange={(event) => setForm((current) => ({ ...current, platformProductId: event.target.value }))} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-printa-red"><option value="">Select a platform product</option>{catalogueProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>}</div><div><Label>Category</Label><Input value={editingProduct?.category ?? selectedCatalogueProduct?.category ?? "Select a product to view its category"} readOnly className="mt-1 bg-gray-50" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Price (K) *</Label><Input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="0.00" className="mt-1" /></div><div><Label>Stock *</Label><Input type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} placeholder="0" className="mt-1" /></div></div><div className="flex items-center justify-between py-2"><Label className="mb-0">Visible to customers</Label><button type="button" onClick={() => setForm((current) => ({ ...current, visible: !current.visible }))} className={`relative w-10 h-6 rounded-full transition-colors ${form.visible ? "bg-gray-900" : "bg-gray-200"}`}><span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.visible ? "translate-x-4" : "translate-x-0"}`} /></button></div><div className="flex gap-2 pt-2"><Button variant="outline" className="flex-1" onClick={() => closeModal(false)} disabled={isSaving}>Cancel</Button><Button className="flex-1 bg-gray-900 hover:bg-gray-800" onClick={() => void handleSubmit()} disabled={isSaving}>{isSaving ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}</Button></div></div></div>
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default Inventory;
