import { createContext } from 'react';

/**
 * Context autentikasi Livora.
 * Dipisah dari komponen AuthProvider agar setiap file hanya memuat
 * satu jenis export (aturan react-refresh / fast refresh).
 * Namanya pakai tanda hubung agar tidak bentrok case-insensitive
 * dengan AuthContext.jsx di filesystem Windows.
 */
export const AuthContext = createContext(null);
