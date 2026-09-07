export interface UploadedPrintFile {
  assetId: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface PrintOrderDraft {
  category?: string;
  files: UploadedPrintFile[];
  specifications: Record<string, string>;
  notes?: string;
}

const STORAGE_KEY = "printa.print-order-draft.v1";

const emptyDraft = (): PrintOrderDraft => ({
  files: [],
  specifications: {},
});

export const readPrintOrderDraft = (): PrintOrderDraft => {
  if (typeof window === "undefined") return emptyDraft();

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null") as Partial<PrintOrderDraft> | null;
    if (!parsed) return emptyDraft();

    return {
      category: typeof parsed.category === "string" ? parsed.category : undefined,
      files: Array.isArray(parsed.files)
        ? parsed.files.filter((file): file is UploadedPrintFile => Boolean(
            file
            && typeof file.assetId === "string"
            && typeof file.name === "string"
            && typeof file.contentType === "string"
            && typeof file.sizeBytes === "number"
            && typeof file.uploadedAt === "string"
          ))
        : [],
      specifications: parsed.specifications && typeof parsed.specifications === "object"
        ? Object.fromEntries(
            Object.entries(parsed.specifications).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string"
            )
          )
        : {},
      notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
    };
  } catch {
    return emptyDraft();
  }
};

export const writePrintOrderDraft = (draft: PrintOrderDraft) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const patchPrintOrderDraft = (patch: Partial<PrintOrderDraft>) => {
  const next = { ...readPrintOrderDraft(), ...patch };
  writePrintOrderDraft(next);
  return next;
};

export const clearPrintOrderDraft = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
};
