import { create } from 'zustand';
import { authApi } from '../api';

const TOKEN_KEY = 'sv_token';
const USER_KEY = 'sv_user';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

let bootstrapPromise = null;

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: readStoredUser(),
  initializing: Boolean(localStorage.getItem(TOKEN_KEY)),
  bootstrapped: false,

  login: async (credentials) => {
    const response = await authApi.login(credentials);
    const { token, user } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    persistUser(user);
    set({ token, user, initializing: false, bootstrapped: true });
    return response;
  },

  register: async (payload) => {
    const response = await authApi.register(payload);
    const { token, user } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    persistUser(user);
    set({ token, user, initializing: false, bootstrapped: true });
    return response;
  },

  bootstrap: async () => {
    if (get().bootstrapped) return get().user;
    if (bootstrapPromise) return bootstrapPromise;

    const token = get().token;
    if (!token) {
      set({ initializing: false, bootstrapped: true });
      return null;
    }

    set({ initializing: true });
    bootstrapPromise = (async () => {
      try {
        const response = await authApi.me();
        const user = response.data.user;
        persistUser(user);
        set({ user, initializing: false, bootstrapped: true });
        return user;
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        persistUser(null);
        set({ token: null, user: null, initializing: false, bootstrapped: true });
        return null;
      } finally {
        bootstrapPromise = null;
      }
    })();

    return bootstrapPromise;
  },

  refreshMe: async () => {
    const response = await authApi.me();
    const user = response.data.user;
    persistUser(user);
    set({ user });
    return user;
  },

  setUser: (user) => {
    persistUser(user);
    set({ user });
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    persistUser(null);
    set({ token: null, user: null, initializing: false, bootstrapped: true });
  },

  logout: async () => {
    try {
      if (get().token) await authApi.logout();
    } catch {

    } finally {
      get().clearSession();
    }
  },
}));
