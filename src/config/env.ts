const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const env = {
  apiBaseUrl: trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL?.trim() || "https://api.printa.co.zm"
  ),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "",
  isDev: import.meta.env.DEV,
};

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${env.apiBaseUrl}${normalizedPath}`;
};
