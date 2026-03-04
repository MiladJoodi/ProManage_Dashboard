import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  globalSearchQuery: string;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  toggleSearch: () => void;
  setGlobalSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  searchOpen: false,
  globalSearchQuery: '',

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  toggleSearch: () => {
    set((state) => ({
      searchOpen: !state.searchOpen,
      globalSearchQuery: state.searchOpen ? '' : state.globalSearchQuery,
    }));
  },

  setGlobalSearchQuery: (query) => {
    set({ globalSearchQuery: query });
  },
}));
