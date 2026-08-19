import Dexie, { type Table } from "dexie";

interface CachedSnapshot {
  key: string;
  value: unknown;
  savedAt: number;
}

interface SavedDraft {
  key: string;
  value: unknown;
  savedAt: number;
}

class PrintaOfflineStore extends Dexie {
  snapshots!: Table<CachedSnapshot, string>;
  drafts!: Table<SavedDraft, string>;

  constructor() {
    super("printa_vendor_offline_v1");
    this.version(1).stores({
      snapshots: "key, savedAt",
      drafts: "key, savedAt",
    });
  }
}

const db = new PrintaOfflineStore();

export const offlineKeys = {
  stores: (userID: string) => `stores:${userID}`,
  addStoreDraft: (userID: string) => `add-store-draft:${userID}`,
};

export async function saveOfflineSnapshot<T>(key: string, value: T): Promise<void> {
  await db.snapshots.put({ key, value, savedAt: Date.now() });
}

export async function loadOfflineSnapshot<T>(key: string): Promise<{ value: T; savedAt: number } | null> {
  const record = await db.snapshots.get(key);
  if (!record) return null;
  return { value: record.value as T, savedAt: record.savedAt };
}

export async function saveOfflineDraft<T>(key: string, value: T): Promise<void> {
  await db.drafts.put({ key, value, savedAt: Date.now() });
}

export async function loadOfflineDraft<T>(key: string): Promise<{ value: T; savedAt: number } | null> {
  const record = await db.drafts.get(key);
  if (!record) return null;
  return { value: record.value as T, savedAt: record.savedAt };
}

export async function clearOfflineDraft(key: string): Promise<void> {
  await db.drafts.delete(key);
}
