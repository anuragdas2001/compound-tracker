import axios from "axios";

export const getBaseUrl = (): string => {
  // In server runtime (e.g., Next.js functions/SSR), use the Vercel service binding
  if (typeof window === "undefined" && process.env.API_URL) {
    const internalUrl = process.env.API_URL.replace(/\/$/, "");
    return `${internalUrl}/api`;
  }

  // If a public API URL is explicitly configured in environment variables
  if (process.env.NEXT_PUBLIC_API_URL) {
    const publicUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    return publicUrl.endsWith("/api") ? publicUrl : `${publicUrl}/api`;
  }

  // In the browser under Vercel Services, requests route through the top-level rewrite on the same domain
  return "/api";
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getBaseUrl();
  }
  return config;
});