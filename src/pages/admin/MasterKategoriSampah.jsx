import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import {
  getAdminKategoriApi,
  createKategoriApi,
  updateKategoriApi,
  deleteKategoriApi,
} from '../../api/admin';
import { useConfirm } from '../../hooks/useConfirm';
import AdminPageHeader from './AdminPageHeader';

const WRAPPER = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  overflowX: 'auto',
};
const TABLE = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' };
const HEAD_ROW = {
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  color: '#64748b',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
};

/**
 * Master Data: Kategori Sampah (CRUD) — /admin/master/kategori
 */
export default function MasterKategoriSampah({ showToast }) {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nama_kategori: '', deskripsi: '', icon: '' });

  const loadData = () =>
    getAdminKategoriApi()
      .then((data) => {
        setItems(data);
        setLoading(false);
        return data;
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        return [];
      });

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} kategori.`, 'success');
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ nama_kategori: '', deskripsi: '', icon: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nama_kategori: item.nama_kategori,
      deskripsi: item.deskripsi || '',
      icon: item.icon || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateKategoriApi(editingId, form);
        if (showToast) showToast('Kategori berhasil diperbarui!', 'success');
      } else {
        await createKategoriApi(form);
        if (showToast) showToast('Kategori baru berhasil dibuat!', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyimpan kategori', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (
      await confirm({
        title: 'Hapus kategori sampah?',
        message:
          'Kategori dihapus dari katalog. Jenis sampah di dalamnya tidak ikut terhapus.',
        confirmText: 'Hapus',
        danger: true,
      })
    ) {
      try {
        await deleteKategoriApi(id);
        if (showToast) showToast('Kategori berhasil dihapus.', 'success');
        loadData();
      } catch (err) {
        if (showToast) showToast(err.message || 'Gagal menghapus kategori', 'error');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Master Data', variant: 'blue' }]}
        title="Kategori Sampah"
        subtitle="Kelompok besar jenis sampah (Plastik, Kertas, Logam, ...) yang tampil di katalog /katalog-sampah."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw size={14} />}>
              Segarkan
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus size={15} />}>
              Tambah Kategori
            </Button>
          </>
        }
      />

      <div className="container" style={{ marginTop: '28px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat kategori sampah...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            Belum ada kategori. Klik &quot;Tambah Kategori&quot; untuk membuat pertama.
          </div>
        ) : (
          <div style={WRAPPER}>
            <table style={TABLE}>
              <thead>
                <tr style={HEAD_ROW}>
                  <th style={{ padding: '14px 20px' }}>Kategori</th>
                  <th style={{ padding: '14px 16px' }}>Deskripsi</th>
                  <th style={{ padding: '14px 16px' }}>Jumlah Jenis</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>
                        {item.nama_kategori}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: '380px' }}>
                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.deskripsi || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#16a34a' }}>
                      {item.jenis_sampah_count ?? 0} jenis
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEdit(item)}
                          leftIcon={<Edit3 size={14} />}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Kategori Sampah' : 'Tambah Kategori Sampah'}
        subtitle="Kategori mengelompokkan jenis-jenis sampah di katalog"
        maxWidth="480px"
      >
        <form onSubmit={handleSave}>
          <Input
            label="Nama Kategori"
            value={form.nama_kategori}
            onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
            placeholder="Contoh: Plastik"
            required
          />
          <Input
            label="Ikon Tampilan"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="Satu karakter pendek untuk katalog (opsional)"
          />
          <Input
            label="Deskripsi"
            type="textarea"
            rows={3}
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            placeholder="Contoh: Botol, kemasan, dan plastik sekali pakai"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Simpan Perubahan' : 'Buat Kategori'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
