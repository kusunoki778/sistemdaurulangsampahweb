import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, RefreshCw } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { formatCoins } from '../../utils/helpers';
import {
  getAdminMisiApi,
  createMisiApi,
  updateMisiApi,
  deleteMisiApi,
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
 * Gamifikasi: Misi Member (CRUD) — /admin/gamifikasi/misi
 * Misi daily/weekly yang menantang member menyetor/menyelesaikan target.
 */
export default function GamifikasiMisi({ showToast }) {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    tipe: 'daily',
    target_jumlah: '',
    koin_reward: '',
    status_aktif: '1',
  });

  const loadData = () =>
    getAdminMisiApi()
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
      if (showToast) showToast(`Berhasil memuat ${data.length} misi.`, 'success');
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      judul: '',
      deskripsi: '',
      tipe: 'daily',
      target_jumlah: '',
      koin_reward: '',
      status_aktif: '1',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      judul: item.judul,
      deskripsi: item.deskripsi || '',
      tipe: item.tipe,
      target_jumlah: String(item.target_jumlah),
      koin_reward: String(item.koin_reward),
      status_aktif: item.status_aktif ? '1' : '0',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      target_jumlah: Number(form.target_jumlah),
      koin_reward: Number(form.koin_reward),
      status_aktif: form.status_aktif === '1',
    };
    try {
      if (editingId) {
        await updateMisiApi(editingId, payload);
        if (showToast) showToast('Misi berhasil diperbarui!', 'success');
      } else {
        await createMisiApi(payload);
        if (showToast) showToast('Misi baru berhasil dibuat!', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyimpan misi', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (
      await confirm({
        title: 'Hapus misi member?',
        message: 'Progres member yang sudah berjalan tidak ikut terhapus.',
        confirmText: 'Hapus',
        danger: true,
      })
    ) {
      try {
        await deleteMisiApi(id);
        if (showToast) showToast('Misi berhasil dihapus.', 'success');
        loadData();
      } catch (err) {
        if (showToast) showToast(err.message || 'Gagal menghapus misi', 'error');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Gamifikasi', variant: 'blue' }]}
        title="Misi Member"
        subtitle="Tantangan harian/mingguan yang member selesaikan untuk mendapat koin tambahan."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw size={14} />}>
              Segarkan
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus size={15} />}>
              Tambah Misi
            </Button>
          </>
        }
      />

      <div className="container" style={{ marginTop: '28px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat misi...
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
            Belum ada misi. Klik &quot;Tambah Misi&quot; untuk membuat misi pertama.
          </div>
        ) : (
          <div style={WRAPPER}>
            <table style={TABLE}>
              <thead>
                <tr style={HEAD_ROW}>
                  <th style={{ padding: '14px 20px' }}>Misi</th>
                  <th style={{ padding: '14px 16px' }}>Tipe</th>
                  <th style={{ padding: '14px 16px' }}>Target</th>
                  <th style={{ padding: '14px 16px' }}>Koin Reward</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', maxWidth: '360px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.judul}</div>
                      {item.deskripsi && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: '#94a3b8',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.deskripsi}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={item.tipe === 'daily' ? 'blue' : 'coin'} size="sm">
                        {item.tipe === 'daily' ? 'Harian' : 'Mingguan'}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                      {item.target_jumlah}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#d97706' }}>
                      +{formatCoins(item.koin_reward)} KOIN
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={item.status_aktif ? 'green' : 'gray'} size="sm">
                        {item.status_aktif ? 'Aktif' : 'Nonaktif'}
                      </Badge>
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
        title={editingId ? 'Edit Misi' : 'Tambah Misi Baru'}
        subtitle="Progres dihitung otomatis dari aktivitas member"
        maxWidth="520px"
      >
        <form onSubmit={handleSave}>
          <Input
            label="Judul Misi"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            placeholder="Contoh: Setor 3 kg plastik minggu ini"
            required
          />
          <Input
            label="Deskripsi"
            type="textarea"
            rows={3}
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            placeholder="Contoh: Serahkan sampah plastik ke drop point Livora"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Tipe"
              type="select"
              value={form.tipe}
              onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              options={[
                { value: 'daily', label: 'Harian (daily)' },
                { value: 'weekly', label: 'Mingguan (weekly)' },
              ]}
              required
            />
            <Input
              label="Target Jumlah"
              type="number"
              min="1"
              value={form.target_jumlah}
              onChange={(e) => setForm({ ...form, target_jumlah: e.target.value })}
              placeholder="Contoh: 3"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Koin Reward"
              type="number"
              min="0"
              value={form.koin_reward}
              onChange={(e) => setForm({ ...form, koin_reward: e.target.value })}
              placeholder="Contoh: 100"
              required
            />
            <Input
              label="Status"
              type="select"
              value={form.status_aktif}
              onChange={(e) => setForm({ ...form, status_aktif: e.target.value })}
              options={[
                { value: '1', label: 'Aktif' },
                { value: '0', label: 'Nonaktif' },
              ]}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Simpan Perubahan' : 'Buat Misi'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
