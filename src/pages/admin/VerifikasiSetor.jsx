import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCoins } from '../../utils/helpers';
import { getAdminSetorSampahApi, updateStatusSetorApi } from '../../api/admin';
import { useConfirm } from '../../hooks/useConfirm';
import AdminPageHeader from './AdminPageHeader';

/**
 * Verifikasi Setor Sampah (offline direct drop-off) — /admin/verifikasi/setor
 * Setujui → koin masuk wallet member otomatis; Tolak → koin tidak bertambah.
 */
export default function VerifikasiSetor({ showToast }) {
  const confirm = useConfirm();
  const [setorList, setSetorList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSetorData = () =>
    getAdminSetorSampahApi()
      .then((data) => {
        setSetorList(data);
        setLoading(false);
        return data;
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        return [];
      });

  useEffect(() => {
    loadSetorData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadSetorData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} permintaan setor.`, 'success');
    });
  };

  // Verifikasi dengan alasan penolakan untuk member
  const handleVerifySetor = async (id, status) => {
    let alasan = '';
    if (status === 'Ditolak') {
      alasan = await confirm({
        title: 'Tolak setoran member?',
        message: 'Alasan ini dikirim ke member dan tampil di riwayat setornya.',
        withInput: true,
        inputLabel: 'Alasan penolakan',
        inputPlaceholder: 'Tulis alasan yang jelas untuk member...',
        defaultValue: 'Sampah tidak sesuai kriteria atau kondisi tidak layak daur ulang.',
        confirmText: 'Tolak Setoran',
        danger: true,
      });
      if (!alasan) return; // dibatalkan
      alasan = alasan.trim();
    }

    try {
      await updateStatusSetorApi(id, status, alasan);
      if (showToast) showToast(`Permintaan setor sampah berhasil di-${status}!`, 'success');
      loadSetorData();
      window.dispatchEvent(new Event('livora:stats-changed'));
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal memproses permintaan setor', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Verifikasi Transaksi', variant: 'blue' }]}
        title="Verifikasi Setor Sampah"
        subtitle="Verifikasi setoran offline (direct drop-off) member untuk menambahkan koin ke wallet mereka."
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
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
            Permintaan Setor Sampah Member
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Menampilkan semua riwayat setor. Status &quot;Pending&quot; menunggu verifikasi
            Anda.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat data setor sampah...
          </div>
        ) : setorList.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            Tidak ada permintaan setor sampah yang perlu diproses saat ini.
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
                  <th style={{ padding: '14px 20px' }}>Nama Member</th>
                  <th style={{ padding: '14px 16px' }}>Jenis Sampah</th>
                  <th style={{ padding: '14px 16px' }}>Jumlah</th>
                  <th style={{ padding: '14px 16px' }}>Estimasi Koin</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                {setorList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {item.user?.name || 'Member'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        @{item.user?.username}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      {item.jenis_sampah || item.nilai_tukar?.jenis_sampah}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {item.jumlah} {item.satuan || item.nilai_tukar?.satuan}
                    </td>
                    <td
                      style={{ padding: '14px 16px', fontWeight: '700', color: '#d97706' }}
                    >
                      +{formatCoins(item.koin_estimasi)} KOIN
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={
                          item.status === 'Diterima'
                            ? 'green'
                            : item.status === 'Ditolak'
                              ? 'danger'
                              : 'coin'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {item.status === 'Pending' ? (
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleVerifySetor(item.id, 'Diterima')}
                            leftIcon={<CheckCircle2 size={14} />}
                          >
                            Terima
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleVerifySetor(item.id, 'Ditolak')}
                            leftIcon={<XCircle size={14} />}
                          >
                            Tolak
                          </Button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
