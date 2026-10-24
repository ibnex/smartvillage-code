import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { villageApi } from '../api';
import { getErrorMessage } from '../api/client';

export const useVillageStore = create(
  persist(
    (set, get) => ({
      villages: [],
      selectedVillageId: null,
      loaded: false,
      loading: false,
      error: null,

      loadVillages: async ({ preferredVillageId = null, force = false } = {}) => {
        if (get().loading) return get().villages;
        if (get().loaded && !force) return get().villages;

        set({ loading: true, error: null });
        try {
          const response = await villageApi.list();
          const villages = response.data.villages || [];
          const current = get().selectedVillageId;
          const validCurrent =
            current && villages.some((village) => String(village._id) === String(current));
          const preferred = preferredVillageId
            ? villages.find((village) => String(village._id) === String(preferredVillageId))
            : null;
          const selectedVillageId = validCurrent
            ? current
            : preferred?._id || villages[0]?._id || null;

          set({
            villages,
            selectedVillageId,
            loaded: true,
            loading: false,
            error: null,
          });
          return villages;
        } catch (error) {
          set({ loading: false, error: getErrorMessage(error) });
          return [];
        }
      },

      selectVillage: (villageId) => set({ selectedVillageId: villageId }),

      reset: () =>
        set({
          villages: [],
          selectedVillageId: null,
          loaded: false,
          loading: false,
          error: null,
        }),
    }),
    {
      name: 'sv_village',
      partialize: (state) => ({ selectedVillageId: state.selectedVillageId }),
    }
  )
);

export const resolveVillageId = (user, selectedVillageId) => {
  if (!user) return null;
  if (user.role === 'Village Officer') {
    return user.villageId?._id || user.villageId || null;
  }
  return selectedVillageId || user.villageId?._id || user.villageId || null;
};
