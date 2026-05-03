import { create } from "zustand";

interface SystemStore {
  activeSystem: number;
  sidebarExpanded: boolean;
  securityMode: boolean;
  setActiveSystem: (id: number) => void;
  toggleSidebar: () => void;
  toggleSecurityMode: () => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
  activeSystem: 1,
  sidebarExpanded: false,
  securityMode: false,
  setActiveSystem: (id) => set({ activeSystem: id }),
  toggleSidebar: () =>
    set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  toggleSecurityMode: () =>
    set((state) => ({ securityMode: !state.securityMode })),
}));
