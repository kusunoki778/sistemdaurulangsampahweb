import { apiClient } from './client';

export async function loginApi(credentials) {
  // credentials: { login: 'admin' | 'username' | 'email', password: '...' }
  const res = await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return res;
}

export async function registerApi(data) {
  const res = await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

/**
 * Ambil profil user dari token tersimpan.
 * @param {'admin'|'user'|null} scope - token mana yang dipakai (default: user)
 */
export async function getMeApi(scope = 'user') {
  return await apiClient('/auth/me', { scope }, scope);
}

/**
 * Cabut token di server (hanya untuk sesi pada scope tsb).
 * @param {'admin'|'user'|null} scope
 */
export async function logoutApi(scope = 'user') {
  return await apiClient('/auth/logout', { method: 'POST', scope }, scope);
}

export async function updateProfileApi(data, scope = 'user') {
  // user_id diambil backend dari Bearer token, bukan dari body.
  return await apiClient(
    '/auth/profile',
    {
      method: 'POST',
      body: JSON.stringify(data),
      scope,
    },
    scope
  );
}

/** Minta tautan atur ulang password dikirim ke email (Lupa Password). */
export async function forgotPasswordApi(email) {
  return await apiClient('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** Set password baru memakai token dari email. */
export async function resetPasswordApi({ email, token, password }) {
  return await apiClient('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
      token,
      password,
      password_confirmation: password,
    }),
  });
}
