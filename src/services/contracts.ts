export type ISODateString = string;
export type UUID = string;

export interface ApiList<T> {
  total: number;
  [key: string]: T[] | number;
}

export interface UserDto {
  id: UUID;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  phone?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  token_type: string;
}

export interface RegisterUserRequestDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface PlatformProductDto {
  id: UUID;
  name: string;
  description?: string;
  category: string;
  base_price: number;
  currency: string;
  sku?: string;
  image_url?: string;
  is_active: boolean;
  attributes?: Record<string, unknown>;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreatePlatformProductDto {
  name: string;
  description?: string;
  category: string;
  base_price: number;
  currency: string;
  sku?: string;
  image_url?: string;
  attributes?: Record<string, unknown>;
}

export interface StoreDto {
  id: UUID;
  vendor_id: UUID;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CreateStoreDto {
  vendor_id: UUID;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface StoreStaffDto {
  id: UUID;
  store_id: UUID;
  user_id: UUID;
  role: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface VendorStoreProductDto {
  id: UUID;
  store_id: UUID;
  platform_product_id: UUID;
  vendor_price: number;
  currency: string;
  stock_quantity: number;
  is_available: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface OrderItemDto {
  id: UUID;
  order_id: UUID;
  vendor_store_product_id: UUID;
  quantity: number;
  unit_price: number;
  line_total: number;
  customisation?: Record<string, unknown>;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type OrderStatusDto =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderDto {
  id: UUID;
  store_id: UUID;
  customer_id?: UUID;
  order_number: string;
  status: OrderStatusDto;
  channel: "ONLINE" | "POS" | "KIOSK";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
  delivery_address?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  items?: OrderItemDto[];
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PlaceOrderRequestDto {
  store_id: UUID;
  customer_id?: UUID;
  channel: "ONLINE" | "POS" | "KIOSK";
  items: Array<{
    vendor_store_product_id: UUID;
    quantity: number;
    customisation?: Record<string, unknown>;
  }>;
  notes?: string;
  delivery_address?: Record<string, unknown>;
  discount?: number;
}

export interface NotificationDto {
  id: UUID;
  recipient_id: UUID;
  type: string;
  title: string;
  body: string;
  status: "UNREAD" | "READ" | "DISMISSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  metadata?: Record<string, string>;
  read_at?: ISODateString;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface NotificationListResponseDto {
  notifications: NotificationDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface UnreadCountDto {
  recipient_id: UUID;
  unread_count: number;
}

export interface CreateNotificationDto {
  recipient_id: UUID;
  type: string;
  title: string;
  body: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  metadata?: Record<string, string>;
}

export interface SendCommsRequestDto {
  channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | "IN_APP";
  recipient: string;
  recipient_id?: UUID;
  subject?: string;
  body: string;
  html_body?: string;
  metadata?: Record<string, string>;
  idempotency_key?: string;
  template_id?: string;
}

export interface SendCommsResultDto {
  log_id: UUID;
  channel: string;
  status: string;
  provider_ref?: string;
  error?: string;
}

export interface DeliveryLogDto {
  id: UUID;
  channel: string;
  recipient: string;
  recipient_id?: UUID;
  subject?: string;
  body: string;
  status: string;
  provider_ref?: string;
  error_message?: string;
  retry_count: number;
  idempotency_key?: string;
  sent_at?: ISODateString;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface DeliveryLogListResponseDto {
  logs: DeliveryLogDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface HealthResponseDto {
  service: string;
  status: string;
  database: string;
  environment: string;
  checked_at: ISODateString;
}
