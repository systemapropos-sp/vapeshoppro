import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  currentStore: number | null;
  pausedSales: boolean;
  notifications: { id: number; title: string; message: string; type: string; read: boolean }[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setCurrentStore: (storeId: number) => void;
  setPausedSales: (paused: boolean) => void;
  addNotification: (n: Omit<UIState["notifications"][0], "id" | "read">) => void;
  markNotificationRead: (id: number) => void;
}

export const useUIStore = create<UIState>((set, _get) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  darkMode: false,
  currentStore: null,
  pausedSales: false,
  notifications: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setDarkMode: (dark) => set({ darkMode: dark }),
  setCurrentStore: (storeId) => set({ currentStore: storeId }),
  setPausedSales: (paused) => set({ pausedSales: paused }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [{ ...n, id: Date.now(), read: false }, ...s.notifications].slice(0, 50),
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
}));
