import { apiClient } from './client';
import { unwrapPaginated } from './waste';

/**
 * Riwayat mutasi koin (masuk / keluar) milik user yang login.
 * Endpoint backend: GET /transaksi-koin
 */
export async function getTransaksiApi(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.tipe) searchParams.append('tipe', params.tipe);
  if (params.sumber) searchParams.append('sumber', params.sumber);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const res = await apiClient(`/transaksi-koin${query}`);
  return unwrapPaginated(res.data);
}
