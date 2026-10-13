import { apiClient } from './client';

/**
 * Statistik agregat publik untuk landing page (GET /stats, tanpa login).
 * Hanya angka aman: total anggota, kg sampah, liter minyak, koin beredar.
 */
export async function getPublicStatsApi() {
  const res = await apiClient('/stats');
  return res.data || null;
}
