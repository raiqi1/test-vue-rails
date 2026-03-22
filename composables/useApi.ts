export const useApi = () => {
  const config = useRuntimeConfig();
  const base = config.public.apiBase as string || "http://localhost:3001";
  const apiKey = config.public.apiKey as string;

  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) h["X-API-Key"] = apiKey;
    return h;
  };

  const get = <T>(path: string, params?: Record<string, any>) =>
    $fetch<T>(`${base}${path}`, { method: "GET", headers: buildHeaders(), params });

  const post = <T>(path: string, body: object) =>
    $fetch<T>(`${base}${path}`, { method: "POST", headers: buildHeaders(), body });

  const put = <T>(path: string, body: object) =>
    $fetch<T>(`${base}${path}`, { method: "PUT", headers: buildHeaders(), body });

  const del = (path: string) =>
    $fetch(`${base}${path}`, { method: "DELETE", headers: buildHeaders() });

  return { get, post, put, del };
};

