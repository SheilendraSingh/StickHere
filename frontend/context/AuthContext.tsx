"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/services/api";
import {
  getMyProfile,
  loginUser,
  logoutUser as logoutUserRequest,
  registerUser,
  updateMyProfile,
} from "@/services/authService";
import { TOKEN_STORAGE_KEY } from "@/utils/constants";
import type {
  AuthContextValue,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

const readToken = () =>
  typeof window !== "undefined"
    ? window.localStorage.getItem(TOKEN_STORAGE_KEY)
    : null;

const writeToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

const removeToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const resetSession = useCallback(() => {
    setToken(null);
    setUser(null);
    clearAuthToken();
    removeToken();
  }, []);

  const applySession = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    writeToken(nextToken);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await getMyProfile();
    setUser(profile);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      clearError();
      try {
        const response = await loginUser(payload);
        applySession(response.token, response.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to login";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applySession, clearError],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsLoading(true);
      clearError();
      try {
        const response = await registerUser(payload);
        applySession(response.token, response.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to register";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applySession, clearError],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      await logoutUserRequest();
    } catch {
      // Ignore API logout errors and still clear local session.
    } finally {
      resetSession();
      setIsLoading(false);
    }
  }, [clearError, resetSession]);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      setIsLoading(true);
      clearError();
      try {
        const updatedUser = await updateMyProfile(payload);
        setUser(updatedUser);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to update profile";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError],
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const existingToken = getAuthToken() || readToken();
      if (!existingToken) {
        if (mounted) setIsLoading(false);
        return;
      }

      setAuthToken(existingToken);
      if (mounted) setToken(existingToken);

      try {
        const profile = await getMyProfile();
        if (mounted) setUser(profile);
      } catch {
        if (mounted) resetSession();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [resetSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      error,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      clearError,
    }),
    [
      clearError,
      error,
      isLoading,
      login,
      logout,
      refreshProfile,
      register,
      token,
      updateProfile,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
