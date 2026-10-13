import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './auth-context';
import { loginApi, registerApi, getMeApi, logoutApi } from '../api/auth';

/**
 * Sesi admin & user DISIMPAN TERPISAH (dua cookie/token berbeda, analogi
 * session_name('livora_admin') vs session_name('livora_user') pada PHP native):
 *
 *  Area USER   : livora_user_token  + livora_user   (data profil)
 *  Area ADMIN  : livora_admin_token + livora_admin  (data profil)
 *  Preferensi  : livora_active_role ('admin' | 'user') sesi yang sedang aktif
 *
 * - Login admin tidak menimpa sesi user (dan sebaliknya).
 * - Logout HANYA menghapus sesi pada role yang sedang aktif.
 * - Kedua sesi bisa valid bersamaan di browser yang sama.
 */

const STORAGE = {
  user: { token: 'livora_user_token', data: 'livora_user' },
  admin: { token: 'livora_admin_token', data: 'livora_admin' },
};
const ACTIVE_ROLE_KEY = 'livora_active_role';

/**
 * Migrasi session lama (single key: livora_token + livora_user[berisi semua role])
 * ke key per-role, supaya user yang sudah login tidak langsung keluar.
 */
function migrateLegacySession() {
  try {
    const legacyToken = localStorage.getItem('livora_token');
    const legacyDataRaw = localStorage.getItem('livora_user');

    if (legacyToken && legacyDataRaw) {
      const legacyData = JSON.parse(legacyDataRaw);
      const role = legacyData?.role === 'admin' ? 'admin' : 'user';

      if (!localStorage.getItem(STORAGE[role].token)) {
        localStorage.setItem(STORAGE[role].token, legacyToken);
      }
      if (!localStorage.getItem(STORAGE[role].data)) {
        localStorage.setItem(STORAGE[role].data, legacyDataRaw);
      }
    }

    localStorage.removeItem('livora_token');
    // legacy key 'livora_user' berisi data admin → sudah dipindah ke livora_admin
    if (legacyDataRaw) {
      try {
        const legacyData = JSON.parse(legacyDataRaw);
        if (legacyData?.role === 'admin') localStorage.removeItem('livora_user');
      } catch {
        localStorage.removeItem('livora_user');
      }
    }
  } catch {
    localStorage.removeItem('livora_token');
    localStorage.removeItem('livora_user');
  }
}

function readStoredUser(role) {
  try {
    const raw = localStorage.getItem(STORAGE[role].data);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE[role].data);
    return null;
  }
}

function persistSession(role, userData, token) {
  localStorage.setItem(STORAGE[role].data, JSON.stringify(userData));
  if (token) localStorage.setItem(STORAGE[role].token, token);
}

function clearSession(role) {
  localStorage.removeItem(STORAGE[role].data);
  localStorage.removeItem(STORAGE[role].token);
}

function hasToken(role) {
  return Boolean(localStorage.getItem(STORAGE[role].token));
}

