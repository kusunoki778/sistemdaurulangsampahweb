import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, RefreshCw } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  getAdminArticlesApi,
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
} from '../../api/article';
import { useConfirm } from '../../hooks/useConfirm';
import AdminPageHeader from './AdminPageHeader';

/**
 * Kelola Artikel Edukasi (CMS konten /artikel) — /admin/artikel
 */
export default function KelolaArtikel({ showToast }) {
  const confirm = useConfirm();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Add / Edit
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [articleForm, setArticleForm] = useState({
    judul: '',
    kategori: 'Pemilahan Sampah',
    deskripsi_singkat: '',
    konten_lengkap: '',
    gambar: '',
  });

  const loadArticlesData = () =>
    getAdminArticlesApi()
      .then((data) => {
        setArticles(data);
        setLoading(false);
        return data;
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        return [];
      });

  useEffect(() => {
    loadArticlesData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadArticlesData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} artikel.`, 'success');
    });
  };

  const handleOpenAddArticle = () => {
    setEditingArticleId(null);
    setArticleForm({
      judul: '',
      kategori: 'Pemilahan Sampah',
      deskripsi_singkat: '',
      konten_lengkap: '',
      gambar: '',
    });
    setArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art) => {
    setEditingArticleId(art.id);
    setArticleForm({
      judul: art.judul,
      kategori: art.kategori,
      deskripsi_singkat: art.deskripsi_singkat,
      konten_lengkap: art.konten_lengkap,
      gambar: art.gambar || '',
    });
    setArticleModalOpen(true);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    try {
      if (editingArticleId) {
        await updateArticleApi(editingArticleId, articleForm);
        if (showToast) showToast('Artikel berhasil diperbarui!', 'success');
      } else {
        await createArticleApi(articleForm);
        if (showToast) showToast('Artikel baru berhasil diterbitkan!', 'success');
      }
      setArticleModalOpen(false);
      loadArticlesData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyimpan artikel', 'error');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (
      await confirm({
        title: 'Hapus artikel edukasi?',
        message: 'Artikel dihapus permanen dari halaman /artikel.',
        confirmText: 'Hapus Artikel',
        danger: true,
      })
    ) {
      try {
        await deleteArticleApi(id);
        if (showToast) showToast('Artikel berhasil dihapus.', 'success');
        loadArticlesData();
      } catch (err) {
        if (showToast) showToast(err.message || 'Gagal menghapus artikel', 'error');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Konten & Edukasi', variant: 'blue' }]}
        title="Kelola Artikel Edukasi"
        subtitle="Kelola konten edukasi pemilahan sampah dan artikel panduan lingkungan yang tampil di halaman /artikel."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw size={14} />}
          >
            Segarkan Data
          </Button>
        }
      />

      <div className="container" style={{ marginTop: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              Daftar Artikel Edukasi
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {articles.length} artikel terdaftar di CMS Livora
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenAddArticle} leftIcon={<Plus size={18} />}>
            Tambah Artikel Baru
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat artikel...
          </div>
        ) : articles.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              color: '#64748b',
            }}
          >
            Belum ada artikel. Klik &quot;Tambah Artikel Baru&quot; untuk menerbitkan konten
            pertama.
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '14px 20px' }}>Judul Artikel</th>
                  <th style={{ padding: '14px 16px' }}>Kategori</th>
                  <th style={{ padding: '14px 16px' }}>Penulis</th>
                  <th style={{ padding: '14px 16px' }}>Tanggal Publikasi</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td
                      style={{
                        padding: '14px 20px',
                        fontWeight: '700',
                        color: '#0f172a',
                        maxWidth: '340px',
                      }}
                    >
                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {art.judul}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant="green" size="sm">
                        {art.kategori}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {art.author?.name?.split(' ')[0] || 'Admin'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {formatDate(art.tanggal_publikasi)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEditArticle(art)}
                          leftIcon={<Edit3 size={14} />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteArticle(art.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Artikel */}
      <Modal
        isOpen={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        title={editingArticleId ? 'Edit Artikel Edukasi' : 'Tulis Artikel Edukasi Baru'}
        subtitle="Publikasikan wawasan baru mengenai pemilahan dan daur ulang sampah"
        maxWidth="640px"
      >
        <form onSubmit={handleSaveArticle}>
          <Input
            label="Judul Artikel"
            value={articleForm.judul}
            onChange={(e) => setArticleForm({ ...articleForm, judul: e.target.value })}
            placeholder="Contoh: 5 Cara Memanfaatkan Kardus Bekas di Rumah"
            required
          />

          <Input
            label="Kategori"
            type="select"
            value={articleForm.kategori}
            onChange={(e) => setArticleForm({ ...articleForm, kategori: e.target.value })}
            options={[
              { value: 'Pemilahan Sampah', label: 'Pemilahan Sampah' },
              { value: 'Daur Ulang', label: 'Daur Ulang' },
              { value: 'Gaya Hidup', label: 'Gaya Hidup' },
              { value: 'Ekonomi Hijau', label: 'Ekonomi Hijau' },
              { value: 'Isu Lingkungan', label: 'Isu Lingkungan' },
            ]}
          />

          <Input
            label="Deskripsi Singkat (Ringkasan)"
            type="textarea"
            rows={2}
            value={articleForm.deskripsi_singkat}
            onChange={(e) =>
              setArticleForm({ ...articleForm, deskripsi_singkat: e.target.value })
            }
            placeholder="Ringkasan 1-2 kalimat untuk kartu artikel..."
            required
          />

          <Input
            label="Konten Lengkap"
            type="textarea"
            rows={6}
            value={articleForm.konten_lengkap}
            onChange={(e) =>
              setArticleForm({ ...articleForm, konten_lengkap: e.target.value })
            }
            placeholder="Tuliskan isi artikel edukasi secara lengkap di sini..."
            required
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px',
            }}
          >
            <Button variant="ghost" onClick={() => setArticleModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingArticleId ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
