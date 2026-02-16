export const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const DEFAULT_BUCKETS = 3;

export const isEntityInStoreScope = (
  entityId: string,
  activeStoreId: string,
  buckets = DEFAULT_BUCKETS
): boolean => {
  const storePartition = hashString(activeStoreId) % buckets;
  const entityPartition = hashString(entityId) % buckets;
  return storePartition === entityPartition;
};

export function scopeItemsByActiveStore<T extends { id: string }>(
  items: T[],
  activeStoreId: string | null | undefined,
  buckets = DEFAULT_BUCKETS
): T[] {
  if (!activeStoreId) return items;
  const scoped = items.filter((item) => isEntityInStoreScope(item.id, activeStoreId, buckets));
  return scoped.length > 0 ? scoped : items.filter((_, index) => index % buckets === 0);
}

