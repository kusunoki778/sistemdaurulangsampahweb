import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';

/**
 * Hook akses state & aksi autentikasi Livora.
 * Wajib dipanggil di dalam <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  }
  return context;
}
