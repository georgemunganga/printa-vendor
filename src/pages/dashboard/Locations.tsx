import React, { useMemo, useState } from "react";
import {
  Briefcase,
  Edit3,
  Home,
  MapPin,
  Trash2,
  Plus,
  Check,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LocationType = "home" | "work" | "other";

interface LocationCard {
  id: string;
  type: LocationType;
  title: string;
  address: string;
  isDefault: boolean;
  distance: string;
  eta: string;
}

const LOCATION_COLORS: Record<LocationType, string> = {
  home: "bg-printa-red",
  work: "bg-printa-red",
  other: "bg-printa-red",
};

const LOCATION_ICONS: Record<LocationType, React.ComponentType<{ size?: number; className?: string }>> = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

const INITIAL_LOCATIONS: LocationCard[] = [
  {
    id: "loc-1",
    type: "home",
    title: "Home",
    address: "123 Main Street, Downtown, Nairobi",
    isDefault: true,
    distance: "1.2 km",
    eta: "7 min",
  },
  {
    id: "loc-2",
    type: "work",
    title: "Office",
    address: "456 Business Ave, Westlands",
    isDefault: false,
    distance: "3.4 km",
    eta: "12 min",
  },
  {
    id: "loc-3",
    type: "other",
    title: "University",
    address: "789 Campus Road, Nairobi",
    isDefault: false,
    distance: "4.1 km",
    eta: "15 min",
  },
];

const LocationsPage = () => {
  const [locations, setLocations] = useState<LocationCard[]>(INITIAL_LOCATIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationCard | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    type: "other" as LocationType,
  });

  const resetForm = () => {
    setFormData({ title: "", address: "", type: "other" });
  };

  const handleAddLocation = () => {
    if (!formData.title.trim() || !formData.address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const newLocation: LocationCard = {
      id: `loc-${Date.now()}`,
      type: formData.type,
      title: formData.title,
      address: formData.address,
      isDefault: locations.length === 0,
      distance: "Calculating...",
      eta: "Calculating...",
    };

    setLocations((prev) => [...prev, newLocation]);
    toast.success("Location added successfully");
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditLocation = () => {
    if (!editingLocation || !formData.title.trim() || !formData.address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === editingLocation.id
          ? { ...loc, title: formData.title, address: formData.address, type: formData.type }
          : loc
      )
    );
    toast.success("Location updated successfully");
    setEditingLocation(null);
    resetForm();
  };

  const openEditModal = (location: LocationCard) => {
    setFormData({
      title: location.title,
      address: location.address,
      type: location.type,
    });
    setEditingLocation(location);
  };

  const handleDeleteLocation = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this location?")) {
      return;
    }
    setLocations((prev) => prev.filter((location) => location.id !== id));
    toast.success("Location removed");
  };

  const handleSetDefault = (id: string) => {
    setLocations((prev) =>
      prev.map((location) => ({
        ...location,
        isDefault: location.id === id,
      }))
    );
    toast.success("Default location updated");
  };

  const locationCounts = useMemo(
    () => ({
      total: locations.length,
      defaults: locations.filter((location) => location.isDefault).length,
    }),
    [locations]
  );

  return (
    <DashboardLayout pageTitle="Locations">
      <div className="space-y-4 md:max-w-3xl md:mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="dashboard-page-heading">
            <h1 className="dashboard-page-title">Saved Locations</h1>
            <p className="dashboard-page-subtitle">
              {locationCounts.total} locations saved
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-printa-red px-3 py-2 md:px-4 text-xs md:text-sm font-semibold text-white shadow-sm transition active:scale-95"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span className="hidden md:inline">Add New</span>
          </button>
        </div>

        {/* Locations List */}
        <div className="space-y-3">
          {locations.map((location, index) => {
            const Icon = LOCATION_ICONS[location.type];
            const colorClass = LOCATION_COLORS[location.type];
            return (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Main Content */}
                <div className="p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${colorClass} text-white`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm md:text-base font-semibold text-gray-900">{location.title}</h2>
                        {location.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Check size={10} />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">{location.address}</p>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-1">
                        {location.distance} away · {location.eta} drive
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 hidden md:block" />
                  </div>
                </div>

                {/* Actions - Compact on mobile */}
                <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    onClick={() => openEditModal(location)}
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  {!location.isDefault && (
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-printa-red hover:bg-printa-red/5 transition-colors"
                      onClick={() => handleSetDefault(location.id)}
                    >
                      <MapPin size={14} />
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state hint */}
        {locations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-3">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No saved locations</p>
            <p className="text-xs text-gray-500 mt-1">Add your first location to get started</p>
          </motion.div>
        )}
      </div>

      {/* Add Location Modal */}
      <ResponsiveModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title={
          <span className="flex items-center gap-2">
            <MapPin size={20} className="text-printa-red" />
            Add New Location
          </span>
        }
        description="Save a frequently used delivery address"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Location Name</Label>
            <Input
              id="title"
              placeholder="e.g., Home, Office, University"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <Input
              id="address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location Type</Label>
            <div className="flex gap-2">
              {(["home", "work", "other"] as LocationType[]).map((type) => {
                const Icon = LOCATION_ICONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type }))}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                      formData.type === type
                        ? "border-printa-red bg-printa-red/5 text-printa-red"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-xs font-medium capitalize">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            className="bg-printa-red hover:bg-printa-red/90 rounded-xl"
            onClick={handleAddLocation}
          >
            Add Location
          </Button>
        </div>
      </ResponsiveModal>

      {/* Edit Location Modal */}
      <ResponsiveModal
        open={!!editingLocation}
        onOpenChange={(open) => !open && setEditingLocation(null)}
        title={
          <span className="flex items-center gap-2">
            <Edit3 size={20} className="text-printa-red" />
            Edit Location
          </span>
        }
        description="Update your saved location details"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-medium">Location Name</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Home, Office, University"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address" className="text-sm font-medium">Address</Label>
            <Input
              id="edit-address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location Type</Label>
            <div className="flex gap-2">
              {(["home", "work", "other"] as LocationType[]).map((type) => {
                const Icon = LOCATION_ICONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type }))}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                      formData.type === type
                        ? "border-printa-red bg-printa-red/5 text-printa-red"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-xs font-medium capitalize">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditingLocation(null)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            className="bg-printa-red hover:bg-printa-red/90 rounded-xl"
            onClick={handleEditLocation}
          >
            Save Changes
          </Button>
        </div>
      </ResponsiveModal>
    </DashboardLayout>
  );
};

export default LocationsPage;
