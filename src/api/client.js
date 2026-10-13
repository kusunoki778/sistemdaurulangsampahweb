/**
 * Livora Web Frontend - API Client
 * Connects to Laravel Backend API at http://127.0.0.1:8000/api
 * (Mode dev memakai path relatif '/api' yang diteruskan Vite proxy ke
 *  backend — aman dibuka dari HP di LAN yang sama.)
 *
 * Sesi admin & user dipisah menjadi dua penyimpanan token berbeda:
 *  - livora_admin_token -> khusus request area admin  (path /admin/*)
 *  - livora_user_token   -> khusus request area user   (path lainnya)
 * Scope bisa ditimpa eksplisit lewat options.scope ('admin' | 'user').
 */

// Dev: '/api' via Vite proxy (kompatibel dibuka dari HP/LAN). Produksi: alamat backend langsung.
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000/api');

const TOKEN_KEYS = {
  admin: 'livora_admin_token',
  user: 'livora_user_token',
};

/** Tentukan penyimpanan token: eksplisit > options > tebak dari path endpoint. */
function resolveScope(endpoint, options) {
  if (options.scope) return options.scope;
  return endpoint.startsWith('/admin') ? 'admin' : 'user';
}

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const scope = resolveScope(endpoint, options);
  const token = localStorage.getItem(TOKEN_KEYS[scope] || TOKEN_KEYS.user);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };
  // scope bukan bagian dari fetch config (hanya penentu token)
  delete config.scope;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.message || `Request gagal dengan status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

export { API_BASE_URL };
export default apiClient;
