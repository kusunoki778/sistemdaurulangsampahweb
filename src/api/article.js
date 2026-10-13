import { apiClient } from './client';

/**
 * Artikel edukasi.
 * Backend baru: GET /artikels (list), GET /artikels/{slug}, admin: /admin/artikels
 */

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200);
}

export async function getArticlesApi(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.kategori && params.kategori !== 'Semua') {
    searchParams.append('kategori', params.kategori);
  }
  if (params.search) {
    searchParams.append('search', params.search);
  }
  searchParams.append('per_page', '50');

  const res = await apiClient(`/artikels?${searchParams.toString()}`);
  return unwrap(res.data);
}

export async function getArticleDetailApi(identifier) {
  const res = await apiClient(`/artikels/${identifier}`);
  return res.data;
}

/** Admin: daftar semua artikel (termasuk draft). */
export async function getAdminArticlesApi(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append('status', params.status);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const res = await apiClient(`/admin/artikels${query}`);
  return unwrap(res.data);
}

/**
 * Ubah payload form web (deskripsi_singkat/konten_lengkap)
 * menjadi payload backend baru (slug/isi/status).
 */
function toBackendPayload(data) {
  const isi = data.isi ?? data.konten_lengkap ?? '';
  return {
    judul: data.judul,
    slug: data.slug || slugify(data.judul),
    kategori: data.kategori,
    isi,
    gambar: data.gambar || null,
    status: data.status || 'published',
  };
}

export async function createArticleApi(data) {
  return await apiClient('/admin/artikels', {
    method: 'POST',
    body: JSON.stringify(toBackendPayload(data)),
  });
}

export async function updateArticleApi(id, data) {
  return await apiClient(`/admin/artikels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toBackendPayload(data)),
  });
}

export async function deleteArticleApi(id) {
  return await apiClient(`/admin/artikels/${id}`, {
    method: 'DELETE',
  });
}
