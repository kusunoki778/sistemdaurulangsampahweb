import { apiClient } from './client';

/** Daftar jenis sampah + nilai tukar koin (backend baru: /jenis-sampah). */
export async function getNilaiTukarApi() {
  const res = await apiClient('/jenis-sampah');
  return res.data || [];
}

export async function getNilaiTukarDetailApi(id) {
  const res = await apiClient(`/jenis-sampah/${id}`);
  return res.data;
}

/** Daftar kategori sampah. */
export async function getKategoriSampahApi() {
  const res = await apiClient('/kategori-sampah');
  return res.data || [];
}

/**
 * Kalkulator koin dihitung lokal dari master jenis sampah
 * (backend baru tidak menyediakan endpoint kalkulator terpisah).
 */
export async function calculateWasteCoinsApi(nilai_tukar_id, jumlah) {
  const items = await getNilaiTukarApi();
  const item = items.find((w) => String(w.id) === String(nilai_tukar_id));
  if (!item) return null;

  const qty = Number(jumlah);
  return {
    jenis_sampah: item.jenis_sampah,
    satuan: item.satuan,
    jumlah: qty,
    koin_per_satuan: item.koin_per_satuan,
    estimasi_koin: Math.round(item.koin_per_satuan * qty),
  };
}

/** Riwayat setor sampah milik user yang login (wajib token). */
export async function getSetorHistoryApi() {
  const res = await apiClient('/transaksi-setor');
  return unwrapPaginated(res.data);
}

/**
 * Ajukan setor sampah offline (drop-off).
 * Body backend: { items: [{ jenis_sampah_id, jumlah }], catatan? }
 */
export async function submitSetorSampahApi(payload) {
  const items = payload.items || [
    { jenis_sampah_id: payload.nilai_tukar_id, jumlah: payload.jumlah },
  ];

  return await apiClient('/transaksi-setor', {
    method: 'POST',
    body: JSON.stringify({ items, catatan: payload.catatan }),
  });
}

/** Ambil array dari respons paginasi Laravel maupun array biasa. */
export function unwrapPaginated(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}
