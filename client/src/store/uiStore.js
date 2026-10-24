import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let counter = 0;
const makeId = () => {
  counter += 1;
  return `toast-${Date.now()}-${counter}`;
};

export const useUIStore = create(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      toasts: [],

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

      addToast: ({ title, message, type = 'success', duration = 4500 }) => {
        const id = makeId();
        set((state) => ({
          toasts: [...state.toasts, { id, title, message, type }].slice(-4),
        }));
        if (duration > 0) {
          window.setTimeout(() => get().dismissToast(id), duration);
        }
        return id;
      },
      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
    }),
    {
      name: 'sv_ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

export const toast = {
  success: (message, title = 'Success') =>
    useUIStore.getState().addToast({ type: 'success', title, message }),
  error: (message, title = 'Something went wrong') =>
    useUIStore.getState().addToast({ type: 'error', title, message, duration: 6000 }),
  info: (message, title = 'Heads up') =>
    useUIStore.getState().addToast({ type: 'info', title, message }),
  warning: (message, title = 'Please review') =>
    useUIStore.getState().addToast({ type: 'warning', title, message }),
};
