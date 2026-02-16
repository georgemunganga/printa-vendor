import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Store } from "@/types";
import { useAuth } from "./auth-context";
import { getStoresForUser } from "@/mock-api/stores";

const SHIFT_UNLOCK_STORAGE_PREFIX = "printa_shift_unlock_v1";

interface StoreContextValue {
  activeStore: Store | null;
  availableStores: Store[];
  isHydrating: boolean;
  setActiveStore: (store: Store | null) => void;
  refreshStores: () => Promise<void>;
  isStoreSelected: boolean;
  needsStoreSelection: boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, setActiveStoreScope } = useAuth();
  const [activeStore, setActiveStoreState] = useState<Store | null>(null);
  const [availableStores, setAvailableStores] = useState<Store[]>([]);
  // Start in hydrating mode to avoid premature route-guard redirects
  // before persisted store context is restored.
  const [isHydrating, setIsHydrating] = useState(true);

  const refreshStores = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setAvailableStores([]);
      setActiveStoreState(null);
      setActiveStoreScope(null);
      return;
    }

    setIsHydrating(true);
    try {
      const stores = await getStoresForUser(user);
      setAvailableStores(stores);
      const savedId = localStorage.getItem("printa_active_store_id");
      const savedStore = savedId ? stores.find((s) => s.id === savedId) ?? null : null;

      setActiveStoreState((prev) => {
        if (prev && stores.some((s) => s.id === prev.id)) {
          return prev;
        }
        if (savedStore) return savedStore;
        if (stores.length === 1) return stores[0];
        return null;
      });
    } finally {
      setIsHydrating(false);
    }
  }, [user, isAuthenticated, setActiveStoreScope]);

  useEffect(() => {
    void refreshStores();
  }, [refreshStores]);

  const clearStoreUnlock = (storeId: string | null | undefined) => {
    if (!storeId || !user || typeof window === "undefined") return;
    const key = `${SHIFT_UNLOCK_STORAGE_PREFIX}_${user.id}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const unlockMap = JSON.parse(raw) as Record<string, true>;
      delete unlockMap[storeId];
      sessionStorage.setItem(key, JSON.stringify(unlockMap));
    } catch {
      sessionStorage.removeItem(key);
    }
  };

  const setActiveStore = (store: Store | null) => {
    // Allow early store set while store list is still hydrating, then enforce membership once loaded.
    if (store && availableStores.length > 0 && !availableStores.some((s) => s.id === store.id)) {
      return;
    }

    // Re-lock target store on every explicit context switch so PIN overlay appears.
    if (store && (activeStore?.id ?? null) !== store.id) {
      clearStoreUnlock(store.id);
    }

    // Re-lock current store when signing out to root context.
    if (!store && activeStore?.id) {
      clearStoreUnlock(activeStore.id);
    }

    setActiveStoreState(store);
    setActiveStoreScope(store?.id ?? null);
    if (store) {
      localStorage.setItem("printa_active_store_id", store.id);
    } else {
      localStorage.removeItem("printa_active_store_id");
    }
  };

  const isStoreSelected = Boolean(activeStore);

  const needsStoreSelection =
    isAuthenticated &&
    !isStoreSelected &&
    availableStores.length > 1;

  const value = useMemo(
    () => ({
      activeStore,
      availableStores,
      isHydrating,
      setActiveStore,
      refreshStores,
      isStoreSelected,
      needsStoreSelection,
    }),
    [activeStore, availableStores, isHydrating, refreshStores, isStoreSelected, needsStoreSelection]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
