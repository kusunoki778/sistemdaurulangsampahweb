import { apiClient } from './client';

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
  approved: 'Diterima',
  rejected: 'Ditolak',
};

const REWARD_STATUS_TO_UI = {
  pending: 'Pending',
  diproses: 'Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

function normalizeSetor(item) {
  return { ...item, status: SETOR_STATUS_TO_UI[item.status] || item.status };
}

function normalizeReward(item) {
  return { ...item, status: REWARD_STATUS_TO_UI[item.status] || item.status };
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

export async function getAdminSetorSampahApi(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await apiClient(`/admin/transaksi-setor${query}`);
  return unwrap(res.data).map(normalizeSetor);
}

/**
 * Verifikasi setor: status 'Diterima' -> approve, 'Ditolak' -> reject.
 */
export async function updateStatusSetorApi(id, status, alasan = '') {
  const endpoint =
    status === 'Diterima'
      ? `/admin/transaksi-setor/${id}/approve`
      : `/admin/transaksi-setor/${id}/reject`;

  return await apiClient(endpoint, {
    method: 'POST',
    body: JSON.stringify({ catatan: alasan }),
  });
}

/* -------------------------- Verifikasi Reward ---------------------------- */

export async function getAdminRewardsApi(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await apiClient(`/admin/permintaan-reward${query}`);
  return unwrap(res.data).map(normalizeReward);
}

/**
 * Verifikasi reward: status 'Selesai' -> selesai, 'Ditolak' -> reject (refund koin).
 */
export async function updateStatusRewardApi(id, status, catatan = '') {
  const endpoint =
    status === 'Selesai'
      ? `/admin/permintaan-reward/${id}/selesai`
      : `/admin/permintaan-reward/${id}/reject`;

  return await apiClient(endpoint, {
    method: 'POST',
    body: JSON.stringify({ catatan_admin: catatan }),
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
    body: JSON.stringify(data),
  });
}

export async function updateJenisApi(id, data) {
  return await apiClient(`/admin/jenis-sampah/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
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
    body: JSON.stringify(data),
  });
}

export async function updateKatalogRewardApi(id, data) {
  return await apiClient(`/admin/rewards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
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
