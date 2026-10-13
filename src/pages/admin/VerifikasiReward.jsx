import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCoins, formatDate } from '../../utils/helpers';
import { getAdminRewardsApi, updateStatusRewardApi } from '../../api/admin';
import { useConfirm } from '../../hooks/useConfirm';
import AdminPageHeader from './AdminPageHeader';

/**
 * Verifikasi Tukar Reward member — /admin/verifikasi/reward
 * Selesai → hadiah/voucher diserahkan; Tolak → koin member di-refund otomatis.
 */
export default function VerifikasiReward({ showToast }) {
  const confirm = useConfirm();
  const [rewardList, setRewardList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRewardsData = () =>
    getAdminRewardsApi()
      .then((data) => {
        setRewardList(data);
        setLoading(false);
        return data;
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        return [];
      });

  useEffect(() => {
    loadRewardsData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadRewardsData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} permintaan reward.`, 'success');
    });
  };

  // Verifikasi Selesai / Ditolak (refund koin)
  const handleVerifyReward = async (id, status) => {
    if (status === 'Ditolak') {
      const ok = await confirm({
        title: 'Tolak permintaan tukar reward?',
        message: 'Koin member akan dikembalikan otomatis oleh sistem.',
        confirmText: 'Tolak & Kembalikan Koin',
        danger: true,
      });
      if (!ok) return;
    }

    try {
      await updateStatusRewardApi(id, status);
      if (showToast) {
        showToast(
          status === 'Selesai'
            ? 'Penukaran reward ditandai Selesai. Member bisa klaim hadiahnya.'
            : 'Permintaan tukar reward ditolak dan koin dikembalikan.',
          'success'
        );
      }
      loadRewardsData();
      window.dispatchEvent(new Event('livora:stats-changed'));
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal memproses permintaan reward', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Verifikasi Transaksi', variant: 'blue' }]}
        title="Verifikasi Tukar Reward"
        subtitle="Tandai Selesai setelah hadiah/voucher diserahkan, atau Tolak untuk mengembalikan koin member (simulasi payout e-wallet)."
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
            Permintaan Tukar Reward Member
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Penukaran koin → hadiah/voucher. Status &quot;Pending&quot; menunggu verifikasi
            Anda.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat data penukaran reward...
          </div>
        ) : rewardList.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            Belum ada permintaan tukar reward.
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
                  <th style={{ padding: '14px 20px' }}>Member</th>
                  <th style={{ padding: '14px 16px' }}>Reward</th>
                  <th style={{ padding: '14px 16px' }}>Koin Terpakai</th>
                  <th style={{ padding: '14px 16px' }}>Kode Voucher</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                {rewardList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {item.user?.name || 'Member'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        @{item.user?.username} • {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      {item.reward?.nama_reward || 'Reward'}
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#94a3b8',
                          fontWeight: '400',
                        }}
                      >
                        {item.reward?.kategori}
                      </div>
                    </td>
                    <td
                      style={{ padding: '14px 16px', fontWeight: '700', color: '#d97706' }}
                    >
                      -{formatCoins(item.koin_terpakai)} KOIN
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        color: '#15803d',
                      }}
                    >
                      {item.kode_voucher || '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={
                          item.status === 'Selesai'
                            ? 'green'
                            : item.status === 'Ditolak'
                              ? 'danger'
                              : 'coin'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                      {item.catatan_admin && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            marginTop: '4px',
                            maxWidth: '200px',
                          }}
                        >
                          {item.catatan_admin}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {item.status === 'Pending' ? (
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleVerifyReward(item.id, 'Selesai')}
                            leftIcon={<CheckCircle2 size={14} />}
                          >
                            Selesai
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleVerifyReward(item.id, 'Ditolak')}
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
