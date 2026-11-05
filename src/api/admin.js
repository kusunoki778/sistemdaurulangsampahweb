import { apiClient, toRequestBody } from './client';

/** Ubah respons paginasi Laravel menjadi array biasa. */
function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

/* --------------------------- Normalisasi status --------------------------- */
/* Backend memakai status lowercase; UI admin memakai label Title Case. */

const SETOR_STATUS_TO_UI = {
  pending: 'Pending',
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  approved: 'Diterima',
  rejected: 'Ditolak',
};

const REWARD_STATUS_TO_UI = {
  pending: 'Pending',
  siap_diambil: 'Siap Diambil',
  diproses: 'Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  kedaluwarsa: 'Kedaluwarsa',
  dibatalkan: 'Dibatalkan',
};

function normalizeSetor(item) {
  return {
    ...item,
    status_mentah: item.status,
    status: SETOR_STATUS_TO_UI[item.status] || item.status,
  };
}

function normalizeReward(item) {
  return {
    ...item,
    status_mentah: item.status,
    status: REWARD_STATUS_TO_UI[item.status] || item.status,
  };
}

/* ------------------------------- Dashboard ------------------------------- */

export async function getAdminStatsApi() {
  const res = await apiClient('/admin/stats');
  return res.data;
}

export async function getAdminUsersApi(params = {}) {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  const res = await apiClient(`/admin/users${qs ? `?${qs}` : ''}`);
  return unwrap(res.data);
}

/* --------------------------- Verifikasi Setor ---------------------------- */

/**
 * Daftar transaksi setor. `params` boleh string status (kompatibilitas lama)
 * atau objek { status, search }.
 */
export async function getAdminSetorSampahApi(params = '') {
  const options = typeof params === 'string' ? { status: params } : params;
  const query = new URLSearchParams();
  if (options.status) query.set('status', options.status);
  if (options.search) query.set('search', options.search);

  const qs = query.toString();
  const res = await apiClient(`/admin/transaksi-setor${qs ? `?${qs}` : ''}`);
  return unwrap(res.data).map(normalizeSetor);
}

/**
 * Admin membuat transaksi setor langsung di drop point.
 * Body: { user_id, items: [{ jenis_sampah_id, jumlah }], catatan? }
 * Respons berisi transaksi + QR sesi (token hanya muncul sekali di sini).
 */
