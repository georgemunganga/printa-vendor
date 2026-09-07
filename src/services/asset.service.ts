import { apiUrl } from "@/config/env";
import { apiSessionStore } from "@/lib/api";

export const assetService = {
  async loadObjectUrl(relativeUrl: string): Promise<string> {
    const headers = new Headers();
    const authorization = apiSessionStore.authHeader();
    if (authorization) headers.set("Authorization", authorization);
    const response = await fetch(apiUrl(relativeUrl), { headers });
    if (!response.ok) throw new Error("Unable to load the production artwork.");
    return URL.createObjectURL(await response.blob());
  },

  async open(relativeUrl: string): Promise<void> {
    const objectUrl = await this.loadObjectUrl(relativeUrl);
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  },
};
