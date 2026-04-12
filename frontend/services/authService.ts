import api, { getApiErrorMessage } from "@/services/api";
import { AUTH_ENDPOINTS } from "@/utils/constants";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";

interface AuthApiEnvelope {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

const ensureUser = (payload: AuthApiEnvelope) => {
  if (!payload.user) {
    throw new Error("User data is missing in API response");
  }
  return payload.user;
};

const ensureToken = (payload: AuthApiEnvelope) => {
  if (!payload.token) {
    throw new Error("Token is missing in API response");
  }
  return payload.token;
};

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthApiEnvelope>(AUTH_ENDPOINTS.REGISTER, payload);

    return {
      token: ensureToken(data),
      user: ensureUser(data),
      message: data.message || "User registered successfully",
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to register user"));
  }
};

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthApiEnvelope>(AUTH_ENDPOINTS.LOGIN, payload);

    return {
      token: ensureToken(data),
      user: ensureUser(data),
      message: data.message || "Login successful",
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to login"));
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post(AUTH_ENDPOINTS.LOGOUT);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to logout"));
  }
};

export const getMyProfile = async (): Promise<User> => {
  try {
    const { data } = await api.get<AuthApiEnvelope>(AUTH_ENDPOINTS.PROFILE);
    return ensureUser(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to fetch profile"));
  }
};

export const updateMyProfile = async (
  payload: UpdateProfilePayload,
): Promise<User> => {
  try {
    const { data } = await api.put<AuthApiEnvelope>(AUTH_ENDPOINTS.PROFILE, payload);
    return ensureUser(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update profile"));
  }
};
