import { useState, useEffect } from 'react';
import { RefreshCw, Save, Wallet, ArrowUpCircle } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatCoins, formatDateTime, formatNumber } from '../../utils/helpers';
import {
  getAdminTopUpApi,
  getTopUpPengaturanApi,
  updateTopUpPengaturanApi,
} from '../../api/admin';
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

const STATUS_KE_UI = {
  pending: { label: 'Menunggu', variant: 'coin' },
  paid: { label: 'Berhasil', variant: 'green' },
  failed: { label: 'Gagal', variant: 'danger' },
  expired: { label: 'Kedaluwarsa', variant: 'gray' },
};

const rupiah = (nilai) => `Rp ${formatNumber(Number(nilai) || 0)}`;

/**
 * Master Data: Top Up Koin — /admin/master/top-up
 *
 * Pengaturan kurs top-up (1 koin = Rp X) & minimum nominal, plus riwayat
 * top-up semua member. Pembayaran lewat Midtrans Sandbox; tidak ada
 * pencairan uang nyata dari halaman ini.
 */
export default function KelolaTopUp({ showToast }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [pengaturan, setPengaturan] = useState({ kurs_rupiah: '', minimum_rupiah: '' });
  const [menyimpanPengaturan, setMenyimpanPengaturan] = useState(false);

  const loadData = (page = 1) =>
    Promise.all([getAdminTopUpApi({ status: statusFilter, page }), getTopUpPengaturanApi()])
      .then(([riwayat, pengaturanData]) => {
        setItems(riwayat.data || []);
        setMeta({
          current_page: riwayat.current_page || 1,
          last_page: riwayat.last_page || 1,
          total: riwayat.total || 0,
        });
        setPengaturan({
          kurs_rupiah: String(pengaturanData.kurs_rupiah ?? ''),
          minimum_rupiah: String(pengaturanData.minimum_rupiah ?? ''),
        });
        setLoading(false);
        return riwayat;
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        return null;
      });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadData().then((data) => {
      if (showToast && data) showToast('Riwayat top-up diperbarui.', 'success');
    });
  };

  const handleFilterChange = (nilai) => {
    setStatusFilter(nilai);
    setLoading(true);
    getAdminTopUpApi({ status: nilai })
      .then((riwayat) => {
        setItems(riwayat.data || []);
        setMeta({
          current_page: riwayat.current_page || 1,
          last_page: riwayat.last_page || 1,
          total: riwayat.total || 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSimpanPengaturan = async (e) => {
    e.preventDefault();
    const kurs = Number(pengaturan.kurs_rupiah);
    const minimum = Number(pengaturan.minimum_rupiah);

    if (!Number.isFinite(kurs) || kurs < 1) {
      if (showToast) showToast('Kurs harus angka minimal 1.', 'error');
      return;
    }
    if (!Number.isFinite(minimum) || minimum < 1000) {
      if (showToast) showToast('Minimum nominal minimal Rp 1.000.', 'error');
      return;
    }

    setMenyimpanPengaturan(true);
    try {
      await updateTopUpPengaturanApi({ kurs_rupiah: kurs, minimum_rupiah: minimum });
      if (showToast) showToast('Pengaturan top up tersimpan.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyimpan pengaturan.', 'error');
    } finally {
      setMenyimpanPengaturan(false);
    }
  };

  const handleGantiHalaman = (halaman) => {
    if (halaman < 1 || halaman > meta.last_page || halaman === meta.current_page) return;
    setLoading(true);
    loadData(halaman);
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Master Data', variant: 'green' }]}
        title="Top Up Koin"
        subtitle="Kurs konversi rupiah ke koin, minimum nominal, dan riwayat pembayaran member via Midtrans Sandbox."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw size={14} />}
          >
            Segarkan
          </Button>
        }
      />

      <div className="container" style={{ marginTop: '24px' }}>
        {/* Pengaturan kurs & minimum */}
        <div style={{ ...WRAPPER, padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Wallet size={18} color="#16a34a" />
            <span style={{ fontWeight: 800, color: '#0f172a' }}>Pengaturan Top Up</span>
          </div>
          <form
            onSubmit={handleSimpanPengaturan}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '14px', alignItems: 'end' }}
          >
            <Input
              label="Kurs (Rp per 1 koin)"
              type="number"
              min="1"
              step="0.5"
              value={pengaturan.kurs_rupiah}
              onChange={(e) => setPengaturan({ ...pengaturan, kurs_rupiah: e.target.value })}
              placeholder="Contoh: 10"
              required
            />
            <Input
              label="Minimum Nominal (Rp)"
              type="number"
              min="1000"
              step="500"
              value={pengaturan.minimum_rupiah}
              onChange={(e) => setPengaturan({ ...pengaturan, minimum_rupiah: e.target.value })}
              placeholder="Contoh: 10000"
              required
            />
            <Button
              type="submit"
              variant="primary"
              loading={menyimpanPengaturan}
              leftIcon={menyimpanPengaturan ? undefined : <Save size={15} />}
            >
              Simpan
            </Button>
          </form>
          <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
            Contoh: kurs Rp 10 berarti top up Rp 10.000 mendapat 1.000,00 koin. Perubahan kurs hanya
            berlaku untuk top up berikutnya; transaksi lama tetap memakai kurs saat dibuat.
          </p>
        </div>

        {/* Riwayat top-up */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpCircle size={18} color="#16a34a" />
            <span style={{ fontWeight: 800, color: '#0f172a' }}>
              Riwayat Top Up {meta.total > 0 ? `(${meta.total})` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { nilai: '', label: 'Semua' },
              { nilai: 'paid', label: 'Berhasil' },
              { nilai: 'pending', label: 'Menunggu' },
              { nilai: 'failed', label: 'Gagal' },
              { nilai: 'expired', label: 'Kedaluwarsa' },
            ].map((opsi) => (
              <button
                key={opsi.nilai}
                type="button"
                onClick={() => handleFilterChange(opsi.nilai)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1.5px solid ${statusFilter === opsi.nilai ? '#16a34a' : '#e2e8f0'}`,
                  backgroundColor: statusFilter === opsi.nilai ? '#dcfce7' : '#ffffff',
                  color: statusFilter === opsi.nilai ? '#15803d' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                {opsi.label}
              </button>
            ))}
          </div>
        </div>

        <div style={WRAPPER}>
          <table style={TABLE}>
            <thead>
              <tr style={HEAD_ROW}>
                <th style={{ padding: '12px 16px', width: '48px' }}>No</th>
                <th style={{ padding: '12px 16px' }}>Waktu</th>
                <th style={{ padding: '12px 16px' }}>Member</th>
                <th style={{ padding: '12px 16px' }}>Order ID</th>
                <th style={{ padding: '12px 16px' }}>Nominal</th>
                <th style={{ padding: '12px 16px' }}>Koin</th>
                <th style={{ padding: '12px 16px' }}>Metode</th>
                <th style={{ padding: '12px 16px', width: '120px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '34px', textAlign: 'center', color: '#94a3b8' }}>
                    Memuat riwayat top-up…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '34px', textAlign: 'center', color: '#94a3b8' }}>
                    Belum ada transaksi top-up.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const status = STATUS_KE_UI[item.status] || { label: item.status, variant: 'gray' };
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {String((meta.current_page - 1) * 20 + index + 1).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontSize: '0.85rem' }}>
                        {formatDateTime(item.paid_at || item.created_at)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {item.user?.name || '-'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                          @{item.user?.username || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#334155' }}>
                        {item.order_id}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {rupiah(item.nominal_rupiah)}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#b45309' }}>
                        {formatCoins(item.koin_diterima)} koin
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
                          kurs {rupiah(item.kurs_rupiah)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.82rem' }}>
                        {item.payload_midtrans?.payment_type
                          ? String(item.payload_midtrans.payment_type).toUpperCase()
                          : 'MIDTRANS SNAP'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((halaman) => (
              <button
                key={halaman}
                type="button"
                onClick={() => handleGantiHalaman(halaman)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: `1.5px solid ${meta.current_page === halaman ? '#16a34a' : '#e2e8f0'}`,
                  backgroundColor: meta.current_page === halaman ? '#16a34a' : '#ffffff',
                  color: meta.current_page === halaman ? '#ffffff' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                {halaman}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
