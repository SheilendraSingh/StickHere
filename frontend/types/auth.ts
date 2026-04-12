export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  country: string;
  state: string;
  city: string;
  bio: string;
  isOnline: boolean;
  lastSeen: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  country?: string;
  state?: string;
  city?: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  password?: string;
  country?: string;
  state?: string;
  city?: string;
  bio?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  clearError: () => void;
}
