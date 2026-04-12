export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const SOCKET_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const SOCKET_NAMESPACE = "/chat";

export const TOKEN_STORAGE_KEY = "stickhere_auth_token";

export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",
} as const;

export const USER_ENDPOINTS = {
  ME: "/users/me",
  SEARCH: "/users/search",
  ONLINE: "/users/online",
} as const;
