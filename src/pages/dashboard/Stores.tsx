import React, { useState } from "react";
import {
  BookOpen,
  Camera,
  Car,
  CreditCard,
  Edit3,
  FileText,
  Flag,
  Gift,
  MapPin,
  Minus,
  Newspaper,
  Package,
  Plus,
  Shirt,
  Store,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── Shared data (categories + employees) ─── */

interface ServiceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const serviceCategories: ServiceCategory[] = [
  { id: "s1", name: "Paper Printing", icon: FileText, color: "text-red-600", bg: "bg-red-50" },
  { id: "s2", name: "Cards & Stationery", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "s3", name: "Periodicals", icon: Newspaper, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "s4", name: "Books & Binding", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "s5", name: "Apparel & Fabric", icon: Shirt, color: "text-green-600", bg: "bg-green-50" },
  { id: "s6", name: "Promotional Items", icon: Gift, color: "text-pink-600", bg: "bg-pink-50" },
  { id: "s7", name: "Large Format", icon: Flag, color: "text-orange-600", bg: "bg-orange-50" },
  { id: "s8", name: "Stickers & Labels", icon: Tag, color: "text-teal-600", bg: "bg-teal-50" },
  { id: "s9", name: "Vinyl & Wraps", icon: Car, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "s10", name: "Packaging", icon: Package, color: "text-rose-600", bg: "bg-rose-50" },
  { id: "s11", name: "Photo Printing", icon: Camera, color: "text-cyan-600", bg: "bg-cyan-50" },
];

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const employees: Employee[] = [
  { id: "me", name: "Myself (Owner)", role: "Owner", avatar: "ME" },
  { id: "e1", name: "Leslie K.", role: "Cashier", avatar: "LK" },
  { id: "e2", name: "Cameron W.", role: "Operator", avatar: "CW" },
  { id: "e3", name: "Jacob J.", role: "Supervisor", avatar: "JJ" },
];

const avatarColors = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100 text-purple-600",
];

/* ─── Store type ─── */

interface StoreData {
  id: string;
  name: string;
  address: string;
  categoryIds: string[];
  employeeIds: string[];
  createdAt: Date;
}

const INITIAL_STORES: StoreData[] = [
  {
    id: "store-1",
    name: "Downtown Stationery",
    address: "34 Kimathi St, Nairobi",
    categoryIds: ["s1", "s2", "s4", "s8"],
    employeeIds: ["me", "e1"],
    createdAt: new Date("2025-11-15"),
  },
  {
    id: "store-2",
    name: "Westlands Print Hub",
    address: "12 Waiyaki Way, Westlands",
    categoryIds: ["s1", "s5", "s6", "s7", "s9", "s11"],
    employeeIds: ["me", "e2", "e3"],
    createdAt: new Date("2026-01-05"),
  },
];

/* ─── Wizard form state ─── */

interface WizardForm {
  name: string;
  address: string;
  categoryIds: string[];
  employeeIds: string[];
}

const emptyForm: WizardForm = {
  name: "",
  address: "",
  categoryIds: [],
  employeeIds: ["me"],
};

/* ─── Main Page ─── */

