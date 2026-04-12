export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  state?: string;
  city?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string | null;
}
