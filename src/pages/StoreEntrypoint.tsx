import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/context/store-context";
import { toast } from "sonner";
import { getStoreBySlug } from "@/mock-api/stores";

/**
 * Store Entrypoint - Handles direct store access via URL
 * Examples:
 * - localhost:8080/downtown-branch → redirect to shift management for Downtown Branch
 * - localhost:8080/northmead-branch → redirect to shift management for Northmead Branch
 */
export const StoreEntrypoint: React.FC = () => {
  const { storeName } = useParams<{ storeName: string }>();
  const navigate = useNavigate();
  const { setActiveStore, availableStores, isHydrating } = useStore();

  useEffect(() => {
    if (isHydrating) return;

    if (!storeName) {
      navigate("/login");
      return;
    }

    // Normalize store name (convert to lowercase, replace spaces with hyphens)
    const normalizedName = storeName.toLowerCase().trim();

    // Look up store by slug from mock API layer
    const storeData = getStoreBySlug(normalizedName);

    if (!storeData) {
      toast.error(`Store "${storeName}" not found`);
      navigate("/dashboard/stores");
      return;
    }

    if (availableStores.length > 0 && !availableStores.some((s) => s.id === storeData.id)) {
      toast.error("You do not have access to this store");
      navigate("/dashboard/stores");
      return;
    }

    // Set the store in context
    setActiveStore(storeData);

    // Redirect to dashboard; global store-lock overlay will request PIN entry.
    toast.success(`Welcome to ${storeData.name}`);
    navigate("/dashboard");
  }, [storeName, navigate, setActiveStore, availableStores, isHydrating]);

  // Show loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-printa-red rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading store...</p>
      </div>
    </div>
  );
};
