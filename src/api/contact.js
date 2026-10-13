import { apiClient } from './client';

/** Kirim pesan kontak dari landing page (publik). */
export async function sendContactMessageApi(data) {
  // Endpoint backend baru hanya menerima: nama, email, subjek, pesan.
  const payload = {
    nama: data.nama,
    email: data.email,
    subjek: data.subjek,
    pesan: data.pesan,
  };

  return await apiClient('/pesan-kontak', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
