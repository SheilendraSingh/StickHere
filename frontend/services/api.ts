import axios, { AxiosHeaders, type AxiosError, type AxiosInstance } from "axios";
import { API_BASE_URL, TOKEN_STORAGE_KEY } from "@/utils/constants";

let inMemoryToken: string | null = null;

const canUseStorage = () => typeof window !== "undefined";

const readTokenFromStorage = () => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

const writeTokenToStorage = (token: string) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

const removeTokenFromStorage = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

if (canUseStorage()) {
  inMemoryToken = readTokenFromStorage();
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = inMemoryToken || readTokenFromStorage();
  if (!token) return config;

  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
  return config;
});

export const setAuthToken = (token: string) => {
  inMemoryToken = token;
  writeTokenToStorage(token);
};

export const clearAuthToken = () => {
  inMemoryToken = null;
  removeTokenFromStorage();
};

export const getAuthToken = () => inMemoryToken || readTokenFromStorage();

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; debug?: string }>;
    const apiMessage = axiosError.response?.data?.message;
    const apiDebug = axiosError.response?.data?.debug;

    if (apiMessage) {
      if (process.env.NODE_ENV !== "production" && apiDebug) {
        return `${apiMessage} (${apiDebug})`;
      }
      return apiMessage;
    }

    return axiosError.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default api;
