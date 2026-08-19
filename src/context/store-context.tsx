import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Store } from "@/types";
import { useAuth } from "./auth-context";
import { inventoryService } from "@/services/inventory.service";
import type { StoreDto } from "@/services/contracts";
import { loadOfflineSnapshot, offlineKeys, saveOfflineSnapshot } from "@/lib/offline-store";

const SHIFT_UNLOCK_STORAGE_PREFIX = "printa_shift_unlock_v1";

interface StoreContextValue {
  activeStore: Store | null;
  availableStores: Store[];
  isHydrating: boolean;
  setActiveStore: (store: Store | null) => void;
  refreshStores: () => Promise<void>;
  isStoreSelected: boolean;
  needsStoreSelection: boolean;
  dataSource: "live" | "offline" | "none";
  lastSyncedAt: number | null;
  isOffline: boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, setActiveStoreScope } = useAuth();
  const [activeStore, setActiveStoreState] = useState<Store | null>(null);
  const [availableStores, setAvailableStores] = useState<Store[]>([]);
  // Start in hydrating mode to avoid premature route-guard redirects
  // before persisted store context is restored.
  const [isHydrating, setIsHydrating] = useState(true);
  const [dataSource, setDataSource] = useState<"live" | "offline" | "none">("none");
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  const refreshStores = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setAvailableStores([]);
      setActiveStoreState(null);
      setActiveStoreScope(null);
      setDataSource("none");
      setLastSyncedAt(null);
      setIsHydrating(false);
      return;
    }

    setIsHydrating(true);
    try {
      const storeDtos = await inventoryService.listStores();
      const resolvedStores = Array.isArray(storeDtos)
        ? storeDtos.map((dto: StoreDto) => ({
            id: dto.id,
            name: dto.name,
            address: dto.address || "Zambia",
            phone: dto.phone || "",
            email: dto.email,
            status: dto.is_active ? "active" : "inactive",
            businessId: dto.vendor_id,
            createdAt: dto.created_at,
          }))
        : [];

      setAvailableStores(resolvedStores);
      setDataSource("live");
      const syncedAt = Date.now();
      setLastSyncedAt(syncedAt);
      void saveOfflineSnapshot(offlineKeys.stores(user.id), resolvedStores).catch(() => undefined);
      const savedId = localStorage.getItem("printa_active_store_id");
      const savedStore = savedId ? resolvedStores.find((s) => s.id === savedId) ?? null : null;
      setActiveStoreState((previousStore) => {
        if (previousStore && resolvedStores.some((store) => store.id === previousStore.id)) {
          return previousStore;
        }
        if (savedStore) return savedStore;
        if (resolvedStores.length === 1) return resolvedStores[0];
        return null;
      });
      if (resolvedStores.length === 0) localStorage.removeItem("printa_active_store_id");
    } catch {
      // Never substitute mock records for an unavailable API. Show only the last successful
      // device-local snapshot, clearly marked as offline; otherwise leave operational scope empty.
      const cached = await loadOfflineSnapshot<Store[]>(offlineKeys.stores(user.id)).catch(() => null);
      if (cached?.value && Array.isArray(cached.value)) {
        setAvailableStores(cached.value);
        setDataSource("offline");
        setLastSyncedAt(cached.savedAt);
        const savedId = localStorage.getItem("printa_active_store_id");
        const savedStore = savedId ? cached.value.find((store) => store.id === savedId) ?? null : null;
        setActiveStoreState(savedStore ?? (cached.value.length === 1 ? cached.value[0] : null));
      } else {
        setAvailableStores([]);
        setActiveStoreState(null);
        setDataSource("none");
        setLastSyncedAt(null);
        localStorage.removeItem("printa_active_store_id");
      }
    } finally {
      setIsHydrating(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    void refreshStores();
  }, [refreshStores]);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      void refreshStores();
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [refreshStores]);

  useEffect(() => {
    setActiveStoreScope(activeStore?.id ?? null);
  }, [activeStore?.id, setActiveStoreScope]);

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
      dataSource,
      lastSyncedAt,
      isOffline,
    }),
    [activeStore, availableStores, isHydrating, refreshStores, isStoreSelected, needsStoreSelection, dataSource, lastSyncedAt, isOffline]
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
