const ROOT_ROUTE_PREFIXES = [
  "/dashboard/stores",
  "/dashboard/subscription",
  "/dashboard/team",
  "/dashboard/notifications",
  "/dashboard/help",
  "/dashboard/profile",
  "/dashboard/payment-methods",
  "/dashboard/support",
  "/dashboard/feedback",
];

export const isRootScopePath = (pathname: string): boolean => {
  const normalized = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
  return normalized === "/dashboard" || ROOT_ROUTE_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
};

