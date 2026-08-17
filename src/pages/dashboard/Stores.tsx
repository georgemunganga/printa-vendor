import React, { useMemo, useState } from "react";
import { Edit3, LogIn, MapPin, Plus, Store, Trash2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/context/store-context";
import { useAuth } from "@/context/auth-context";
import type { Store as StoreType } from "@/types";
import {
  createStore as createMockStore,
  deleteStore as deleteMockStore,
  updateStore as updateMockStore,
} from "@/mock-api/stores";
import { inventoryService } from "@/services/inventory.service";

interface StoreFormState {
  name: string;
  address: string;
  phone: string;
  email: string;
}

const emptyForm: StoreFormState = {
  name: "",
  address: "",
  phone: "",
  email: "",
};

const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeStore,
    availableStores,
    setActiveStore,
    refreshStores,
    isHydrating,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [form, setForm] = useState<StoreFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [switchingStoreId, setSwitchingStoreId] = useState<string | null>(null);
  const [hoveredStoreId, setHoveredStoreId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<StoreType | null>(null);

  const stores = useMemo(() => availableStores, [availableStores]);

  const openAddModal = () => {
    setEditingStore(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (store: StoreType) => {
    setEditingStore(store);
    setForm({
      name: store.name,
      address: store.address,
      phone: store.phone || "",
      email: store.email || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = (open: boolean) => {
    if (!open) {
      setIsModalOpen(false);
      setEditingStore(null);
      setForm(emptyForm);
      setIsSaving(false);
    }
  };

  const handleOpenStore = async (store: StoreType) => {
    setSwitchingStoreId(store.id);
    toast.loading(`Switching to ${store.name}...`);

    // Simulate switching delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setActiveStore(store);
    setSwitchingStoreId(null);
    toast.dismiss();
    toast.success(`Switched to ${store.name}`);
    navigate("/dashboard");
  };

  const handleBackToRoot = () => {
    setActiveStore(null);
    toast.success("Returned to all stores");
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name.trim() || !form.address.trim()) {
      toast.error("Store name and address are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingStore) {
        const payload = {
          name: form.name,
          address: form.address,
          phone: form.phone,
          email: form.email,
          city: "Lusaka",
          country: "Zambia",
        };
        try {
          await inventoryService.updateStore(editingStore.id, payload);
        } catch {
          await updateMockStore(editingStore.id, payload);
        }
        toast.success("Store updated.");
      } else {
        try {
          await inventoryService.createStore({
            vendor_id: user.businessId,
            name: form.name,
            address: form.address,
            city: "Lusaka",
            country: "Zambia",
            phone: form.phone,
            email: form.email,
          });
        } catch {
          await createMockStore({
            businessId: user.businessId,
            name: form.name,
            address: form.address,
            phone: form.phone,
            email: form.email,
          });
        }
        toast.success("Store created.");
      }
      await refreshStores();
      closeModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save store.";
      toast.error(message);
      setIsSaving(false);
    }
  };

  const handleDelete = (store: StoreType) => {
    setStoreToDelete(store);
    setDeleteDialogOpen(true);
  };

  const handleConfirmedDelete = async () => {
    if (!storeToDelete) return;

    try {
      try {
        await inventoryService.deleteStore(storeToDelete.id);
      } catch {
        await deleteMockStore(storeToDelete.id);
      }
      if (activeStore?.id === storeToDelete.id) {
        setActiveStore(null);
      }
      await refreshStores();
      toast.success("Store deleted.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete store.";
      toast.error(message);
    } finally {
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    }
  };

  return (
    <DashboardLayout pageTitle="Stores">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="dashboard-page-title">Hello <span className="text-printa-red">George</span></h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {stores.length} {stores.length === 1 ? "store" : "stores"} available
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-printa-red px-3 py-2 md:px-4 text-xs md:text-sm font-semibold text-white shadow-sm transition active:scale-95"
            onClick={openAddModal}
          >
            <Plus size={16} />
            <span className="hidden md:inline">Add Store</span>
          </button>
        </div>
        {activeStore && (
          <button
            type="button"
            onClick={handleBackToRoot}
            className="mt-2 text-xs font-semibold text-printa-red hover:underline"
          >
            Back to all stores
          </button>
        )}
      </div>

      {isHydrating ? (
        <div className="text-sm text-gray-500">Loading stores...</div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stores.map((store, index) => {
            const isActive = activeStore?.id === store.id;
            const isSwitching = switchingStoreId === store.id;
            const isCardHovered = hoveredStoreId === store.id;
            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onHoverStart={() => setHoveredStoreId(store.id)}
                onHoverEnd={() => setHoveredStoreId(null)}
                onClick={() => !isSwitching && handleOpenStore(store)}
                className={`group relative bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 overflow-hidden transition-all hover:shadow-sm cursor-pointer ${
                  isActive ? "border-printa-red/60 shadow-red-100" : "border-gray-200"
                }`}
              >
                {/* Corner Action Icons */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(store);
                  }}
                  className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-300"
                  title="Delete store"
                >
                  <Trash2 size={14} className="text-gray-600 hover:text-red-600" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(store);
                  }}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:border-blue-300"
                  title="Edit store"
                >
                  <Edit3 size={14} className="text-gray-600 hover:text-blue-600" />
                </button>

                {/* Store Icon with Rotating Arrows */}
                <div className="relative py-4 px-3 md:py-8 md:px-6">
                  <div className="flex items-center justify-center">
                    {/* Fixed container for icon + arrows */}
                    <div className="relative w-28 h-28 md:w-44 md:h-44 flex items-center justify-center">
                      {/* Rotating RefreshCw Icon - Absolutely positioned behind */}
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={
                          isSwitching
                            ? { rotate: 360 }
                            : isCardHovered
                            ? { rotate: 45 }
                            : { rotate: 0 }
                        }
                        transition={
                          isSwitching
                            ? { duration: 1, repeat: Infinity, ease: "linear" }
                            : { duration: 0.3 }
                        }
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="[&_polyline]:scale-[0.2] [&_polyline]:origin-center">
                          <RefreshCw
                            className="text-gray-300 w-24 h-24 md:w-36 md:h-36"
                            strokeWidth={0.5}
                          />
                        </div>
                      </motion.div>

                      {/* Center Icon */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative z-10 w-14 h-14 md:w-24 md:h-24 rounded-full bg-printa-red shadow-lg shadow-red-200 flex items-center justify-center"
                      >
                        <Store className="text-white w-7 h-7 md:w-10 md:h-10" strokeWidth={1.5} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Store Name */}
                  <div className="text-center mt-4">
                    <h2 className="text-lg font-bold text-gray-900 truncate px-2">
                      {store.name}
                    </h2>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-500 truncate">{store.address}</p>
                    </div>
                    {isSwitching && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Switching...
                      </motion.span>
                    )}
                    {isActive && !isSwitching && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Active
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-3">
            <Store size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No stores yet</p>
          <p className="text-xs text-gray-500 mt-1">Add your first store to get started</p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-printa-red px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95"
            onClick={openAddModal}
          >
            <Plus size={14} />
            Add Store
          </button>
        </motion.div>
      )}

      <ResponsiveModal
        open={isModalOpen}
        onOpenChange={closeModal}
        title={editingStore ? "Edit Store" : "Create Store"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input
              id="store-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Downtown Branch"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-address">Address</Label>
            <Input
              id="store-address"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main Street, Lusaka"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-phone">Phone (optional)</Label>
            <Input
              id="store-phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+260 97 1234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-email">Email (optional)</Label>
            <Input
              id="store-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="store@printa.com"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => closeModal(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? "Saving..." : editingStore ? "Save Changes" : "Create Store"}
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{storeToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default StoresPage;
