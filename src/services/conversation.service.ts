import { api, apiSessionStore } from "@/lib/api";
import { apiUrl } from "@/config/env";

export interface ConversationAttachmentDto {
  asset_id: string;
  name: string;
  content_type: string;
  size_bytes: number;
  url: string;
}

export interface ConversationMessageDto {
  id: string;
  order_id: string;
  sender_id: string;
  body: string;
  attachments?: ConversationAttachmentDto[];
  created_at: string;
  delivered_at: string;
  read_at?: string;
}

interface UploadedAssetDto {
  asset_id: string;
  name: string;
  content_type: string;
  size_bytes: number;
}

export const conversationService = {
  listMessages(orderId: string) {
    return api.get<ConversationMessageDto[]>(`/api/v1/conversations/orders/${orderId}/messages`);
  },

  sendMessage(orderId: string, body: string, assetIds: string[] = []) {
    return api.post<ConversationMessageDto>(`/api/v1/conversations/orders/${orderId}/messages`, {
      body,
      asset_ids: assetIds,
    });
  },

  async uploadAttachment(file: File): Promise<UploadedAssetDto> {
    const form = new FormData();
    form.append("file", file);
    return api.post<UploadedAssetDto>("/api/v1/assets/upload", form);
  },

  async downloadAttachment(relativeURL: string): Promise<string> {
    const headers = new Headers();
    const authorization = apiSessionStore.authHeader();
    if (authorization) headers.set("Authorization", authorization);
    const response = await fetch(apiUrl(relativeURL), { headers });
    if (!response.ok) throw new Error("Unable to load conversation attachment.");
    return URL.createObjectURL(await response.blob());
  },
};
