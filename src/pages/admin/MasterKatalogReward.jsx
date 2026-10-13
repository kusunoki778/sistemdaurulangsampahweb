import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, RefreshCw } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { formatCoins } from '../../utils/helpers';
import {
  getAdminKatalogRewardApi,
  createKatalogRewardApi,
  updateKatalogRewardApi,
  deleteKatalogRewardApi,
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

const TIPE_LABEL = { barang: 'Barang', voucher: 'Voucher', saldo_digital: 'Saldo Digital' };
const TIPE_VARIANT = { barang: 'blue', voucher: 'green', saldo_digital: 'coin' };

/**
 * Master Data: Katalog Reward (CRUD) — /admin/master/reward
 * Item hadiah yang ditukar member dengan koin lewat Aplikasi Mobile Livora.
 */
export default function MasterKatalogReward({ showToast }) {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nama_reward: '',
    tipe: 'barang',
    koin_dibutuhkan: '',
    stok: '',
    deskripsi: '',
    status_aktif: '1',
  });

  const loadData = () =>
    getAdminKatalogRewardApi()
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
      if (showToast) showToast(`Berhasil memuat ${data.length} reward.`, 'success');
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      nama_reward: '',
      tipe: 'barang',
      koin_dibutuhkan: '',
      stok: '',
      deskripsi: '',
      status_aktif: '1',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nama_reward: item.nama_reward,
      tipe: item.tipe,
      koin_dibutuhkan: String(item.koin_dibutuhkan),
      stok: String(item.stok),
      deskripsi: item.deskripsi || '',
      status_aktif: item.status_aktif ? '1' : '0',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      koin_dibutuhkan: Number(form.koin_dibutuhkan),
      stok: Number(form.stok),
      status_aktif: form.status_aktif === '1',
    };
    try {
      if (editingId) {
        await updateKatalogRewardApi(editingId, payload);
        if (showToast) showToast('Reward berhasil diperbarui!', 'success');
      } else {
        await createKatalogRewardApi(payload);
        if (showToast) showToast('Reward baru berhasil ditambahkan!', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyimpan reward', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (
      await confirm({
        title: 'Hapus reward dari katalog?',
        message:
          'Item hilang dari halaman reward member. Penukaran yang sudah pernah disetujui tetap tercatat di riwayat.',
        confirmText: 'Hapus',
        danger: true,
      })
    ) {
      try {
        await deleteKatalogRewardApi(id);
        if (showToast) showToast('Reward berhasil dihapus.', 'success');
        loadData();
      } catch (err) {
        if (showToast) showToast(err.message || 'Gagal menghapus reward', 'error');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Master Data', variant: 'blue' }]}
        title="Katalog Reward"
        subtitle="Item hadiah yang bisa ditukar member dengan koin: barang, voucher, atau saldo digital (simulasi payout)."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw size={14} />}>
              Segarkan
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus size={15} />}>
              Tambah Reward
            </Button>
          </>
        }
      />

      <div className="container" style={{ marginTop: '28px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat katalog reward...
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
            Katalog masih kosong. Klik &quot;Tambah Reward&quot; untuk mengisi hadiah pertama.
          </div>
        ) : (
          <div style={WRAPPER}>
            <table style={TABLE}>
              <thead>
                <tr style={HEAD_ROW}>
                  <th style={{ padding: '14px 20px' }}>Reward</th>
                  <th style={{ padding: '14px 16px' }}>Tipe</th>
                  <th style={{ padding: '14px 16px' }}>Harga</th>
                  <th style={{ padding: '14px 16px' }}>Stok</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', maxWidth: '320px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.nama_reward}</div>
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
                      <Badge variant={TIPE_VARIANT[item.tipe] || 'blue'} size="sm">
                        {TIPE_LABEL[item.tipe] || item.tipe}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#d97706' }}>
                      {formatCoins(item.koin_dibutuhkan)} KOIN
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                      {item.stok}
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
        title={editingId ? 'Edit Reward' : 'Tambah Reward'}
        subtitle="Stok berkurang otomatis saat admin menyetujui penukaran member"
        maxWidth="520px"
      >
        <form onSubmit={handleSave}>
          <Input
            label="Nama Reward"
            value={form.nama_reward}
            onChange={(e) => setForm({ ...form, nama_reward: e.target.value })}
            placeholder="Contoh: Voucher GoPay Rp20.000"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Tipe"
              type="select"
              value={form.tipe}
              onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              options={[
                { value: 'barang', label: 'Barang' },
                { value: 'voucher', label: 'Voucher' },
                { value: 'saldo_digital', label: 'Saldo Digital' },
              ]}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Koin Dibutuhkan"
              type="number"
              min="1"
              value={form.koin_dibutuhkan}
              onChange={(e) => setForm({ ...form, koin_dibutuhkan: e.target.value })}
              placeholder="Contoh: 15000"
              required
            />
            <Input
              label="Stok"
              type="number"
              min="0"
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: e.target.value })}
              placeholder="Contoh: 50"
              required
            />
          </div>
          <Input
            label="Deskripsi"
            type="textarea"
            rows={3}
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            placeholder="Contoh: Voucher digital dikirim ke nomor terdaftar (simulasi)"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Simpan Perubahan' : 'Tambah Reward'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
