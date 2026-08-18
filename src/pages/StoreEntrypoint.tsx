import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/context/store-context";
import { toast } from "sonner";

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

    const toSlug = (name: string) => name.toLowerCase().trim().replace(/\s+/g, "-");
    const storeData = availableStores.find((store) => toSlug(store.name) === normalizedName);

    if (!storeData) {
      toast.error(`Store "${storeName}" was not found or you do not have access to it`);
      navigate("/dashboard/stores");
      return;
    }

    // Set the authorized live store in context.
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
