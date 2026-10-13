import { useState, useEffect } from 'react';
import { Gift, Coins, ShieldCheck } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ChipFilter from '../components/common/ChipFilter';
import EmptyState from '../components/common/EmptyState';
import { getRewardsApi } from '../api/reward';
import { formatCoins, getRewardImage } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import RedeemModal from '../components/modals/RedeemModal';

/**
 * Katalog reward publik. Filter chip memakai kategori reward
 * (Produk / Voucher / Saldo Digital) → ?tipe=barang|voucher|saldo_digital.
 */
export default function Rewards({ onNavigate, showToast, onOpenLogin }) {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTipe, setSelectedTipe] = useState('semua');

  // Confirmation Redeem Modal
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);

  const tipeOptions = [
    { id: 'Produk', label: 'Produk' },
    { id: 'Voucher', label: 'Voucher' },
    { id: 'Saldo Digital', label: 'Saldo Digital' },
  ];

  useEffect(() => {
    async function loadRewards() {
      try {
        setLoading(true);
        const data = await getRewardsApi(selectedTipe);
        setRewards(data);
      } catch (err) {
        console.error('Failed to load rewards:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRewards();
  }, [selectedTipe]);

  const handleOpenRedeem = (reward) => {
    setSelectedReward(reward);
    setRedeemModalOpen(true);
  };

  const handleRedeemSuccess = (result) => {
    const kodeVoucher = result?.permintaan?.kode_voucher ?? result?.kode_voucher;
    if (showToast) {
      showToast(
        `Sukses menukar ${selectedReward?.nama_reward}! Kode klaim: ${kodeVoucher || '(cek di Riwayat Penukaran)'}`,
        'success'
      );
    }
    // refresh list
    getRewardsApi(selectedTipe).then(setRewards);
  };

  const userCoins = user?.saldo_koin ?? 0;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section
        style={{
          backgroundColor: '#fffbeb',
          paddingTop: '48px',
          paddingBottom: '36px',
          borderBottom: '1px solid #fde68a',
        }}
      >
        <div className="container">
          <Badge variant="coin" size="md" style={{ marginBottom: '12px' }} icon={<Gift size={14} />}>
            Tukar Koin
          </Badge>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Katalog Reward & <span style={{ color: '#d97706' }}>Hadiah</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '720px', marginTop: '10px' }}>
            Tukarkan koin dari setoran sampah Anda. Voucher dan saldo e-wallet diproses lewat
            persetujuan admin, sedangkan barang fisik diambil langsung di drop point Livora.
          </p>

          {/* User Coin Balance Card */}
          <div
            style={{
              marginTop: '32px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Coins size={26} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  Saldo Koin Tersedia
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#b45309' }}>
                  {user ? (
                    <>
                      {formatCoins(userCoins)} <span style={{ fontSize: '1rem' }}>KOIN</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#64748b' }}>
                      Login untuk melihat saldo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {user ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('katalog-sampah')}
                leftIcon={<Coins size={18} />}
              >
                Tambah Koin (Tukar Sampah)
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button variant="primary" size="md" onClick={() => onOpenLogin?.('login')}>
                  Masuk untuk Menukar
                </Button>
                <Button variant="outline" size="md" onClick={() => onNavigate('katalog-sampah')}>
                  Cara Dapat Koin
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rewards Catalog */}
      <div className="container" style={{ marginTop: '40px' }}>
        {/* Filter kategori reward */}
        <div style={{ marginBottom: '28px' }}>
          <ChipFilter
            options={tipeOptions}
            value={selectedTipe}
            onChange={setSelectedTipe}
            allLabel="Semua Reward"
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            Memuat daftar reward...
          </div>
        ) : rewards.length === 0 ? (
          <EmptyState
            icon={<Gift size={40} />}
            title="Belum ada reward di kategori ini"
            message="Coba pilih kategori lain atau lihat seluruh katalog reward."
          >
            <Button variant="secondary" onClick={() => setSelectedTipe('semua')}>
              Tampilkan Semua Reward
            </Button>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
            {rewards.map((rew) => {
              const price = rew.koin_harga ?? rew.koin_dibutuhkan ?? 0;
              const isOutOfStock = rew.stok <= 0;
              const isAffordable = userCoins >= price;

              // Status tombol: jelas kapan bisa tukar, kapan kurang koin, kapan habis.
              const buttonState = isOutOfStock
                ? { variant: 'secondary', label: 'Stok Habis', disabled: true }
                : !user
                  ? { variant: 'primary', label: 'Tukar Reward', disabled: false }
                  : isAffordable
                    ? { variant: 'coin', label: 'Tukar Sekarang', disabled: false }
                    : {
                        variant: 'secondary',
                        label: `Kurang ${formatCoins(price - userCoins)} koin`,
                        disabled: true,
                      };

              return (
                <Card
                  key={rew.id}
                  hover
                  padding="0"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Image & Category Pill */}
                  <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                    <img
                      src={getRewardImage(rew.gambar, rew.kategori)}
                      alt={rew.nama_reward}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                      <Badge variant="blue" size="sm">
                        {rew.kategori}
                      </Badge>
                    </div>
                    {isOutOfStock && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(15, 23, 42, 0.65)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: '800',
                          fontSize: '1.1rem',
                        }}
                      >
                        STOK HABIS
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                      {rew.nama_reward}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                        lineHeight: 1.5,
                        marginBottom: '16px',
                        flex: 1,
                      }}
                    >
                      {rew.deskripsi}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                      Sisa Stok: <strong>{rew.stok} unit</strong>
                    </div>

                    {/* Price and CTA */}
                    <div
                      style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Coins size={20} color="#f59e0b" />
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#d97706' }}>
                          {formatCoins(price)}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#92400e' }}>
                          KOIN
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant={buttonState.variant}
                        onClick={() => handleOpenRedeem(rew)}
                        disabled={buttonState.disabled}
                      >
                        {buttonState.label}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Syarat & Ketentuan Penukaran */}
        <section
          style={{
            marginTop: '64px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldCheck size={24} color="#16a34a" />
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
              Syarat & Ketentuan Penukaran Reward
            </h3>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-1 gap-6" style={{ marginTop: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                1. Saldo E-Wallet
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                Voucher e-wallet (GoPay, OVO, DANA, ShopeePay) berupa kode unik digital yang
                diproses lewat persetujuan admin dan dikirim ke nomor WhatsApp terdaftar maksimal
                1x24 jam setelah verifikasi.
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                2. Produk & Merchandise Fisik
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                Totebag dan tumbler ramah lingkungan dapat diambil langsung di drop point bank
                sampah Livora dengan menunjukkan bukti kode voucher pada layar.
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                3. Bibit Tanaman & Kompos
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                Paket bibit tanaman produktif dan pupuk kompos daur ulang diambil di drop point
                untuk menjaga kesegaran bibit tanaman hidup.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modal */}
      <RedeemModal
        isOpen={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        reward={selectedReward}
        onSuccess={handleRedeemSuccess}
        onOpenLogin={onOpenLogin}
      />
    </div>
  );
}