const StoresPage: React.FC = () => {
  const [stores, setStores] = useState<StoreData[]>(INITIAL_STORES);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<WizardForm>(emptyForm);

  const isEditing = editingStoreId !== null;

  const resetWizard = () => {
    setForm(emptyForm);
    setWizardStep(1);
    setEditingStoreId(null);
  };

  const openAddWizard = () => {
    resetWizard();
    setIsWizardOpen(true);
  };

  const openEditWizard = (store: StoreData) => {
    setForm({
      name: store.name,
      address: store.address,
      categoryIds: [...store.categoryIds],
      employeeIds: [...store.employeeIds],
    });
    setEditingStoreId(store.id);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleWizardClose = (open: boolean) => {
    if (!open) {
      setIsWizardOpen(false);
      resetWizard();
    }
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.address.trim()) {
      toast.error("Store name and address are required");
      return;
    }

    if (isEditing) {
      setStores((prev) =>
        prev.map((s) =>
          s.id === editingStoreId
            ? { ...s, name: form.name, address: form.address, categoryIds: form.categoryIds, employeeIds: form.employeeIds }
            : s
        )
      );
      toast.success("Store updated");
    } else {
      const newStore: StoreData = {
        id: `store-${Date.now()}`,
        name: form.name,
        address: form.address,
        categoryIds: form.categoryIds,
        employeeIds: form.employeeIds,
        createdAt: new Date(),
      };
      setStores((prev) => [...prev, newStore]);
      toast.success("Store created");
    }
    setIsWizardOpen(false);
    resetWizard();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;
    setStores((prev) => prev.filter((s) => s.id !== id));
    toast.success("Store deleted");
  };

  const toggleCategory = (catId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter((c) => c !== catId)
        : [...prev.categoryIds, catId],
    }));
  };

  const toggleEmployee = (empId: string) => {
    setForm((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(empId)
        ? prev.employeeIds.filter((e) => e !== empId)
        : [...prev.employeeIds, empId],
    }));
  };

  const catMap = Object.fromEntries(serviceCategories.map((c) => [c.id, c]));

  const canGoToStep2 = form.name.trim().length > 0 && form.address.trim().length > 0;

  /* ─── Wizard step titles ─── */
  const stepTitles: Record<number, string> = {
    1: "Store Details",
    2: "Services Offered",
    3: "Assign Employees",
  };

  return (
    <DashboardLayout pageTitle="Stores">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="dashboard-page-title">My Stores</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {stores.length} {stores.length === 1 ? "store" : "stores"} registered
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-printa-red px-3 py-2 md:px-4 text-xs md:text-sm font-semibold text-white shadow-sm transition active:scale-95"
            onClick={openAddWizard}
          >
            <Plus size={16} />
            <span className="hidden md:inline">Add Store</span>
          </button>
        </div>
      </div>

      {/* ── Store grid ── */}
      {stores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {stores.map((store, index) => {
            const cats = store.categoryIds.map((id) => catMap[id]).filter(Boolean);
            const visibleCats = cats.slice(0, 5);
            const extraCats = cats.length - 5;
            const empCount = store.employeeIds.length;

            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 md:p-5">
                  {/* Store icon + name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-printa-red text-white flex-shrink-0">
                      <Store size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm md:text-base font-semibold text-gray-900 truncate">{store.name}</h2>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-500 truncate">{store.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Service category pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {visibleCats.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <span
                          key={cat.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cat.bg} ${cat.color}`}
                        >
                          <Icon size={10} />
                          {cat.name}
                        </span>
                      );
                    })}
                    {extraCats > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                        +{extraCats} more
                      </span>
                    )}
                  </div>

                  {/* Employee count */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users size={12} />
                    <span>{empCount} {empCount === 1 ? "employee" : "employees"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    onClick={() => openEditWizard(store)}
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                    onClick={() => handleDelete(store.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
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
            onClick={openAddWizard}
          >
            <Plus size={14} />
            Add Store
          </button>
        </motion.div>
      )}

      {/* ── Setup Wizard Modal ── */}
      <ResponsiveModal
        open={isWizardOpen}
        onOpenChange={handleWizardClose}
        title={
          <span className="flex items-center gap-2">
            <Store size={20} className="text-printa-red" />
            {isEditing ? "Edit Store" : "New Store Setup"}
          </span>
        }
        description={`Step ${wizardStep} of 3 — ${stepTitles[wizardStep]}`}
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step <= wizardStep ? "bg-printa-red" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Store Details */}
        {wizardStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name" className="text-sm font-medium">Store Name</Label>
              <Input
                id="store-name"
                placeholder="e.g., Downtown Stationery"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address" className="text-sm font-medium">Address</Label>
              <Input
                id="store-address"
                placeholder="e.g., 34 Kimathi St, Nairobi"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setWizardStep(2)}
                disabled={!canGoToStep2}
                className="rounded-xl"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Services */}
        {wizardStep === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Select the service categories this store offers</p>
            <div className="grid grid-cols-2 gap-2">
              {serviceCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = form.categoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "border-printa-red bg-printa-red/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? "text-printa-red" : "text-gray-600"}`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setWizardStep(1)} className="rounded-xl">
                Back
              </Button>
              <Button onClick={() => setWizardStep(3)} className="rounded-xl">
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Employees */}
        {wizardStep === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Assign employees who work at this store</p>
            <div className="space-y-2">
              {employees.map((emp, index) => {
                const isSelected = form.employeeIds.includes(emp.id);
                const colorClass = avatarColors[index % avatarColors.length];
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleEmployee(emp.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "border-printa-red bg-printa-red/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                      <p className="text-[11px] text-gray-400">{emp.role}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "border-printa-red bg-printa-red" : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setWizardStep(2)} className="rounded-xl">
                Back
              </Button>
              <Button onClick={handleSave} className="rounded-xl">
                {isEditing ? "Save Changes" : "Create Store"}
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default StoresPage;
