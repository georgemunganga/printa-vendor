import { api } from "@/lib/api";

export interface ConversationMessageDto {
  id: string;
  order_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  delivered_at: string;
  read_at?: string;
}

export const conversationService = {
  listMessages(orderId: string) {
    return api.get<ConversationMessageDto[]>(`/api/v1/conversations/orders/${orderId}/messages`);
  },

  sendMessage(orderId: string, body: string) {
    return api.post<ConversationMessageDto>(`/api/v1/conversations/orders/${orderId}/messages`, { body });
  },
};
