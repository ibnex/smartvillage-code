import { useAuthStore } from '../store/authStore';
import { resolveVillageId, useVillageStore } from '../store/villageStore';






export const useActiveVillage = () => {
  const user = useAuthStore((state) => state.user);
  const villages = useVillageStore((state) => state.villages);
  const selectedVillageId = useVillageStore((state) => state.selectedVillageId);
  const loading = useVillageStore((state) => state.loading);
  const loaded = useVillageStore((state) => state.loaded);
  const error = useVillageStore((state) => state.error);
  const selectVillage = useVillageStore((state) => state.selectVillage);
  const loadVillages = useVillageStore((state) => state.loadVillages);

  const villageId = resolveVillageId(user, selectedVillageId);
  const activeVillage =
    villages.find((village) => String(village._id) === String(villageId)) ||
    (typeof user?.villageId === 'object' && user?.villageId &&
    String(user.villageId._id) === String(villageId)
      ? user.villageId
      : null);

  return {
    user,
    villages,
    villageId,
    activeVillage,
    loading,
    loaded,
    error,
    selectVillage,
    reload: () =>
      loadVillages({
        force: true,
        preferredVillageId: user?.villageId?._id || user?.villageId || null,
      }),
  };
};
