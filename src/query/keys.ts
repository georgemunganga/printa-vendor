export const queryKeys = {
  health: ["health"] as const,
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
  },
  catalog: {
    products: (params?: unknown) => ["catalog", "products", params ?? {}] as const,
    product: (id: string) => ["catalog", "products", id] as const,
  },
  inventory: {
    stores: (vendorId?: string) => ["inventory", "stores", vendorId ?? "all"] as const,
    store: (id: string) => ["inventory", "stores", id] as const,
    storeStaff: (storeId: string) => ["inventory", "stores", storeId, "staff"] as const,
    storeProducts: (storeId: string) => ["inventory", "stores", storeId, "products"] as const,
  },
  orders: {
    detail: (id: string) => ["orders", id] as const,
    number: (orderNumber: string) => ["orders", "number", orderNumber] as const,
    store: (storeId: string, status?: string) => ["orders", "store", storeId, status ?? "all"] as const,
    customer: (customerId: string) => ["orders", "customer", customerId] as const,
  },
  notifications: {
    list: (params?: unknown) => ["notifications", "list", params ?? {}] as const,
    unreadCount: ["notifications", "unread-count"] as const,
    detail: (id: string) => ["notifications", id] as const,
  },
  comms: {
    logs: (params?: unknown) => ["comms", "logs", params ?? {}] as const,
    log: (id: string) => ["comms", "logs", id] as const,
  },
};
