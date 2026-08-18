import React from "react";
import { Briefcase, Home, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";

type LocationType = "home" | "work" | "other";

const LOCATION_ICONS: Record<LocationType, React.ComponentType<{ size?: number; className?: string }>> = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

const LocationsPage = () => {
  const handleUnavailable = () => {
    toast.error("Saved delivery locations are not configured for vendor accounts yet.");
  };

  return (
    <DashboardLayout pageTitle="Locations">
      <div className="space-y-4 md:mx-auto md:max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div className="dashboard-page-heading">
            <h1 className="dashboard-page-title">Saved Locations</h1>
            <p className="dashboard-page-subtitle">0 locations saved</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-printa-red px-3 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 md:px-4 md:text-sm"
            onClick={handleUnavailable}
          >
            <Plus size={16} />
            <span className="hidden md:inline">Add New</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200">
            <MapPin size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Saved delivery locations are unavailable</p>
          <p className="mt-1 text-xs text-gray-500">
            Delivery-zone and saved-location configuration has not been enabled for vendor accounts.
          </p>
          <button
            type="button"
            onClick={handleUnavailable}
            className="mt-4 text-xs font-medium text-printa-red hover:underline"
          >
            Check availability
          </button>
        </motion.div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 text-xs text-gray-500 shadow-sm">
          Addresses, default-location selection, travel estimates, and delivery-zone coverage will appear here once the
          delivery configuration service is available. No location data is stored locally in the Vendor Portal.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LocationsPage;
