import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Recycle,
  Droplets,
  Mail,
  Gift,
  RefreshCw,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatCoins, formatNumber } from '../../utils/helpers';
import { getAdminStatsApi, getAdminKategoriApi } from '../../api/admin';
import AdminPageHeader from './AdminPageHeader';

/**
 * Ringkasan CMS (halaman utama panel admin: /admin/dashboard).
 *  - Kartu statistik dari GET /admin/stats
 *  - Antrean tindakan admin (klik langsung ke halaman verifikasi)
 *  - Grafik batang CSS: sebaran jenis sampah per kategori (tanpa library)
 */
export default function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);

  const loadStatsData = () =>
    getAdminStatsApi()
      .then((data) => {
        setStats(data);
        return data;
      })
      .catch((err) => {
        console.warn('Failed to load admin stats:', err);
        return null;
      });

  const loadKategoriData = () =>
    getAdminKategoriApi()
      .then((data) => {
        setKategoriList(data);
        return data;
      })
      .catch((err) => {
        console.warn('Failed to load kategori:', err);
        return [];
      });

  useEffect(() => {
    loadStatsData();
    loadKategoriData();
  }, []);

  const handleRefresh = async () => {
    const data = await loadStatsData();
    if (data && showToast) showToast('Statistik berhasil disegarkan.', 'success');
  };

  const statCards = [
    {
      label: 'Total Anggota',
      color: '#0284c7',
      Icon: Users,
      value: stats ? formatNumber(stats.total_members) : '…',
      unit: 'user',
    },
    {
      label: 'Sampah Terkumpul',
      color: '#16a34a',
      Icon: Recycle,
      value: stats ? formatNumber(stats.total_sampah_kg) : '…',
      unit: 'kg',
    },
    {
      label: 'Minyak Terdaur',
      color: '#d97706',
      Icon: Droplets,
      value: stats ? formatNumber(stats.total_minyak_liter) : '…',
      unit: 'liter',
    },
    {
      label: 'Koin Eco Beredar',
      color: '#b91c1c',
      Icon: Gift,
      value: stats ? formatCoins(stats.total_koin_beredar) : '…',
      unit: 'koin',
    },
  ];

  const attentionItems = [
    {
      label: 'Verifikasi Setor Sampah',
      count: stats?.pending_setor ?? 0,
      to: '/admin/verifikasi/setor',
      icon: Recycle,
      color: '#16a34a',
      bg: '#dcfce7',
    },
    {
      label: 'Verifikasi Tukar Reward',
      count: stats?.pending_reward ?? 0,
      to: '/admin/verifikasi/reward',
      icon: Gift,
      color: '#d97706',
      bg: '#fef3c7',
    },
    {
      label: 'Pesan Kontak Baru',
      count: stats?.pesan_belum_dibaca ?? 0,
      to: '/admin/pesan',
      icon: Mail,
      color: '#b91c1c',
      bg: '#fee2e2',
    },
  ];

  const maxJenis = Math.max(...kategoriList.map((k) => k.jenis_sampah_count ?? 0), 1);

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        title="Ringkasan CMS"
        subtitle="Statistik live dari database Livora — angka antrean di bawah membuka langsung halaman verifikasinya."
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
        {/* 4 kartu statistik */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '16px',
          }}
        >
          {statCards.map((card) => {
            const Icon = card.Icon;
            return (
              <div
                key={card.label}
                className="admin-stat-card"
                style={{
                  backgroundColor: '#ffffff',
                  padding: '18px 20px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: card.color,
                      textTransform: 'uppercase',
                    }}
                  >
                    {card.label}
                  </span>
                  <Icon size={18} color={card.color} />
                </div>
                <div
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginTop: '6px',
                  }}
                >
                  {card.value}{' '}
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{card.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Antrean tindakan + grafik sebaran kategori */}
        <div
          className="grid grid-cols-2 md-grid-cols-1 gap-6"
          style={{ marginTop: '24px' }}
        >
          <Card>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: '800',
                color: '#0f172a',
                marginBottom: '4px',
              }}
            >
              Menunggu Tindakan Admin
            </h3>
            <p style={{ fontSize: '0.83rem', color: '#64748b', marginBottom: '14px' }}>
              Klik salah satu untuk langsung membuka halaman verifikasinya.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {attentionItems.map((item) => {
                const Icon = item.icon;
                const hasTask = item.count > 0;
                return (
                  <button
                    key={item.to}
                    type="button"
                    className="admin-quick-row"
                    onClick={() => navigate(item.to)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '13px 15px',
                      borderRadius: '12px',
                      border: `1px solid ${hasTask ? '#e2e8f0' : '#f1f5f9'}`,
                      backgroundColor: hasTask ? '#ffffff' : '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: hasTask ? item.bg : '#f1f5f9',
                        color: hasTask ? item.color : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: '#0f172a',
                      }}
                    >
                      {item.label}
                    </span>
                    {hasTask ? (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          color: '#ffffff',
                          backgroundColor: item.color,
                          padding: '3px 10px',
                          borderRadius: '999px',
                        }}
                      >
                        {item.count}
                      </span>
                    ) : (
                      <span
                        style={{ display: 'flex', color: '#16a34a' }}
                        title="Tidak ada antrean"
                      >
                        <CheckCircle2 size={17} />
                      </span>
                    )}
                    <ArrowRight size={16} color="#94a3b8" />
                  </button>
                );
              })}
            </div>

            <Button
              variant="primary"
              size="sm"
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => navigate('/admin/artikel')}
              leftIcon={<Plus size={15} />}
            >
              Tulis & Terbitkan Artikel Baru
            </Button>
          </Card>

          <Card>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: '800',
                color: '#0f172a',
                marginBottom: '4px',
              }}
            >
              Sebaran Jenis Sampah per Kategori
            </h3>
            <p style={{ fontSize: '0.83rem', color: '#64748b', marginBottom: '16px' }}>
              Jumlah item master pada tiap kategori (sumber: Master Data).
            </p>

            {kategoriList.length === 0 ? (
              <p style={{ fontSize: '0.87rem', color: '#94a3b8' }}>
                Belum ada kategori sampah. Tambahkan lewat menu Kategori Sampah.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {kategoriList.map((k) => {
                  const count = k.jenis_sampah_count ?? 0;
                  const widthPct =
                    count === 0 ? 0 : Math.max(Math.round((count / maxJenis) * 100), 6);
                  return (
                    <div key={k.id}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                          marginBottom: '6px',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                          {k.nama_kategori}
                        </span>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            color: '#0f172a',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {count} jenis
                        </span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${widthPct}%`,
                            height: '100%',
                            backgroundColor: '#16a34a',
                            borderRadius: '4px',
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/admin/master/kategori')}
              rightIcon={<ArrowRight size={14} />}
            >
              Kelola Kategori & Jenis
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
