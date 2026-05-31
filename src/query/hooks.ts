import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  catalogService,
  commsService,
  healthService,
  inventoryService,
  notificationsService,
  ordersService,
  usersService,
} from "@/services";
import type {
  CreateNotificationDto,
  CreatePlatformProductDto,
  CreateStoreDto,
  LoginRequestDto,
  PlaceOrderRequestDto,
  RegisterUserRequestDto,
  SendCommsRequestDto,
} from "@/services";
import { queryKeys } from "./keys";

export const useHealthQuery = () =>
  useQuery({
    queryKey: queryKeys.health,
    queryFn: healthService.check,
  });

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (payload: LoginRequestDto) => authService.login(payload),
  });

export const useRegisterUserMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterUserRequestDto) => authService.register(payload),
  });

export const useUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.users.all,
    queryFn: usersService.list,
  });

export const useUserQuery = (id?: string) =>
  useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: () => usersService.get(id as string),
    enabled: Boolean(id),
  });

export const useCatalogProductsQuery = (params?: { category?: string; active?: boolean }) =>
  useQuery({
    queryKey: queryKeys.catalog.products(params),
    queryFn: () => catalogService.listProducts(params),
  });

export const useCatalogProductQuery = (id?: string) =>
  useQuery({
    queryKey: queryKeys.catalog.product(id ?? ""),
    queryFn: () => catalogService.getProduct(id as string),
    enabled: Boolean(id),
  });

export const useCreateCatalogProductMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlatformProductDto) => catalogService.createProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog", "products"] }),
  });
};

export const useStoresQuery = (vendorId?: string) =>
  useQuery({
    queryKey: queryKeys.inventory.stores(vendorId),
    queryFn: () => inventoryService.listStores(vendorId),
  });

export const useStoreQuery = (id?: string) =>
  useQuery({
    queryKey: queryKeys.inventory.store(id ?? ""),
    queryFn: () => inventoryService.getStore(id as string),
    enabled: Boolean(id),
  });

export const useCreateStoreMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStoreDto) => inventoryService.createStore(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory", "stores"] }),
  });
};

export const useStoreStaffQuery = (storeId?: string) =>
  useQuery({
    queryKey: queryKeys.inventory.storeStaff(storeId ?? ""),
    queryFn: () => inventoryService.listStaff(storeId as string),
    enabled: Boolean(storeId),
  });

export const useStoreProductsQuery = (storeId?: string) =>
  useQuery({
    queryKey: queryKeys.inventory.storeProducts(storeId ?? ""),
    queryFn: () => inventoryService.listProducts(storeId as string),
    enabled: Boolean(storeId),
  });

export const useStoreOrdersQuery = (storeId?: string, status?: string) =>
  useQuery({
    queryKey: queryKeys.orders.store(storeId ?? "", status),
    queryFn: () => ordersService.listByStore(storeId as string, status as never),
    enabled: Boolean(storeId),
  });

export const useOrderQuery = (id?: string) =>
  useQuery({
    queryKey: queryKeys.orders.detail(id ?? ""),
    queryFn: () => ordersService.get(id as string),
    enabled: Boolean(id),
  });

export const usePlaceOrderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: PlaceOrderRequestDto; idempotencyKey?: string }) =>
      ordersService.place(payload, idempotencyKey),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.storeProducts(order.store_id) });
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof ordersService.updateStatus>[1] }) =>
      ordersService.updateStatus(id, status),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) });
    },
  });
};

export const useNotificationsQuery = (params?: { status?: string; type?: string; limit?: number; offset?: number }) =>
  useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsService.list(params),
  });

export const useUnreadCountQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationsService.unreadCount,
  });

export const useCreateNotificationMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotificationDto) => notificationsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useMarkNotificationReadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useCommsLogsQuery = (params?: { channel?: string; recipient_id?: string; status?: string; limit?: number; offset?: number }) =>
  useQuery({
    queryKey: queryKeys.comms.logs(params),
    queryFn: () => commsService.listLogs(params),
  });

export const useSendCommsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: SendCommsRequestDto; idempotencyKey?: string }) =>
      commsService.send(payload, idempotencyKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comms", "logs"] }),
  });
};