export async function createAdminSetorApi(data) {
  return await apiClient('/admin/transaksi-setor', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Terbitkan QR baru; token lama otomatis tidak berlaku. */
export async function reissueSetorQrApi(id) {
  return await apiClient(`/admin/transaksi-setor/${id}/qr`, { method: 'POST' });
}

/** Fallback: cairkan koin tanpa konfirmasi QR user. */
export async function selesaikanSetorApi(id) {
  return await apiClient(`/admin/transaksi-setor/${id}/selesaikan`, { method: 'POST' });
}

/** Batalkan transaksi sebelum koin dicairkan. */
export async function batalkanSetorApi(id, catatan) {
  return await apiClient(`/admin/transaksi-setor/${id}/batalkan`, {
    method: 'POST',
    body: JSON.stringify({ catatan }),
  });
}

/* -------------------------- Verifikasi Reward ---------------------------- */

/**
 * Daftar permintaan tukar reward. `params` boleh string status (kompatibilitas
 * lama) atau objek { status, search, tipe }.
 */
export async function getAdminRewardsApi(params = '') {
  const options = typeof params === 'string' ? { status: params } : params;
  const query = new URLSearchParams();
  if (options.status) query.set('status', options.status);
  if (options.search) query.set('search', options.search);
  if (options.tipe) query.set('tipe', options.tipe);

  const qs = query.toString();
  const res = await apiClient(`/admin/permintaan-reward${qs ? `?${qs}` : ''}`);
  return unwrap(res.data).map(normalizeReward);
}

/** Admin mencari kupon berdasarkan kode (mis. LV-ABCD-2345). */
export async function getAdminRewardKuponApi(kode) {
  const res = await apiClient(`/admin/permintaan-reward/kupon/${encodeURIComponent(String(kode).trim())}`);
  return normalizeReward(res.data);
}

/**
 * Terbitkan QR pickup untuk kupon reward fisik.
 * Respons: { permintaan, qr: { token, payload, expires_at, expires_in } }.
 */
export async function terbitkanRewardQrApi(id) {
  const res = await apiClient(`/admin/permintaan-reward/${id}/qr`, { method: 'POST' });
  return {
    message: res.message,
    permintaan: normalizeReward(res.data.permintaan),
    qr: res.data.qr,
  };
}

/**
 * Selesaikan reward digital/legacy tanpa QR.
 * Reward fisik baru (punya hold koin) wajib lewat QR pickup.
 */
export async function selesaikanRewardApi(id, catatan = '') {
  const res = await apiClient(`/admin/permintaan-reward/${id}/selesai`, {
    method: 'POST',
    body: JSON.stringify({ catatan_admin: catatan }),
  });
  return { ...res, data: normalizeReward(res.data) };
}

/** Batalkan kupon: lepas hold koin (atau refund legacy) + kembalikan stok. */
export async function batalkanRewardApi(id, catatan) {
  const res = await apiClient(`/admin/permintaan-reward/${id}/batalkan`, {
    method: 'POST',
    body: JSON.stringify({ catatan_admin: catatan }),
  });
  return { ...res, data: normalizeReward(res.data) };
}

/** Pengaturan masa berlaku kupon (hari). */
export async function getRewardPengaturanApi() {
  const res = await apiClient('/admin/permintaan-reward/pengaturan');
  return res.data;
}

export async function updateRewardPengaturanApi(masaBerlakuHari) {
  return await apiClient('/admin/permintaan-reward/pengaturan', {
    method: 'PUT',
    body: JSON.stringify({ masa_berlaku_hari: masaBerlakuHari }),
  });
}

/* ------------------------------ Pesan Kontak ----------------------------- */

const PESAN_STATUS_TO_UI = {
  unread: 'Belum Dibaca',
  read: 'Dibaca',
  replied: 'Dibalas',
};

export async function getAdminPesanApi() {
  const res = await apiClient('/admin/pesan-kontak');
  return unwrap(res.data).map((p) => ({
    ...p,
    status_baca: PESAN_STATUS_TO_UI[p.status] || p.status,
  }));
}

export async function markPesanReadApi(id) {
  return await apiClient(`/admin/pesan-kontak/${id}/read`, { method: 'POST' });
}

export async function deletePesanApi(id) {
  return await apiClient(`/admin/pesan-kontak/${id}`, { method: 'DELETE' });
}

/* ----------------------------- Master Data ----------------------------- */
/* (Fase 2 CMS) Endpoint CRUD sudah tersedia di backend (middleware admin). */

// Kategori Sampah
export async function getAdminKategoriApi() {
  const res = await apiClient('/admin/kategori-sampah');
  return unwrap(res.data);
}

export async function createKategoriApi(data) {
  return await apiClient('/admin/kategori-sampah', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateKategoriApi(id, data) {
  return await apiClient(`/admin/kategori-sampah/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteKategoriApi(id) {
  return await apiClient(`/admin/kategori-sampah/${id}`, { method: 'DELETE' });
}

// Jenis Sampah
export async function getAdminJenisApi() {
  const res = await apiClient('/admin/jenis-sampah');
  return unwrap(res.data);
}

export async function createJenisApi(data) {
  return await apiClient('/admin/jenis-sampah', {
    method: 'POST',
    body: toRequestBody(data),
  });
}

export async function updateJenisApi(id, data) {
  return await apiClient(`/admin/jenis-sampah/${id}`, {
    method: 'PUT',
    body: toRequestBody(data),
  });
}

export async function deleteJenisApi(id) {
  return await apiClient(`/admin/jenis-sampah/${id}`, { method: 'DELETE' });
}

// Katalog Reward (master data reward, BUKAN permintaan tukar member)
export async function getAdminKatalogRewardApi() {
  const res = await apiClient('/admin/rewards');
  return unwrap(res.data);
}

export async function createKatalogRewardApi(data) {
  return await apiClient('/admin/rewards', {
    method: 'POST',
    body: toRequestBody(data),
  });
}

export async function updateKatalogRewardApi(id, data) {
  return await apiClient(`/admin/rewards/${id}`, {
    method: 'PUT',
    body: toRequestBody(data),
  });
}

export async function deleteKatalogRewardApi(id) {
  return await apiClient(`/admin/rewards/${id}`, { method: 'DELETE' });
}

/* ----------------------------- Gamifikasi ------------------------------ */

// Kuis Harian
export async function getAdminKuisApi() {
  const res = await apiClient('/admin/quizzes');
  return unwrap(res.data);
}

export async function createKuisApi(data) {
  return await apiClient('/admin/quizzes', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateKuisApi(id, data) {
  return await apiClient(`/admin/quizzes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteKuisApi(id) {
  return await apiClient(`/admin/quizzes/${id}`, { method: 'DELETE' });
}

// Misi (daily / weekly)
export async function getAdminMisiApi() {
  const res = await apiClient('/admin/missions');
  return unwrap(res.data);
}

export async function createMisiApi(data) {
  return await apiClient('/admin/missions', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMisiApi(id, data) {
  return await apiClient(`/admin/missions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMisiApi(id) {
  return await apiClient(`/admin/missions/${id}`, { method: 'DELETE' });
}
