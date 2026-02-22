// ──────────────────────────────────────────────
// Auth Store — Users, Sessions, Deals (localStorage)
// Roles: admin, user, tovaroved, division
// ──────────────────────────────────────────────
import { create } from 'zustand';

// ─── Types ──────────────────────────────────

export type UserRole = 'admin' | 'user' | 'tovaroved' | 'division';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  user: 'Пользователь',
  tovaroved: 'Товаровед',
  division: 'Подразделение',
};

export interface Deal {
  id: string;
  date: string;
  operation: string;
  itemType: string;
  totalWeight: string;
  purity: number;
  netWeight: string;
  totalAmount: number;
  insurance: number | null;
  margin: number | null;
  completed: boolean;
  createdBy: string;
}

export interface User {
  username: string;
  password: string;
  role: UserRole;
  group?: string;         // group name for sub-account creation
  createdAt: string;
}

export interface AuthState {
  users: User[];
  currentUser: User | null;
  deals: Deal[];

  // Auth
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // User management
  addUser: (username: string, password: string, role: UserRole, group?: string) => boolean;
  removeUser: (username: string) => void;
  changePassword: (username: string, newPassword: string) => boolean;

  // Deal actions
  addDeal: (deal: Omit<Deal, 'id' | 'date' | 'createdBy'>) => void;
  setDealCompleted: (id: string, completed: boolean) => void;
  getDealsForUser: (username: string) => Deal[];
}

// ─── Local Storage helpers ──────────────────

const LS_USERS_KEY = 'lombard_users';
const LS_DEALS_KEY = 'lombard_deals';
const LS_SESSION_KEY = 'lombard_session';

const DEFAULT_ADMIN: User = {
  username: 'Admin',
  password: 'Xonahinelline2029',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(LS_USERS_KEY);
    if (raw) {
      const users = JSON.parse(raw) as User[];
      // Ensure admin always exists
      if (!users.find((u) => u.username === 'Admin')) {
        users.unshift(DEFAULT_ADMIN);
      }
      return users;
    }
  } catch { /* ignore */ }
  const users = [DEFAULT_ADMIN];
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  return users;
}

function saveUsers(users: User[]) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

function loadDeals(): Deal[] {
  try {
    const raw = localStorage.getItem(LS_DEALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveDeals(deals: Deal[]) {
  localStorage.setItem(LS_DEALS_KEY, JSON.stringify(deals));
}

function loadSession(users: User[]): User | null {
  try {
    const raw = localStorage.getItem(LS_SESSION_KEY);
    if (raw) {
      const { username } = JSON.parse(raw);
      return users.find((u) => u.username === username) || null;
    }
  } catch { /* ignore */ }
  return null;
}

function saveSession(user: User | null) {
  if (user) {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify({ username: user.username }));
  } else {
    localStorage.removeItem(LS_SESSION_KEY);
  }
}

// ─── Store ──────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => {
  const initialUsers = loadUsers();
  const initialSession = loadSession(initialUsers);
  const initialDeals = loadDeals();

  return {
    users: initialUsers,
    currentUser: initialSession,
    deals: initialDeals,

    login: (username, password) => {
      const user = get().users.find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        set({ currentUser: user });
        saveSession(user);
        return true;
      }
      return false;
    },

    logout: () => {
      set({ currentUser: null });
      saveSession(null);
    },

    addUser: (username, password, role, group) => {
      const { users } = get();
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        return false;
      }
      const newUser: User = {
        username,
        password,
        role,
        group: group || undefined,
        createdAt: new Date().toISOString(),
      };
      const updated = [...users, newUser];
      set({ users: updated });
      saveUsers(updated);
      return true;
    },

    removeUser: (username) => {
      if (username === 'Admin') return;
      const { users } = get();
      const updated = users.filter((u) => u.username !== username);
      set({ users: updated });
      saveUsers(updated);
    },

    changePassword: (username, newPassword) => {
      const { users, currentUser } = get();
      const idx = users.findIndex((u) => u.username === username);
      if (idx === -1) return false;
      const updated = [...users];
      updated[idx] = { ...updated[idx], password: newPassword };
      set({ users: updated });
      saveUsers(updated);
      // Update current session if changing own password
      if (currentUser?.username === username) {
        set({ currentUser: updated[idx] });
      }
      return true;
    },

    addDeal: (deal) => {
      const { deals, currentUser } = get();
      const newDeal: Deal = {
        ...deal,
        id: `deal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        createdBy: currentUser?.username || 'unknown',
      };
      const updated = [newDeal, ...deals];
      set({ deals: updated });
      saveDeals(updated);
    },

    setDealCompleted: (id, completed) => {
      const { deals } = get();
      const updated = deals.map((d) => (d.id === id ? { ...d, completed } : d));
      set({ deals: updated });
      saveDeals(updated);
    },

    getDealsForUser: (username) => {
      return get().deals.filter((d) => d.createdBy === username);
    },
  };
});
