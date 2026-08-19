import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { inventoryService } from "@/services/inventory.service";
import { vendorService } from "@/services/vendor.service";
import { vendorPolicyService, type VendorPolicyConsentStatusDto } from "@/services/vendor-policy.service";
import { AddStoreWizardModal } from "@/components/dashboard/AddStoreWizardModal";

interface StoreFormState {
  businessName: string;
  taxId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
}

const emptyForm: StoreFormState = {
  businessName: "",
  taxId: "",
  name: "",
  address: "",
  city: "",
  country: "",
  phone: "",
  email: "",
};

const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const {
    activeStore,
    availableStores,
    setActiveStore,
    refreshStores,
    isHydrating,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddStoreWizardOpen, setIsAddStoreWizardOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [form, setForm] = useState<StoreFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [switchingStoreId, setSwitchingStoreId] = useState<string | null>(null);
  const [hoveredStoreId, setHoveredStoreId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<StoreType | null>(null);
  const [policyStatus, setPolicyStatus] = useState<VendorPolicyConsentStatusDto | null>(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);
  const [policyLoadError, setPolicyLoadError] = useState<string | null>(null);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [isAcceptingPolicies, setIsAcceptingPolicies] = useState(false);

  const stores = useMemo(() => availableStores, [availableStores]);

  const loadPolicyStatus = useCallback(async () => {
    setIsPolicyLoading(true);
    try {
      const status = await vendorPolicyService.getStatus();
      setPolicyStatus(status);
      setPolicyLoadError(null);
    } catch (error) {
      setPolicyStatus(null);
      setPolicyLoadError(error instanceof Error ? error.message : "Unable to verify the current vendor policies.");
    } finally {
      setIsPolicyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    void loadPolicyStatus();
  }, [loadPolicyStatus, user?.id]);

  const acceptCurrentPolicies = async () => {
    if (!policyStatus?.acceptance_required) return true;
    if (!policyAccepted) {
      toast.error("Please confirm that you have read and accept the current required policies.");
      return false;
    }
    setIsAcceptingPolicies(true);
    try {
      const nextStatus = await vendorPolicyService.accept(
        policyStatus.required_policies.map((policy) => ({ slug: policy.slug, version: policy.version })),
      );
      setPolicyStatus(nextStatus);
      setPolicyAccepted(false);
      setPolicyLoadError(null);
      toast.success("Your policy acceptance has been recorded.");
      return !nextStatus.acceptance_required;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to record policy acceptance.");
      return false;
    } finally {
      setIsAcceptingPolicies(false);
    }
  };

  const openAddModal = () => {
    setEditingStore(null);
    setForm(emptyForm);
    setPolicyAccepted(false);
    void loadPolicyStatus();
    // Both first-store setup and later branch creation use the same responsive wizard.
    setIsAddStoreWizardOpen(true);
  };

  const openEditModal = (store: StoreType) => {
    setEditingStore(store);
    setForm({
      businessName: "",
      taxId: "",
      name: store.name,
      address: store.address,
      city: store.city || "",
      country: store.country || "",
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
      setPolicyAccepted(false);
      setIsSaving(false);
    }
  };

  const handleOpenStore = async (store: StoreType) => {
    setSwitchingStoreId(store.id);
    toast.loading(`Switching to ${store.name}...`);
    setActiveStore(store);
    setSwitchingStoreId(null);
    toast.dismiss();
    toast.success(`Switched to ${store.name}`);
    navigate("/dashboard/store");
  };

  const handleBackToRoot = () => {
    setActiveStore(null);
    toast.success("Returned to all stores");
  };

  const handleSave = async () => {
    if (!user) return;
    const requiresProfileSetup = !editingStore && !user.businessId;
    if (requiresProfileSetup && !form.businessName.trim()) {
      toast.error("Business name is required to create your vendor profile.");
      return;
    }
    if (requiresProfileSetup && isPolicyLoading) {
      toast.error("Please wait while Printa checks the current vendor policies.");
      return;
    }
    if (requiresProfileSetup && policyLoadError) {
      toast.error("The current vendor policies could not be verified. Please retry before creating a profile.");
      return;
    }
    if (requiresProfileSetup && policyStatus?.acceptance_required && !policyAccepted) {
      toast.error("You must accept the current Vendor Terms and Privacy Notice before creating a vendor profile.");
      return;
    }
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.country.trim()) {
      toast.error("Store name, address, city, and country are required.");
      return;
    }

    let profileCreated = false;
    setIsSaving(true);
    try {
      if (requiresProfileSetup && policyStatus?.acceptance_required) {
        const accepted = await acceptCurrentPolicies();
        if (!accepted) {
          setIsSaving(false);
          return;
        }
      }
      if (requiresProfileSetup) {
        const vendor = await vendorService.onboard({
          business_name: form.businessName.trim(),
          tax_id: form.taxId.trim() || undefined,
        });
        updateUser({ businessId: vendor.id, businessName: vendor.business_name });
        profileCreated = true;
      }

      if (editingStore) {
        const payload = {
          name: form.name,
          address: form.address,
          phone: form.phone,
          email: form.email,
          city: form.city.trim(),
          country: form.country.trim(),
        };
        await inventoryService.updateStore(editingStore.id, payload);
        toast.success("Store updated.");
      } else {
        await inventoryService.createStore({
          vendor_id: user.businessId,
          name: form.name,
          address: form.address,
          city: form.city.trim(),
          country: form.country.trim(),
          phone: form.phone,
          email: form.email,
        });
        toast.success(profileCreated ? "Business profile and store created." : "Store created.");
      }
      await refreshStores();
      closeModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save store.";
      toast.error(profileCreated ? `Business profile created, but the store could not be created. ${message}` : message);
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
      await inventoryService.deleteStore(storeToDelete.id);
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
            <h1 className="dashboard-page-title">Hello <span className="text-printa-red">{user?.name || "there"}</span></h1>
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
            <span className="hidden md:inline">{user?.businessId ? "Add Store" : "Set Up Business"}</span>
          </button>
        </div>
        {user?.businessId && policyStatus?.acceptance_required && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">Action required: updated vendor policies</p>
            <p className="mt-1 text-xs leading-5 text-gray-600">Accept the current published policies before using vendor operations. Printa records the version and time of your acceptance.</p>
            <div className="mt-3 space-y-2">
              {policyStatus.required_policies.map((policy) => policy.document_url ? (
                <a key={policy.id} href={policy.document_url} className="block text-xs font-semibold text-printa-red hover:underline">
                  Read {policy.title} ({policy.version})
                </a>
              ) : (
                <p key={policy.id} className="text-xs font-semibold text-gray-700">{policy.title} ({policy.version})</p>
              ))}
              <label className="flex items-start gap-2 pt-1 text-xs text-gray-700">
                <input type="checkbox" checked={policyAccepted} onChange={(event) => setPolicyAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-printa-red focus:ring-printa-red" />
                <span>I have read and agree to the current required vendor policies.</span>
              </label>
              <Button type="button" size="sm" onClick={() => void acceptCurrentPolicies()} disabled={!policyAccepted || isAcceptingPolicies}>
                {isAcceptingPolicies ? "Recording acceptance..." : "Accept current policies"}
              </Button>
            </div>
          </div>
        )}
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
          <p className="text-sm font-semibold text-gray-700">{user?.businessId ? "No stores yet" : "Complete your business setup"}</p>
          <p className="text-xs text-gray-500 mt-1">
            {user?.businessId
              ? "Add your first store to get started"
              : "Create your vendor profile and first store with durable Printa records."}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-printa-red px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95"
            onClick={openAddModal}
          >
            <Plus size={14} />
            {user?.businessId ? "Add Store" : "Set Up Business"}
          </button>
        </motion.div>
      )}

      <AddStoreWizardModal
        open={isAddStoreWizardOpen}
        vendorId={user?.businessId || undefined}
        draftOwnerId={user?.id || "anonymous"}
        setupBusiness={!user?.businessId}
        onOpenChange={setIsAddStoreWizardOpen}
        onBusinessCreated={(vendor) => {
          updateUser({ businessId: vendor.id, businessName: vendor.business_name });
        }}
        policyGate={{
          loading: isPolicyLoading,
          error: policyLoadError,
          acceptanceRequired: Boolean(policyStatus?.acceptance_required),
          accepted: policyAccepted,
          onAcceptedChange: setPolicyAccepted,
          policies: policyStatus?.required_policies ?? [],
        }}
        onBeforeCreate={async () => {
          if (isPolicyLoading) {
            toast.error("Please wait while Printa checks the current vendor policies.");
            return false;
          }
          if (policyLoadError) {
            toast.error("The current vendor policies could not be verified. Please retry before creating this store.");
            return false;
          }
          if (policyStatus?.acceptance_required) {
            if (!policyAccepted) {
              toast.error("Please confirm acceptance of the current required vendor policies.");
              return false;
            }
            return acceptCurrentPolicies();
          }
          return true;
        }}
        onCreated={refreshStores}
      />

      <ResponsiveModal
        open={isModalOpen && Boolean(editingStore)}
        onOpenChange={closeModal}
        title="Edit Store"
      >
        <div className="space-y-4">
          {!editingStore && !user?.businessId && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-gray-700">
              Create your vendor profile and first store with the details you enter here. Tax ID is optional.
            </div>
          )}
          {!editingStore && !user?.businessId && (
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={form.businessName}
                onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="FastPrint Lusaka"
              />
            </div>
          )}
          {!editingStore && !user?.businessId && (
            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID (optional)</Label>
              <Input
                id="tax-id"
                value={form.taxId}
                onChange={(e) => setForm((prev) => ({ ...prev, taxId: e.target.value }))}
                placeholder="Enter your tax ID if available"
              />
            </div>
          )}
          {!editingStore && !user?.businessId && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Vendor Terms and Privacy Notice</p>
              {isPolicyLoading ? (
                <p className="mt-1 text-xs text-gray-500">Checking the current policies…</p>
              ) : policyLoadError ? (
                <p className="mt-1 text-xs text-printa-red">The current policies could not be loaded. Close this form and try again before creating your profile.</p>
              ) : policyStatus?.acceptance_required ? (
                <div className="mt-2 space-y-2">
                  {policyStatus.required_policies.map((policy) => policy.document_url ? (
                    <a key={policy.id} href={policy.document_url} className="block text-xs font-semibold text-printa-red hover:underline">
                      Read {policy.title} ({policy.version})
                    </a>
                  ) : (
                    <p key={policy.id} className="text-xs font-semibold text-gray-700">{policy.title} ({policy.version})</p>
                  ))}
                  <label className="flex items-start gap-2 pt-1 text-xs leading-5 text-gray-700">
                    <input type="checkbox" checked={policyAccepted} onChange={(event) => setPolicyAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-printa-red focus:ring-printa-red" />
                    <span>I confirm that I have read and agree to the current Vendor Terms and Vendor Privacy Notice. I understand that Printa records this affirmative acceptance.</span>
                  </label>
                </div>
              ) : (
                <p className="mt-1 text-xs leading-5 text-gray-500">No published vendor policy requires acceptance at this time. Working legal drafts are not presented as final terms.</p>
              )}
            </div>
          )}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store-city">City</Label>
              <Input
                id="store-city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Lusaka"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-country">Country</Label>
              <Input
                id="store-country"
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="Zambia"
              />
            </div>
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
              {isSaving ? "Saving..." : editingStore ? "Save Changes" : user?.businessId ? "Create Store" : "Create Profile & Store"}
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
