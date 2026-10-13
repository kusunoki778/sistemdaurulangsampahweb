import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Coins, CheckCircle2, AlertCircle, Copy, Gift } from 'lucide-react';
import { formatCoins, getRewardImage } from '../../utils/helpers';
import { redeemRewardApi } from '../../api/reward';
import { useAuth } from '../../hooks/useAuth';

export default function RedeemModal({ isOpen, onClose, reward, onSuccess, onOpenLogin }) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [nomorTujuan, setNomorTujuan] = useState('');

  if (!reward) return null;

  const userCoins = user?.saldo_koin ?? 0;
  const price = reward.koin_harga ?? reward.koin_dibutuhkan ?? 0;
  const needsPhone = reward.tipe === 'saldo_digital' || reward.kategori === 'Saldo Digital';
  const remainingCoins = userCoins - price;
  const isEnough = remainingCoins >= 0;

  const handleRedeem = async () => {
    if (!user) {
      setError('Silakan login terlebih dahulu untuk menukarkan reward.');
      return;
    }
    if (!isEnough) {
      setError('Saldo koin Anda tidak mencukupi untuk reward ini.');
      return;
    }
    if (needsPhone && !nomorTujuan.trim()) {
      setError('Masukkan nomor HP e-wallet tujuan untuk reward saldo digital.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await redeemRewardApi(reward.id, nomorTujuan.trim() || null);
      if (res.status === 'success') {
        const payload = res.data || {};
        // Backend mengembalikan { permintaan: { kode_klaim, ... }, sisa_koin }.
        // Dinormalkan dulu agar bagian "berhasil" bisa membaca kode & sisa koin.
        setSuccessData({
          ...payload,
          kode_voucher:
            payload.permintaan?.kode_voucher ??
            payload.permintaan?.kode_klaim ??
            payload.kode_voucher,
          sisa_koin: payload.sisa_koin ?? payload.sisa_saldo_koin,
        });
        // Sinkronkan saldo/tier terbaru dari server.
        refreshUser();
        if (onSuccess) onSuccess(payload);
      } else {
        setError(res.message || 'Penukaran reward gagal.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memproses reward.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleModalClose = () => {
    setSuccessData(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={successData ? 'Penukaran Berhasil!' : 'Konfirmasi Penukaran Reward'}
      subtitle={successData ? 'Simpan kode klaim reward Anda' : 'Pastikan saldo koin mencukupi sebelum menukar'}
      maxWidth="500px"
      footer={
        successData ? (
          <Button variant="primary" onClick={handleModalClose}>
            Tutup
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={handleModalClose} disabled={loading}>
              Batal
            </Button>
            <Button
              variant="coin"
              onClick={handleRedeem}
              loading={loading}
              disabled={!isEnough || !user}
              leftIcon={<Gift size={18} />}
            >
              {user ? 'Tukar Sekarang' : 'Login untuk Tukar'}
            </Button>
          </>
        )
      }
    >
      {successData ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Selamat! Reward Berhasil Ditukar
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
            {reward.nama_reward} telah diproses. Gunakan kode di bawah ini untuk klaim voucher atau verifikasi di drop point Livora.
          </p>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              Kode Voucher / Klaim:
            </div>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: '800',
                color: '#15803d',
                letterSpacing: '1.5px',
                margin: '8px 0',
              }}
            >
              {successData.kode_voucher || '—'}
            </div>
            {successData.kode_voucher && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopyCode(successData.kode_voucher)}
                leftIcon={<Copy size={14} />}
              >
                {copied ? 'Tersalin ke Clipboard!' : 'Salin Kode'}
              </Button>
            )}
          </div>

          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Sisa Koin Anda Saat Ini: <strong>{formatCoins(successData.sisa_koin ?? remainingCoins)} Koin</strong>
          </p>
        </div>
      ) : (
        <div>
          {/* Reward Preview Card */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
            }}
          >
            <img
              src={getRewardImage(reward.gambar, reward.kategori)}
              alt={reward.nama_reward}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '10px',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Badge variant="blue" size="sm" style={{ width: 'fit-content', marginBottom: '6px' }}>
                {reward.kategori}
              </Badge>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.3 }}>
                {reward.nama_reward}
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Stok tersedia: <strong>{reward.stok} unit</strong>
              </p>
            </div>
          </div>

          {/* Coin Simulation (design.md Section 8.4) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Harga Reward</span>
              <span style={{ fontWeight: '700', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coins size={16} /> {formatCoins(price)} Koin
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Saldo Koin Anda</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>
                {formatCoins(userCoins)} Koin
              </span>
            </div>

            <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />

            {needsPhone && (
              <div>
                <label
                  htmlFor="nomor-tujuan"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}
                >
                  Nomor HP / E-Wallet Tujuan
                </label>
                <input
                  id="nomor-tujuan"
                  type="text"
                  value={nomorTujuan}
                  onChange={(e) => setNomorTujuan(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Saldo digital akan dikirimkan ke nomor ini setelah admin memproses.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>Sisa Koin Setelah Tukar</span>
              <span
                style={{
                  fontWeight: '800',
                  color: isEnough ? '#15803d' : '#ef4444',
                }}
              >
                {formatCoins(remainingCoins)} Koin
              </span>
            </div>
          </div>

          {!user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#0369a1',
                fontSize: '0.85rem',
                marginBottom: '12px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>Anda belum login. Masuk dulu untuk menukarkan koin.</span>
              <Button size="sm" variant="secondary" onClick={onOpenLogin}>
                Masuk
              </Button>
            </div>
          )}

          {!isEnough && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '12px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>
                Koin Anda kurang <strong>{formatCoins(Math.abs(remainingCoins))} Koin</strong>. Kumpulkan sampah daur ulang untuk menambah saldo!
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