export function AuthProvider({ children }) {
  const [sessions, setSessions] = useState(() => ({
    user: null,
    admin: null,
  }));
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validasi semua sesi tersimpan ke backend saat aplikasi dibuka.
  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      migrateLegacySession();

      const roles = ['user', 'admin'].filter((role) => hasToken(role));
      const storedActive = localStorage.getItem(ACTIVE_ROLE_KEY);

      // Isi dari storage dulu (tampilan cepat), validasi menyusul.
      const initial = { user: null, admin: null };
      roles.forEach((role) => {
        initial[role] = readStoredUser(role);
      });
      if (!cancelled) setSessions(initial);

      if (roles.length === 0) {
        localStorage.removeItem(ACTIVE_ROLE_KEY);
        if (!cancelled) {
          setActiveRole(null);
          setLoading(false);
        }
        return;
      }

      // Validasi paralel: token kedaluwarsa → sesi role itu dibersihkan.
      const results = await Promise.all(
        roles.map(async (role) => {
          try {
            const res = await getMeApi(role);
            return { role, user: res?.data?.user || null };
          } catch {
            return { role, user: null };
          }
        })
      );

      if (cancelled) return;

      const next = { user: null, admin: null };
      results.forEach(({ role, user }) => {
        if (user) {
          next[role] = user;
          persistSession(role, user);
        } else {
          clearSession(role);
        }
      });

      setSessions(next);

      const validRoles = ['user', 'admin'].filter((role) => next[role]);
      let nextActive = storedActive && next[storedActive] ? storedActive : null;
      if (!nextActive && validRoles.length > 0) nextActive = validRoles[0];

      setActiveRole(nextActive);
      if (nextActive) localStorage.setItem(ACTIVE_ROLE_KEY, nextActive);
      else localStorage.removeItem(ACTIVE_ROLE_KEY);

      setLoading(false);
    }

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const activateSession = useCallback((role) => {
    setActiveRole((prev) => {
      if (prev === role) return prev;
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
      return role;
    });
  }, []);

  const login = useCallback(async (loginInput, password) => {
    try {
      const res = await loginApi({ login: loginInput, password });
      if (res.status === 'success' && res.data) {
        const userData = res.data.user || res.data;
        const role = userData.role === 'admin' ? 'admin' : 'user';

        // Simpan ke penyimpanan role-nya sendiri (tidak menimpa sesi lain).
        persistSession(role, userData, res.data.token);
        setSessions((prev) => ({ ...prev, [role]: userData }));
        setActiveRole(role);
        localStorage.setItem(ACTIVE_ROLE_KEY, role);

        return { success: true, user: userData };
      }
      return { success: false, message: res.message || 'Login gagal' };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Login gagal. Periksa koneksi Anda.',
      };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const res = await registerApi({
        ...payload,
        // Backend memakai rule `confirmed`, jadi wajib dikirim.
        password_confirmation: payload.password,
      });

      if (res.status === 'success' && res.data) {
        const userData = res.data.user;
        persistSession('user', userData, res.data.token);
        setSessions((prev) => ({ ...prev, user: userData }));
        setActiveRole('user');
        localStorage.setItem(ACTIVE_ROLE_KEY, 'user');
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || 'Pendaftaran gagal' };
    } catch (err) {
      const errors = err?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        return { success: false, message: errors[firstKey][0] };
      }
      return { success: false, message: err.message || 'Pendaftaran gagal' };
    }
  }, []);

  // Logout HANYA untuk sesi yang sedang aktif (admin logout ≠ user logout).
  const logout = useCallback(() => {
    const role = activeRole;
    if (!role) return;

    // Cabut token di server (best effort) untuk role tsb.
    logoutApi(role).catch(() => {});

    clearSession(role);
    setSessions((prev) => ({ ...prev, [role]: null }));

    // Aktifkan sesi lain yang masih valid (kalau ada), supaya tidak kosong.
    const otherRole = role === 'admin' ? 'user' : 'admin';
    if (sessions[otherRole]) {
      setActiveRole(otherRole);
      localStorage.setItem(ACTIVE_ROLE_KEY, otherRole);
    } else {
      setActiveRole(null);
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
  }, [activeRole, sessions]);

  // Muat ulang profil sesi yang sedang aktif.
  const refreshUser = useCallback(async () => {
    const role = activeRole;
    if (!role) return null;
    try {
      const res = await getMeApi(role);
      const freshUser = res?.data?.user;
      if (freshUser) {
        persistSession(role, freshUser);
        setSessions((prev) => ({ ...prev, [role]: freshUser }));
        return freshUser;
      }
    } catch {
      /* abaikan, data lama tetap dipakai */
    }
    return null;
  }, [activeRole]);

  const updateUser = useCallback(
    (patch) => {
      if (!activeRole) return;
      setSessions((prev) => {
        const current = prev[activeRole];
        if (!current) return prev;
        const updated = { ...current, ...patch };
        persistSession(activeRole, updated);
        return { ...prev, [activeRole]: updated };
      });
    },
    [activeRole]
  );

  // Pindah akun demo lewat login API asli (bukan akun palsu lokal).
  const switchAccount = useCallback(
    async (role = 'user') => {
      const creds =
        role === 'admin'
          ? { login: 'admin', password: 'admin123' }
          : { login: 'gonin', password: 'password123' };
      return login(creds.login, creds.password);
    },
    [login]
  );

  const user = activeRole ? sessions[activeRole] : null;
  const isAdmin = activeRole === 'admin' && Boolean(sessions.admin);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
      switchAccount,
      isAdmin,
      // Sesi tersimpan per-role (untuk guard route admin/user)
      sessions,
      activateSession,
      activeRole,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
      switchAccount,
      isAdmin,
      sessions,
      activateSession,
      activeRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
