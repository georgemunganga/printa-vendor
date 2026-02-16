import type { Permission, Store, UserRole } from "@/types";

export interface MembershipLike {
  storeId: string;
  role: UserRole;
  permissions: Permission[];
  isActive?: boolean;
}

export interface StoreAccessIdentity {
  businessId: string;
  role: UserRole;
  assignedStoreIds?: string[];
  memberships?: MembershipLike[];
}

export interface CreateStoreInput {
  businessId: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  status?: Store["status"];
}

export interface UpdateStoreInput {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: Store["status"];
}

const STORES_STORAGE_KEY = "printa_mock_stores_v1";

const DEFAULT_STORES: Store[] = [
  {
    id: "store-001",
    name: "Downtown Branch",
    address: "123 Main Street, Lusaka",
    phone: "+260 97 1234567",
    email: "downtown@printa.com",
    status: "active",
    businessId: "biz-001",
    createdAt: "2024-01-15",
  },
  {
    id: "store-002",
    name: "Northmead Branch",
    address: "456 Great East Road, Lusaka",
    phone: "+260 97 7654321",
    email: "northmead@printa.com",
    status: "active",
    businessId: "biz-001",
    createdAt: "2024-02-01",
  },
  {
    id: "store-003",
    name: "Woodlands Branch",
    address: "789 Los Angeles Boulevard, Lusaka",
    phone: "+260 97 9876543",
    email: "woodlands@printa.com",
    status: "inactive",
    businessId: "biz-001",
    createdAt: "2024-03-10",
  },
];

// Kept for compatibility with existing callers that need sync defaults (e.g. membership bootstrap).
export const MOCK_STORES: Store[] = DEFAULT_STORES;

const slugifyStoreName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getStoredStores = (): Store[] => {
  if (typeof window === "undefined") return DEFAULT_STORES;
  const raw = localStorage.getItem(STORES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(DEFAULT_STORES));
    return DEFAULT_STORES;
  }
  try {
    const parsed = JSON.parse(raw) as Store[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(DEFAULT_STORES));
      return DEFAULT_STORES;
    }
    return parsed;
  } catch {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(DEFAULT_STORES));
    return DEFAULT_STORES;
  }
};

const persistStores = (stores: Store[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
};

const generateStoreId = () =>
  `store-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export async function getStoresForUser(user: StoreAccessIdentity): Promise<Store[]> {
  const scopedStores = getStoredStores().filter((s) => s.businessId === user.businessId);

  // Owners can access every store in their business, including newly created stores.
  if (user.role === "owner") return scopedStores;

  const activeMemberships = (user.memberships ?? []).filter((m) => m.isActive !== false);
  if (activeMemberships.length > 0) {
    const allowed = new Set(activeMemberships.map((m) => m.storeId));
    return scopedStores.filter((s) => allowed.has(s.id));
  }

  const assigned = new Set(user.assignedStoreIds ?? []);
  return scopedStores.filter((s) => assigned.has(s.id));
}

export async function createStore(input: CreateStoreInput): Promise<Store> {
  const trimmedName = input.name.trim();
  const trimmedAddress = input.address.trim();
  if (!trimmedName || !trimmedAddress) {
    throw new Error("Store name and address are required.");
  }

  const nextStore: Store = {
    id: generateStoreId(),
    name: trimmedName,
    address: trimmedAddress,
    phone: input.phone?.trim() || "",
    email: input.email?.trim() || undefined,
    status: input.status ?? "active",
    businessId: input.businessId,
    createdAt: new Date().toISOString(),
  };

  const stores = getStoredStores();
  persistStores([nextStore, ...stores]);
  return nextStore;
}

export async function updateStore(storeId: string, updates: UpdateStoreInput): Promise<Store> {
  const stores = getStoredStores();
  const index = stores.findIndex((s) => s.id === storeId);
  if (index < 0) {
    throw new Error("Store not found.");
  }

  const current = stores[index];
  const next: Store = {
    ...current,
    name: updates.name?.trim() || current.name,
    address: updates.address?.trim() || current.address,
    phone: updates.phone?.trim() ?? current.phone,
    email: updates.email?.trim() || current.email,
    status: updates.status ?? current.status,
  };

  const merged = [...stores];
  merged[index] = next;
  persistStores(merged);
  return next;
}

export async function deleteStore(storeId: string): Promise<void> {
  const stores = getStoredStores();
  const filtered = stores.filter((s) => s.id !== storeId);
  if (filtered.length === stores.length) {
    throw new Error("Store not found.");
  }
  persistStores(filtered);
}

export function getStoreBySlug(slug: string): Store | null {
  const normalized = slug.trim().toLowerCase();
  const stores = getStoredStores();
  return stores.find((s) => slugifyStoreName(s.name) === normalized) ?? null;
}
