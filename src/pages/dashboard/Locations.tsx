import React, { useCallback, useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Power, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/context/store-context";
import { inventoryService } from "@/services/inventory.service";
import type { DeliveryZoneDto, DeliveryZoneInputDto } from "@/services/contracts";

const blankZone: DeliveryZoneInputDto = {
  name: "",
  city: "",
  country: "Zambia",
  is_active: true,
};

const LocationsPage = () => {
  const { activeStore, isHydrating } = useStore();
  const [zones, setZones] = useState<DeliveryZoneDto[]>([]);
  const [form, setForm] = useState<DeliveryZoneInputDto>(blankZone);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadZones = useCallback(async () => {
    if (!activeStore?.id) {
      setZones([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setZones(await inventoryService.listDeliveryZones(activeStore.id));
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load delivery coverage.";
      setError(message);
      setZones([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeStore?.id]);

  useEffect(() => {
    void loadZones();
  }, [loadZones]);

  const closeForm = () => {
    if (isSaving) return;
    setShowForm(false);
    setEditingZoneId(null);
    setForm(blankZone);
  };

  const openCreate = () => {
    if (!activeStore?.id) {
      toast.error("Select a store before managing delivery coverage.");
      return;
    }
    setEditingZoneId(null);
    setForm({ ...blankZone });
    setShowForm(true);
  };

  const openEdit = (zone: DeliveryZoneDto) => {
    setEditingZoneId(zone.id);
    setForm({ name: zone.name, city: zone.city, country: zone.country, is_active: zone.is_active });
    setShowForm(true);
  };

  const saveZone = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeStore?.id) return;
    setIsSaving(true);
    try {
      if (editingZoneId) {
        await inventoryService.updateDeliveryZone(activeStore.id, editingZoneId, form);
        toast.success("Delivery zone updated.");
      } else {
        await inventoryService.createDeliveryZone(activeStore.id, form);
        toast.success("Delivery zone added.");
      }
      closeForm();
      await loadZones();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save delivery coverage.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleZone = async (zone: DeliveryZoneDto) => {
    if (!activeStore?.id) return;
    try {
      await inventoryService.updateDeliveryZone(activeStore.id, zone.id, {
        name: zone.name,
        city: zone.city,
        country: zone.country,
        is_active: !zone.is_active,
      });
      await loadZones();
      toast.success(zone.is_active ? "Delivery zone paused." : "Delivery zone activated.");
    } catch (toggleError) {
      toast.error(toggleError instanceof Error ? toggleError.message : "Unable to update delivery coverage.");
    }
  };

  const deleteZone = async (zone: DeliveryZoneDto) => {
    if (!activeStore?.id || !window.confirm(`Remove ${zone.name}? This cannot be undone.`)) return;
    try {
      await inventoryService.deleteDeliveryZone(activeStore.id, zone.id);
      await loadZones();
      toast.success("Delivery zone removed.");
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Unable to remove delivery coverage.");
    }
  };

  const coverageLabel = isHydrating || isLoading ? "Loading coverage…" : `${zones.filter((zone) => zone.is_active).length} active zone${zones.filter((zone) => zone.is_active).length === 1 ? "" : "s"}`;

  return (
    <DashboardLayout pageTitle="Locations">
      <div className="space-y-4 md:mx-auto md:max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div className="dashboard-page-heading">
            <h1 className="dashboard-page-title">Delivery Coverage</h1>
            <p className="dashboard-page-subtitle">{activeStore ? coverageLabel : "Select a store to manage coverage"}</p>
          </div>
          <button type="button" className="flex items-center gap-1.5 rounded-xl bg-printa-red px-3 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 md:px-4 md:text-sm" onClick={openCreate} disabled={!activeStore?.id}>
            <Plus size={16} /><span className="hidden md:inline">Add New</span>
          </button>
        </div>

        {showForm && (
          <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={saveZone} className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-gray-900">{editingZoneId ? "Edit delivery zone" : "Add delivery zone"}</h2><p className="mt-0.5 text-xs text-gray-500">Coverage is matched by city and country only. It does not set a delivery fee or ETA.</p></div><button type="button" onClick={closeForm} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button></div>
            <div className="grid gap-3 sm:grid-cols-2"><Input aria-label="Zone name" placeholder="Zone name, e.g. Lusaka Central" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /><Input aria-label="City" placeholder="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required /></div>
            <div className="flex flex-wrap items-center justify-between gap-3"><Input aria-label="Country" className="max-w-xs" placeholder="Country" value={form.country || "Zambia"} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} required /><label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-printa-red focus:ring-printa-red" />Zone is active</label></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={closeForm} disabled={isSaving}>Cancel</Button><Button type="submit" className="bg-printa-red text-white hover:bg-printa-red/90" disabled={isSaving}>{isSaving ? "Saving…" : editingZoneId ? "Save changes" : "Save zone"}</Button></div>
          </motion.form>
        )}

        {!activeStore && !isHydrating ? <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200"><MapPin size={24} className="text-gray-400" /></div><p className="text-sm font-semibold text-gray-700">No store selected</p><p className="mt-1 text-xs text-gray-500">Choose a store to configure the cities where it offers delivery.</p></div> : error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"><p className="font-semibold">Delivery coverage is unavailable</p><p className="mt-1 text-xs">{error}</p><button type="button" onClick={() => void loadZones()} className="mt-3 text-xs font-semibold text-printa-red hover:underline">Try again</button></div> : !isLoading && activeStore && zones.length === 0 ? <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200"><MapPin size={24} className="text-gray-400" /></div><p className="text-sm font-semibold text-gray-700">No delivery zones configured</p><p className="mt-1 text-xs text-gray-500">Customers can only be marked as covered after you add an active city-level delivery zone. Fees and delivery times are not configured here.</p><button type="button" onClick={openCreate} className="mt-4 text-xs font-medium text-printa-red hover:underline">Add a delivery zone</button></motion.div> : <div className="space-y-3">{zones.map((zone) => <motion.div key={zone.id} layout className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><div className="rounded-xl bg-printa-red/10 p-2.5 text-printa-red"><MapPin size={20} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-gray-900">{zone.name}</p><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${zone.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{zone.is_active ? "Active" : "Paused"}</span></div><p className="mt-1 text-xs text-gray-500">{zone.city}, {zone.country}</p><p className="mt-1 text-xs text-gray-400">Eligibility only; no delivery fee or ETA is configured.</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => openEdit(zone)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label={`Edit ${zone.name}`}><Pencil size={16} /></button><button type="button" onClick={() => void toggleZone(zone)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label={`${zone.is_active ? "Pause" : "Activate"} ${zone.name}`}><Power size={16} /></button><button type="button" onClick={() => void deleteZone(zone)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${zone.name}`}><Trash2 size={16} /></button></div></div></motion.div>)}</div>}

        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-xs text-gray-500 shadow-sm">Customer delivery eligibility is matched against an active zone's city and country. Prices, travel estimates, driver assignment, and live tracking remain unavailable until their dedicated contracts are configured.</div>
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
