import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { RefreshCw, QrCode, Search, CheckCircle2, XCircle, Ticket, ReceiptText, PlayCircle, XOctagon } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { formatCoins, formatDateTime, formatNumber } from '../../utils/helpers';
import {
  getAdminRewardsApi,
  getAdminRewardKuponApi,
  terbitkanRewardQrApi,
  selesaikanRewardApi,
  prosesRewardApi,
  gagalRewardApi,
  batalkanRewardApi,
  getRewardStrukApi,
  getRewardPengaturanApi,
  updateRewardPengaturanApi,
} from '../../api/admin';
import { useConfirm } from '../../hooks/useConfirm';
import AdminPageHeader from './AdminPageHeader';

const CARD = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  padding: '20px',
};

const TABLE_WRAPPER = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  overflowX: 'auto',
};

const TABLE = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '0.9rem',
};

const HEAD_ROW = {
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  color: '#64748b',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
};

const STATUS_VARIANT = {
  pending: 'coin',
  siap_diambil: 'blue',
  diproses: 'blue',
  selesai: 'green',
  ditolak: 'danger',
  kedaluwarsa: 'gray',
  dibatalkan: 'gray',
};

const STATUS_LABEL = {
  pending: 'Pending',
  siap_diambil: 'Siap Diambil',
  diproses: 'Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  kedaluwarsa: 'Kedaluwarsa',
  dibatalkan: 'Dibatalkan',
};

const STATUS_OPTIONS = [
  { label: 'Semua status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Siap diambil', value: 'siap_diambil' },
  { label: 'Diproses', value: 'diproses' },
  { label: 'Selesai', value: 'selesai' },
  { label: 'Kedaluwarsa', value: 'kedaluwarsa' },
  { label: 'Dibatalkan', value: 'dibatalkan' },
];

const TIPE_LABEL = {
  barang: 'Barang Fisik',
  voucher: 'Voucher',
  saldo_digital: 'Saldo Digital',
};

/**
 * Verifikasi Tukar Reward — /admin/verifikasi/reward
 *
 * Alur reward fisik (kupon + QR pickup):
 * 1. Member tukar reward dari rumah -> koin DITAHAN (belum dipotong) dan
 *    kupon LV-XXXX-XXXX diterbitkan dengan masa berlaku (default 3 hari).
 * 2. Member datang ke titik pengambilan; admin memasukkan kode kupon di sini.
 * 3. Admin menampilkan QR pickup; member memindai lalu menekan Konfirmasi.
 * 4. Koin resmi dipotong, status selesai, barang diserahkan.
 *
 * Kupon yang lewat masa berlaku otomatis kedaluwarsa saat dibaca (lazy expiry):
 * koin hold dilepas dan stok dikembalikan tanpa perlu cron.
 */
