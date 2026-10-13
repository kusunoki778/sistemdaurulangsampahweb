import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, RefreshCw } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { formatCoins } from '../../utils/helpers';
import {
  getAdminJenisApi,
  getAdminKategoriApi,
  createJenisApi,
  updateJenisApi,
  deleteJenisApi,
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
 * Master Data: Jenis Sampah (CRUD) — /admin/master/jenis
 * Menentukan satuan (kg/liter/pcs) dan poin per satuan untuk kalkulasi koin setor.
 */
export default function MasterJenisSampah({ showToast }) {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    kategori_id: '',
    nama_jenis: '',
    satuan: 'kg',
    poin_per_satuan: '',
    deskripsi: '',
  });

  const loadData = () =>
    Promise.all([getAdminJenisApi(), getAdminKategoriApi()])
      .then(([jenis, kategori]) => {
        setItems(jenis);
        setKategoriList(kategori);
        setLoading(false);
        return jenis;
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
      if (showToast) showToast(`Berhasil memuat ${data.length} jenis sampah.`, 'success');
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      kategori_id: kategoriList[0]?.id || '',
      nama_jenis: '',
      satuan: 'kg',
      poin_per_satuan: '',
      deskripsi: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      kategori_id: String(item.kategori_id),
      nama_jenis: item.nama_jenis,
      satuan: item.satuan,
      poin_per_satuan: String(item.poin_per_satuan),
      deskripsi: item.deskripsi || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      kategori_id: Number(form.kategori_id),
      poin_per_satuan: Number(form.poin_per_satuan),
    };
    try {
      if (editingId) {
        await updateJenisApi(editingId, payload);
        if (showToast) showToast('Jenis sampah berhasil diperbarui!', 'success');
      } else {
        await createJenisApi(payload);
        if (showToast) showToast('Jenis sampah baru berhasil dibuat!', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyimpan jenis sampah', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (
      await confirm({
        title: 'Hapus jenis sampah?',
        message:
          'Item tidak lagi bisa disetor member. Riwayat setor yang sudah tercatat tidak berubah.',
        confirmText: 'Hapus',
        danger: true,
      })
    ) {
      try {
        await deleteJenisApi(id);
        if (showToast) showToast('Jenis sampah berhasil dihapus.', 'success');
        loadData();
      } catch (err) {
        if (showToast) showToast(err.message || 'Gagal menghapus jenis sampah', 'error');
      }
    }
  };

  const kategoriName = (id) => kategoriList.find((k) => k.id === id)?.nama_kategori || '—';

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Master Data', variant: 'blue' }]}
        title="Jenis Sampah"
        subtitle="Daftar item yang bisa disetor member beserta satuan dan poin per satuan (dasar perhitungan koin)."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw size={14} />}>
              Segarkan
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus size={15} />}>
              Tambah Jenis
            </Button>
          </>
        }
      />

      <div className="container" style={{ marginTop: '28px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat jenis sampah...
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
            Belum ada jenis sampah. Buat kategori dulu, lalu tambahkan jenis di sini.
          </div>
        ) : (
          <div style={WRAPPER}>
            <table style={TABLE}>
              <thead>
                <tr style={HEAD_ROW}>
                  <th style={{ padding: '14px 20px' }}>Jenis Sampah</th>
                  <th style={{ padding: '14px 16px' }}>Kategori</th>
                  <th style={{ padding: '14px 16px' }}>Satuan</th>
                  <th style={{ padding: '14px 16px' }}>Poin / Satuan</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.nama_jenis}</div>
                      {item.deskripsi && (
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.deskripsi}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant="green" size="sm">
                        {item.kategori?.nama_kategori || kategoriName(item.kategori_id)}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: '600' }}>
                      {item.satuan}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#d97706' }}>
                      {formatCoins(item.poin_per_satuan)} POIN
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
        title={editingId ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah'}
        subtitle="Satuan & poin dipakai sistem saat admin menyetujui setoran"
        maxWidth="520px"
      >
        <form onSubmit={handleSave}>
          <Input
            label="Kategori"
            type="select"
            value={form.kategori_id}
            onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
            options={kategoriList.map((k) => ({ value: String(k.id), label: k.nama_kategori }))}
            required
          />
          <Input
            label="Nama Jenis"
            value={form.nama_jenis}
            onChange={(e) => setForm({ ...form, nama_jenis: e.target.value })}
            placeholder="Contoh: Botol PET Bening"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Satuan"
              type="select"
              value={form.satuan}
              onChange={(e) => setForm({ ...form, satuan: e.target.value })}
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'liter', label: 'liter' },
                { value: 'pcs', label: 'pcs' },
              ]}
              required
            />
            <Input
              label="Poin per Satuan"
              type="number"
              min="1"
              value={form.poin_per_satuan}
              onChange={(e) => setForm({ ...form, poin_per_satuan: e.target.value })}
              placeholder="Contoh: 150"
              required
            />
          </div>
          <Input
            label="Deskripsi"
            type="textarea"
            rows={3}
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            placeholder="Contoh: Botol minuman bekas, dicuci dan tanpa tutup"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Simpan Perubahan' : 'Tambah Jenis'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