export default function VerifikasiReward({ showToast }) {
  const confirm = useConfirm();

  const [rewardList, setRewardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Pengaturan masa berlaku kupon (hari).
  const [settingsDays, setSettingsDays] = useState('3');
  const [savingSettings, setSavingSettings] = useState(false);

  // Pencarian kupon.
  const [kuponQuery, setKuponQuery] = useState('');
  const [kuponResult, setKuponResult] = useState(null);
  const [kuponError, setKuponError] = useState('');
  const [kuponLoading, setKuponLoading] = useState(false);

  // { permintaan, qr, image, secondsLeft }
  const [qrState, setQrState] = useState(null);

  // Struk payout (data dari endpoint struk).
  const [strukState, setStrukState] = useState(null);
  const [strukLoading, setStrukLoading] = useState(false);

  const loadRewardData = useCallback(() => {
    return getAdminRewardsApi({ status: filterStatus, search })
      .then((data) => {
        setRewardList(data);
        return data;
      })
      .catch((err) => {
        console.error(err);
        return [];
      })
      .finally(() => setLoading(false));
  }, [filterStatus, search]);

  useEffect(() => {
    loadRewardData();
  }, [loadRewardData]);

  // Debounce pencarian tabel agar tidak memanggil API tiap ketukan.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    getRewardPengaturanApi()
      .then((data) => setSettingsDays(String(data.masa_berlaku_hari)))
      .catch((err) => console.error(err));
  }, []);

  const qrToken = qrState?.qr?.token;

  useEffect(() => {
    if (!qrToken) return undefined;

    const timer = setInterval(() => {
      setQrState((prev) => {
        if (!prev || prev.secondsLeft <= 0) return prev;
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrToken]);

  const openQr = useCallback(async (permintaan, qr) => {
    let image = null;

    try {
      image = await QRCode.toDataURL(qr.payload, {
        width: 320,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
    } catch (err) {
      console.error(err);
    }

    setQrState({ permintaan, qr, image, secondsLeft: qr.expires_in });
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadRewardData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} permintaan reward.`, 'success');
    });
  };

  const handleSimpanPengaturan = async () => {
    const hari = Number(settingsDays);

    if (!Number.isInteger(hari) || hari < 1 || hari > 30) {
      if (showToast) showToast('Masa berlaku kupon harus bilangan bulat 1 sampai 30 hari.', 'error');
      return;
    }

    setSavingSettings(true);

    try {
      const res = await updateRewardPengaturanApi(hari);
      if (showToast) showToast(res.message || 'Pengaturan disimpan.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyimpan pengaturan.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCariKupon = async () => {
    const kode = kuponQuery.trim().toUpperCase();

    if (!kode) {
      if (showToast) showToast('Masukkan kode kupon terlebih dahulu.', 'error');
      return;
    }

    setKuponLoading(true);
    setKuponError('');
    setKuponResult(null);

    try {
      const data = await getAdminRewardKuponApi(kode);
      setKuponResult(data);
    } catch (err) {
      setKuponError(err.status === 404 ? `Kupon ${kode} tidak ditemukan.` : err.message || 'Gagal mencari kupon.');
    } finally {
      setKuponLoading(false);
    }
  };

  const handleTerbitkanQr = async (permintaan) => {
    try {
      const res = await terbitkanRewardQrApi(permintaan.id);
      await openQr(res.permintaan, res.qr);

      if (kuponResult && kuponResult.id === permintaan.id) {
        setKuponResult(res.permintaan);
      }

      loadRewardData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menerbitkan QR pickup.', 'error');
    }
  };

  const handleReissue = async () => {
    if (!qrState) return;

    try {
      const res = await terbitkanRewardQrApi(qrState.permintaan.id);
      await openQr(res.permintaan, res.qr);

      if (kuponResult && kuponResult.id === res.permintaan.id) {
        setKuponResult(res.permintaan);
      }

      loadRewardData();
      if (showToast) showToast('QR baru diterbitkan. Token lama tidak berlaku lagi.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menerbitkan QR baru.', 'error');
    }
  };

  const handleSelesaikan = async (permintaan) => {
    const ok = await confirm({
      title: 'Tandai payout selesai?',
      message:
        'Pencairan disimulasikan: struk "Pencairan Berhasil - Simulasi" akan diterbitkan untuk member. Koin sudah dipotong saat klaim, tidak ada pemotongan tambahan.',
      confirmText: 'Tandai Selesai',
    });

    if (!ok) return;

    try {
      await selesaikanRewardApi(permintaan.id);
      setQrState(null);
      loadRewardData();
      window.dispatchEvent(new Event('livora:stats-changed'));
      if (showToast) showToast('Payout ditandai selesai. Struk tersedia di riwayat member.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyelesaikan payout.', 'error');
    }
  };

  const handleProses = async (permintaan) => {
    const ok = await confirm({
      title: 'Proses payout digital?',
      message:
        'Status berubah menjadi Diproses. Setelah ini tandai Selesai (berhasil) atau Gagal (refund otomatis).',
      confirmText: 'Proses Payout',
    });

    if (!ok) return;

    try {
      await prosesRewardApi(permintaan.id);
      loadRewardData();
      window.dispatchEvent(new Event('livora:stats-changed'));
      if (showToast) showToast('Payout sedang diproses (simulasi).', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal memproses payout.', 'error');
    }
  };

  const handleGagal = async (permintaan) => {
    const alasan = await confirm({
      title: 'Tandai payout gagal?',
      message: 'Koin member akan dikembalikan otomatis dan stok reward dikembalikan.',
      withInput: true,
      inputLabel: 'Alasan kegagalan',
      inputPlaceholder: 'Mis. nomor e-wallet tidak terdaftar...',
      defaultValue: 'Nomor e-wallet tidak terdaftar.',
      confirmText: 'Tandai Gagal & Refund',
      danger: true,
    });

    if (!alasan) return;

    try {
      const res = await gagalRewardApi(permintaan.id, alasan.trim());
      loadRewardData();
      window.dispatchEvent(new Event('livora:stats-changed'));
      if (showToast) showToast(res.message || 'Payout gagal. Koin dikembalikan.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menandai payout gagal.', 'error');
    }
  };

  const handleLihatStruk = async (permintaan) => {
    setStrukLoading(true);
    setStrukState(null);

    try {
      const data = await getRewardStrukApi(permintaan.id);
      setStrukState(data);
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal memuat struk.', 'error');
      setStrukState(null);
    } finally {
      setStrukLoading(false);
    }
  };

  const handleBatalkan = async (permintaan) => {
    const fisikBaru = Number(permintaan.koin_ditahan) > 0;

    const alasan = await confirm({
      title: 'Batalkan kupon reward?',
      message: fisikBaru
        ? 'Koin yang ditahan akan dilepas (saldo member tidak berubah) dan stok reward dikembalikan.'
        : 'Koin yang sudah dipotong akan dikembalikan ke wallet member dan stok dikembalikan.',
      withInput: true,
      inputLabel: 'Alasan pembatalan',
      inputPlaceholder: 'Tulis alasan yang jelas untuk member...',
      defaultValue: 'Reward tidak dapat disiapkan saat ini.',
      confirmText: 'Batalkan Kupon',
      danger: true,
    });

    if (!alasan) return;

    try {
      const res = await batalkanRewardApi(permintaan.id, alasan.trim());

      if (qrState && qrState.permintaan.id === permintaan.id) setQrState(null);
      if (kuponResult && kuponResult.id === permintaan.id) setKuponResult(res.data);

      loadRewardData();
      window.dispatchEvent(new Event('livora:stats-changed'));
      if (showToast) showToast(res.message || 'Kupon dibatalkan.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal membatalkan kupon.', 'error');
    }
  };

  const isFisikAktif = (item) =>
    item.reward?.tipe === 'barang' &&
    Number(item.koin_ditahan) > 0 &&
    ['pending', 'siap_diambil'].includes(item.status_mentah);

  const isLegacyFisik = (item) =>
    item.reward?.tipe === 'barang' &&
    Number(item.koin_ditahan) === 0 &&
    item.status_mentah === 'pending';

  const renderAksi = (item) => {
    if (isFisikAktif(item)) {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleTerbitkanQr(item)}
            leftIcon={<QrCode size={14} />}
          >
            QR Pickup
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleBatalkan(item)}
            leftIcon={<XCircle size={14} />}
          >
            Batalkan
          </Button>
        </div>
      );
    }

    if (item.status_mentah === 'pending' && (isLegacyFisik(item) || item.reward?.tipe === 'voucher')) {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSelesaikan(item)}
            leftIcon={<CheckCircle2 size={14} />}
          >
            Tandai Selesai
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleBatalkan(item)}
            leftIcon={<XCircle size={14} />}
          >
            Batalkan
          </Button>
        </div>
      );
    }

    if (item.status_mentah === 'pending') {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleProses(item)}
            leftIcon={<PlayCircle size={14} />}
          >
            Proses
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleBatalkan(item)}
            leftIcon={<XCircle size={14} />}
          >
            Batalkan
          </Button>
        </div>
      );
    }

    if (item.status_mentah === 'diproses') {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSelesaikan(item)}
            leftIcon={<CheckCircle2 size={14} />}
          >
            Tandai Selesai
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleGagal(item)}
            leftIcon={<XOctagon size={14} />}
          >
            Gagal & Refund
          </Button>
        </div>
      );
    }

    if (item.status_mentah === 'selesai') {
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleLihatStruk(item)}
          leftIcon={<ReceiptText size={14} />}
        >
          Struk
        </Button>
      );
    }

    return (
      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
        {['kedaluwarsa', 'dibatalkan', 'ditolak', 'gagal'].includes(item.status_mentah)
          ? 'Tidak bisa diproses'
          : 'Reward diserahkan'}
      </span>
    );
  };

  const renderKuponCard = () => {
    if (kuponLoading) {
      return (
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '8px 0' }}>Mencari kupon...</div>
      );
    }

    if (kuponError) {
      return (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.85rem',
          }}
        >
          {kuponError}
        </div>
      );
    }

    if (!kuponResult) return null;

    const item = kuponResult;

    return (
      <div
        style={{
          marginTop: '14px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
              {item.kode_klaim}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              {item.user?.name || 'Member'} · @{item.user?.username}
            </div>
          </div>
          <Badge variant={STATUS_VARIANT[item.status_mentah] || 'gray'} size="md">
            {STATUS_LABEL[item.status_mentah] || item.status}
          </Badge>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '10px',
            marginTop: '14px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>REWARD</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>
              {item.reward?.nama_reward || '-'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>TIPE</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>
              {TIPE_LABEL[item.reward?.tipe] || item.reward?.tipe || '-'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>KOIN</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#b45309' }}>
              {formatCoins(item.koin_ditukar)} koin
              {Number(item.koin_ditahan) > 0 ? ' (ditahan)' : ''}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>BERLAKU SAMPAI</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>
              {item.expires_at ? formatDateTime(item.expires_at) : 'Tanpa batas (data lama)'}
            </div>
          </div>
        </div>

        {item.nomor_tujuan_digital && (
          <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#334155' }}>
            <span style={{ color: '#94a3b8', fontWeight: '600' }}>NO. E-WALLET: </span>
            <span style={{ fontFamily: 'monospace' }}>{item.nomor_tujuan_digital}</span>
          </div>
        )}

        {isFisikAktif(item) && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => handleTerbitkanQr(item)} leftIcon={<QrCode size={15} />}>
              Terbitkan QR Pickup
            </Button>
            <Button variant="danger" onClick={() => handleBatalkan(item)} leftIcon={<XCircle size={15} />}>
              Batalkan
            </Button>
          </div>
        )}

        {!isFisikAktif(item) && item.status_mentah === 'pending' && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {isLegacyFisik(item) || item.reward?.tipe === 'voucher' ? (
              <Button variant="secondary" onClick={() => handleSelesaikan(item)} leftIcon={<CheckCircle2 size={15} />}>
                Tandai Selesai
              </Button>
            ) : (
              <Button variant="primary" onClick={() => handleProses(item)} leftIcon={<PlayCircle size={15} />}>
                Proses Payout
              </Button>
            )}
            <Button variant="danger" onClick={() => handleBatalkan(item)} leftIcon={<XCircle size={15} />}>
              Batalkan
            </Button>
          </div>
        )}

        {item.status_mentah === 'diproses' && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => handleSelesaikan(item)} leftIcon={<CheckCircle2 size={15} />}>
              Tandai Selesai
            </Button>
            <Button variant="danger" onClick={() => handleGagal(item)} leftIcon={<XOctagon size={15} />}>
              Gagal & Refund
            </Button>
          </div>
        )}

        {item.status_mentah === 'selesai' && (
          <div style={{ marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => handleLihatStruk(item)} leftIcon={<ReceiptText size={15} />}>
              Lihat Struk
            </Button>
          </div>
        )}

        {item.catatan_admin && (
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '12px' }}>
            Catatan: {item.catatan_admin}
          </p>
        )}
      </div>
    );
  };

  const menit = qrState ? Math.floor(qrState.secondsLeft / 60) : 0;
  const detik = qrState ? qrState.secondsLeft % 60 : 0;
  const sudahKedaluwarsa = qrState ? qrState.secondsLeft <= 0 : false;

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Verifikasi Transaksi', variant: 'blue' }]}
        title="Verifikasi Tukar Reward"
        subtitle="Member menukar reward dari rumah (koin ditahan), lalu menunjukkan kode kupon di titik pengambilan. Admin menerbitkan QR pickup dan member mengonfirmasi lewat aplikasi."
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
        {/* Pengaturan masa berlaku kupon */}
        <div style={{ ...CARD, marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
            Pengaturan Kupon
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Masa berlaku kupon reward fisik sejak diterbitkan. Kupon yang sudah terbit tidak ikut
            berubah; kupon kedaluwarsa otomatis mengembalikan koin dan stok.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '14px' }}>
            <div style={{ flex: '0 1 200px' }}>
              <Input
                type="number"
                label="Masa berlaku kupon (hari)"
                min="1"
                max="30"
                step="1"
                value={settingsDays}
                onChange={(e) => setSettingsDays(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSimpanPengaturan}
              loading={savingSettings}
              disabled={savingSettings}
            >
              Simpan Pengaturan
            </Button>
          </div>
        </div>

        {/* Pencarian kupon */}
        <div style={{ ...CARD, marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
            Validasi Kupon di Titik Pengambilan
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Minta member menyebutkan kode kuponnya (mis. LV-ABCD-2345), lalu terbitkan QR pickup
            untuk dipindai member.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '14px' }}>
            <div style={{ flex: '1 1 260px', maxWidth: '380px' }}>
              <Input
                label="Kode kupon"
                value={kuponQuery}
                onChange={(e) => setKuponQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCariKupon();
                }}
                placeholder="LV-XXXX-XXXX"
                leftIcon={<Search size={16} />}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleCariKupon}
              loading={kuponLoading}
              disabled={kuponLoading}
              leftIcon={<Ticket size={16} />}
            >
              Cari Kupon
            </Button>
          </div>

          {renderKuponCard()}
        </div>

        {/* Daftar permintaan reward */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
            Riwayat Penukaran Reward
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Menampilkan {rewardList.length} permintaan. Reward fisik memakai QR pickup; reward
            digital diproses tanpa QR.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: '1 1 260px', maxWidth: '360px' }}>
            <Input
              label="Cari permintaan"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Kode kupon atau nama member..."
              leftIcon={<Search size={16} />}
            />
          </div>

          <div style={{ flex: '0 1 220px' }}>
            <Input
              type="select"
              label="Filter status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat permintaan reward...
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
          <div style={TABLE_WRAPPER}>
            <table style={TABLE}>
              <thead>
                <tr style={HEAD_ROW}>
                  <th style={{ padding: '14px 20px' }}>Member / Kupon</th>
                  <th style={{ padding: '14px 16px' }}>Reward</th>
                  <th style={{ padding: '14px 16px' }}>Koin</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rewardList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {item.user?.name || 'Member'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        @{item.user?.username}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                          marginTop: '4px',
                        }}
                      >
                        {item.kode_klaim}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', color: '#334155' }}>
                        {item.reward?.nama_reward || '-'}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                        {TIPE_LABEL[item.reward?.tipe] || item.reward?.tipe || '-'}
                      </div>
                      {item.nomor_tujuan_digital && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                          {item.nomor_tujuan_digital}
                        </div>
                      )}
                    </td>

                    <td
                      style={{
                        padding: '14px 16px',
                        verticalAlign: 'top',
                        fontWeight: '700',
                        color: '#d97706',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCoins(item.koin_ditukar)} koin
                      {Number(item.koin_ditahan) > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500' }}>
                          ditahan
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <Badge variant={STATUS_VARIANT[item.status_mentah] || 'gray'} size="sm">
                        {STATUS_LABEL[item.status_mentah] || item.status}
                      </Badge>
                      {item.expires_at && ['pending', 'siap_diambil'].includes(item.status_mentah) && (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                          Berlaku s.d. {formatDateTime(item.expires_at)}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right', verticalAlign: 'top' }}>
                      {renderAksi(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal QR pickup */}
      <Modal
        isOpen={Boolean(qrState)}
        onClose={() => setQrState(null)}
        title="QR Pickup Reward"
        subtitle="Minta member memindai QR ini lalu menekan Konfirmasi di aplikasi."
        maxWidth="480px"
        footer={
          qrState && (
            <>
              <Button variant="ghost" onClick={() => setQrState(null)}>
                Tutup
              </Button>
              <Button variant="secondary" onClick={handleReissue} leftIcon={<RefreshCw size={14} />}>
                Terbitkan QR Baru
              </Button>
            </>
          )
        }
      >
        {qrState && (
          <div>
            <div style={{ textAlign: 'center' }}>
              {qrState.image ? (
                <img
                  src={qrState.image}
                  alt="QR pickup reward"
                  style={{
                    width: '220px',
                    height: '220px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                  }}
                />
              ) : (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {qrState.qr.payload}
                </div>
              )}

              <div style={{ marginTop: '12px' }}>
                <Badge variant={sudahKedaluwarsa ? 'danger' : 'coin'} size="md">
                  {sudahKedaluwarsa
                    ? 'QR kedaluwarsa'
                    : `Berlaku ${menit}:${String(detik).padStart(2, '0')}`}
                </Badge>
              </div>
            </div>

            <div
              style={{
                marginTop: '18px',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Kupon</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#0f172a' }}>
                  {qrState.permintaan.kode_klaim}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Member</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>
                  {qrState.permintaan.user?.name || 'Member'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Koin ditahan</span>
                <span style={{ fontWeight: '800', color: '#b45309' }}>
                  {formatCoins(qrState.permintaan.koin_ditukar)} koin
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px', lineHeight: 1.5 }}>
              Koin baru resmi dipotong setelah member menekan Konfirmasi. Jika QR kedaluwarsa,
              tekan Terbitkan QR Baru agar member dapat memindai ulang.
            </p>
          </div>
        )}
      </Modal>

      {/* Modal struk payout/pickup */}
      <Modal
        isOpen={strukLoading || Boolean(strukState)}
        onClose={() => setStrukState(null)}
        title={strukState?.judul || 'Struk Reward'}
        subtitle="Pratinjau struk yang bisa diunduh member dari riwayat aplikasi."
        maxWidth="440px"
        footer={
          <Button variant="ghost" onClick={() => setStrukState(null)}>
            Tutup
          </Button>
        }
      >
        {strukLoading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
            Memuat struk...
          </div>
        )}

        {strukState && (
          <div>
            {strukState.simulasi && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  marginBottom: '14px',
                }}
              >
                SIMULASI - TIDAK ADA PENCAIRAN UANG NYATA
              </div>
            )}

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <div style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0f172a' }}>
                  {strukState.nomor_struk}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {formatDateTime(strukState.tanggal)}
                </div>
              </div>

              {[
                ['Member', strukState.member?.nama || '-'],
                ['Reward', strukState.reward?.nama || '-'],
                ['Koin', `${formatCoins(strukState.koin)} koin`],
                ...(strukState.reward?.nilai_rupiah
                  ? [['Nilai', `Rp ${formatNumber(strukState.reward.nilai_rupiah)}`]]
                  : []),
                ...(strukState.nomor_tujuan
                  ? [['No. E-Wallet', strukState.nomor_tujuan]]
                  : []),
                ['Metode', strukState.metode],
                ['Kode Kupon', strukState.kode_klaim],
              ].map(([label, nilai]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#0f172a',
                      textAlign: 'right',
                      fontFamily: label === 'No. E-Wallet' || label === 'Kode Kupon' ? 'monospace' : undefined,
                    }}
                  >
                    {nilai}
                  </span>
                </div>
              ))}

              {strukState.catatan && (
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '10px', lineHeight: 1.5 }}>
                  {strukState.catatan}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
