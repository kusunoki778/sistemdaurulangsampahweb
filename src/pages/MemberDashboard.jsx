import { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  Recycle,
  Crown,
  Clock,
  Gift,
  ArrowDownLeft,
  ArrowUpRight,
  UserCog,
  PlusCircle,
  Copy,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import Tabs from '../components/common/Tabs';
import { useAuth } from '../hooks/useAuth';
import { formatCoins, formatNumber, formatDate } from '../utils/helpers';
import { getNilaiTukarApi, submitSetorSampahApi, getSetorHistoryApi } from '../api/waste';
import { getRedeemHistoryApi } from '../api/reward';
import { getTransaksiApi } from '../api/transaction';
import { updateProfileApi } from '../api/auth';

const TIER_CONFIG = {
  Bronze: { color: '#b45309', bg: '#fef3c7', border: '#fde68a', min: 0, next: 25 },
  Silver: { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', min: 25, next: 100 },
  Gold: { color: '#92400e', bg: '#fef3c7', border: '#f59e0b', min: 100, next: null },
};

function statusBadge(status) {
  const map = {
    Pending: 'coin',
    Diterima: 'green',
    Ditolak: 'danger',
    Selesai: 'green',
  };
  return map[status] || 'gray';
}

const tableHeaderStyle = {
  padding: '13px 16px',
  textAlign: 'left',
  fontSize: '0.78rem',
  fontWeight: '700',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  whiteSpace: 'nowrap',
};

const tableCellStyle = {
  padding: '14px 16px',
  fontSize: '0.9rem',
  color: '#334155',
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'middle',
};

export default function MemberDashboard({ onNavigate, showToast }) {
  const { user, refreshUser, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('ringkasan');
  const [stats, setStats] = useState({ setor: [], reward: [], transaksi: [] });
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Form setor sampah
  const [wasteTypes, setWasteTypes] = useState([]);
  const [setorForm, setSetorForm] = useState({ nilai_tukar_id: '', jumlah: '' });
  const [submitting, setSubmitting] = useState(false);

  // Form edit profil — state null berarti "pakai data terbaru dari user"
  // (reset dengan setProfileForm(null) setelah simpan berhasil).
  const [profileForm, setProfileForm] = useState(null);
  const profileValues = profileForm || {
    name: user?.name || '',
    no_hp: user?.no_hp || '',
    password: '',
  };
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Tier dihitung backend hanya dari total_sampah_kg (lihat User::getStatusMemberAttribute).
  const tier = user?.status_member || 'Bronze';
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.Bronze;
  const totalAktivitas = Number(user?.sampah_terkumpul_kg || 0);

  // Muat ringkasan: state hanya diubah di dalam callback .then()
  // sehingga aman dipanggil dari useEffect (react-hooks/set-state-in-effect).
  const loadOverview = useCallback(
    () =>
      Promise.all([
        getSetorHistoryApi().catch(() => []),
        getRedeemHistoryApi().catch(() => []),
        getTransaksiApi().catch(() => []),
      ]).then(([setor, reward, transaksi]) => {
        setStats({ setor, reward, transaksi });
        setLoading(false);
      }),
    []
  );

  useEffect(() => {
    loadOverview();
    getNilaiTukarApi()
      .then((data) => {
        setWasteTypes(data);
        if (data.length > 0) {
          setSetorForm((prev) => ({
            ...prev,
            nilai_tukar_id: prev.nilai_tukar_id || String(data[0].id),
          }));
        }
      })
      .catch(() => setWasteTypes([]));
  }, [loadOverview]);

  const refreshTab = async () => {
    setTabLoading(true);
    await loadOverview();
    setTabLoading(false);
  };

  /* --------------------------- AKSI: SETOR SAMPAH --------------------------- */
  const handleSubmitSetor = async (e) => {
    e.preventDefault();
    if (!setorForm.nilai_tukar_id || !setorForm.jumlah || Number(setorForm.jumlah) <= 0) {
      showToast?.('Isi jenis sampah dan jumlahnya terlebih dahulu.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const item = wasteTypes.find((w) => String(w.id) === String(setorForm.nilai_tukar_id));
      await submitSetorSampahApi({
        nilai_tukar_id: Number(setorForm.nilai_tukar_id),
        jumlah: Number(setorForm.jumlah),
      });
      showToast?.(
        `Pengajuan setor ${setorForm.jumlah} ${item?.satuan || ''} ${item?.jenis_sampah || ''} terkirim! Menunggu verifikasi admin.`,
        'success'
      );
      setSetorForm((prev) => ({ ...prev, jumlah: '' }));
      await refreshTab();
      setActiveTab('riwayat-setor');
    } catch (err) {
      showToast?.(err.message || 'Gagal mengajukan setor sampah.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------- AKSI: EDIT PROFIL ---------------------------- */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // Backend menerima field `phone` (bukan no_hp); `alamat` tidak ada di tabel users.
      const payload = {
        name: profileValues.name,
        phone: profileValues.no_hp,
      };
      if (profileValues.password) payload.password = profileValues.password;

      const res = await updateProfileApi(payload);
      const updated = res?.data?.user;
      if (updated) updateUser(updated);
      else await refreshUser();

      // Reset form → tampilkan data profil terbaru dari server.
      setProfileForm(null);
      showToast?.('Profil berhasil diperbarui!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Gagal memperbarui profil.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast?.(`Kode voucher ${code} tersalin!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  /* --------------------------------- TAB LIST -------------------------------- */
  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan', icon: <Wallet size={17} /> },
    { id: 'setor', label: 'Ajukan Setor', icon: <PlusCircle size={17} /> },
    { id: 'riwayat-setor', label: 'Riwayat Setor', icon: <Recycle size={17} />, count: stats.setor.length },
    { id: 'riwayat-reward', label: 'Penukaran Hadiah', icon: <Gift size={17} />, count: stats.reward.length },
    { id: 'mutasi', label: 'Mutasi Koin', icon: <Coins size={17} />, count: stats.transaksi.length },
    { id: 'profil', label: 'Edit Profil', icon: <UserCog size={17} /> },
  ];

  /* ================================ RINGKASAN =============================== */
  const renderRingkasan = () => {
    const pendingSetor = stats.setor.filter((s) => s.status === 'Pending').length;
    const pendingReward = stats.reward.filter((r) => r.status === 'Pending').length;
    const progress =
      tierCfg.next === null
        ? 100
        : Math.min(100, Math.max(0, ((totalAktivitas - tierCfg.min) / (tierCfg.next - tierCfg.min)) * 100));

    const cards = [
      {
        label: 'Saldo Koin',
        value: formatCoins(user?.saldo_koin ?? 0),
        suffix: 'KOIN',
        icon: <Coins size={24} />,
        bg: '#fef3c7',
        color: '#b45309',
        note: 'Tukar dengan reward pilihan Anda',
      },
      {
        label: 'Total Sampah Terkumpul',
        value: formatNumber(user?.sampah_terkumpul_kg ?? 0),
        suffix: 'KG',
        icon: <Recycle size={24} />,
        bg: '#dcfce7',
        color: '#15803d',
        note: 'Sampah anorganik & kertas',
      },
      {
        label: 'Total Penukaran Reward',
        value: formatNumber(stats.reward.length),
        suffix: 'REWARD',
        icon: <Gift size={24} />,
        bg: '#faf5ff',
        color: '#7e22ce',
        note: 'Sejak akun dibuat',
      },
      {
        label: 'Menunggu Verifikasi',
        value: formatNumber(pendingSetor + pendingReward),
        suffix: 'ANTRE',
        icon: <Clock size={24} />,
        bg: '#f1f5f9',
        color: '#475569',
        note: `${pendingSetor} setor • ${pendingReward} penukaran`,
      },
    ];

    return (
      <div>
        {/* Grid kartu statistik */}
        <div className="grid grid-cols-4 md-grid-cols-1 gap-5" style={{ marginBottom: '24px' }}>
          {cards.map((c) => (
            <Card key={c.label} hover style={{ position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '-18px',
                  right: '-18px',
                  width: '78px',
                  height: '78px',
                  borderRadius: '50%',
                  backgroundColor: c.bg,
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '13px',
                  backgroundColor: c.bg,
                  color: c.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  position: 'relative',
                }}
              >
                {c.icon}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {c.label}
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: c.color, lineHeight: 1.2, marginTop: '4px' }}>
                {c.value}{' '}
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{c.suffix}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{c.note}</div>
            </Card>
          ))}
        </div>

        {/* Tier membership */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '15px',
                  backgroundColor: tierCfg.bg,
                  border: `1.5px solid ${tierCfg.border}`,
                  color: tierCfg.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Crown size={26} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                  Tier Membership
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: tierCfg.color }}>
                  {tier} Member
                </div>
              </div>
            </div>
            <Badge variant={tier === 'Gold' ? 'coin' : tier === 'Silver' ? 'gray' : 'coin'} icon={<Crown size={13} />}>
              {tierCfg.next === null ? 'Tier Tertinggi Tercapai' : `Target berikutnya: ${tierCfg.next} kg`}
            </Badge>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                height: '12px',
                borderRadius: '9999px',
                backgroundColor: '#f1f5f9',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  backgroundColor: '#16a34a',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
              <span>Bronze → Silver (25 kg)</span>
              <span style={{ fontWeight: '700', color: '#334155' }}>
                {formatNumber(totalAktivitas)} kg terkumpul
              </span>
              <span>Silver → Gold (100 kg)</span>
            </div>
          </div>
        </Card>

        {/* Aksi cepat */}
        <div className="grid grid-cols-3 md-grid-cols-1 gap-5">
          <Card hover onClick={() => setActiveTab('setor')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>Ajukan Setor Sampah</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Drop-off mandiri ke drop point</div>
              </div>
            </div>
          </Card>

          <Card hover onClick={() => onNavigate('reward')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>Tukar Koin → Reward</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Barang, voucher, atau saldo digital</div>
              </div>
            </div>
          </Card>

          <Card hover onClick={() => onNavigate('katalog-sampah')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Recycle size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>Kalkulator Sampah</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Simulasi koin sebelum setor</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  /* ============================== FORM SETOR ================================ */
  const renderSetor = () => {
    const selectedItem = wasteTypes.find((w) => String(w.id) === String(setorForm.nilai_tukar_id));
    const estimasi =
      selectedItem && setorForm.jumlah
        ? Math.round(selectedItem.koin_per_satuan * Number(setorForm.jumlah))
        : 0;

    return (
      <div className="grid grid-cols-2 md-grid-cols-1 gap-5">
        <Card>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            Form Pengajuan Setor Sampah
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
            Isi data sampah yang akan Anda serahkan. Pengajuan akan diverifikasi admin di drop
            point — koin masuk otomatis setelah disetujui.
          </p>

          <form onSubmit={handleSubmitSetor}>
            <Input
              label="Jenis Sampah"
              type="select"
              value={setorForm.nilai_tukar_id}
              onChange={(e) => setSetorForm({ ...setorForm, nilai_tukar_id: e.target.value })}
              required
              options={wasteTypes.map((w) => ({
                value: String(w.id),
                label: `${w.jenis_sampah} — ${w.koin_per_satuan} koin/${w.satuan}`,
              }))}
            />

            <Input
              label={`Jumlah (${selectedItem?.satuan || 'satuan'})`}
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Contoh: 5"
              value={setorForm.jumlah}
              onChange={(e) => setSetorForm({ ...setorForm, jumlah: e.target.value })}
              required
              helperText="Minimal 0.1 satuan. Pastikan data sesuai dengan timbangan di drop point."
            />

            <div
              style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <span style={{ fontSize: '0.88rem', color: '#92400e', fontWeight: '600' }}>
                Estimasi Koin Didapat
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#b45309' }}>
                +{formatCoins(estimasi)} Koin
              </span>
            </div>

            <Button type="submit" variant="primary" loading={submitting} style={{ width: '100%' }} leftIcon={<Recycle size={18} />}>
              Kirim Pengajuan Setor
            </Button>
          </form>
        </Card>

        <Card style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#15803d', marginBottom: '14px' }}>
            Alur Penyetoran
          </h4>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '18px', color: '#334155', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <li>
              <strong>Ajukan permintaan</strong> — pilih jenis & jumlah sampah di form sebelah.
            </li>
            <li>
              <strong>Bawa sampah ke drop point</strong> — tunjukkan riwayat pengajuan ke petugas.
            </li>
            <li>
              <strong>Admin memverifikasi</strong> — timbang ulang & konfirmasi di panel admin.
            </li>
            <li>
              <strong>Koin masuk otomatis</strong> — saldo bertambah dan tercatat di mutasi koin.
            </li>
          </ol>

          <div
            style={{
              marginTop: '22px',
              padding: '14px',
              backgroundColor: '#ffffff',
              border: '1px dashed #86efac',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: '#15803d',
            }}
          >
            <strong>Tips:</strong> Pilah dan keringkan sampah sebelum dibawa ke drop point.
            Kondisi sampah menentukan hasil timbangan saat verifikasi admin.
          </div>
        </Card>
      </div>
    );
  };

  /* =========================== RIWAYAT SETOR ================================ */
  const renderRiwayatSetor = () => (
    <Card padding="0">
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Riwayat Setor Sampah</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Semua pengajuan drop-off beserta status verifikasi admin.</p>
        </div>
        <Button size="sm" variant="secondary" onClick={refreshTab} loading={tabLoading}>
          Muat Ulang
        </Button>
      </div>

      {tabLoading && stats.setor.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat riwayat...</div>
      ) : stats.setor.length === 0 ? (
        <EmptyState
          title="Belum ada pengajuan setor sampah"
          message="Ajukan setoran pertama Anda lewat tab Ajukan Setor."
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Tanggal</th>
                <th style={tableHeaderStyle}>Jenis Sampah</th>
                <th style={tableHeaderStyle}>Jumlah</th>
                <th style={tableHeaderStyle}>Estimasi Koin</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Keterangan Admin</th>
              </tr>
            </thead>
            <tbody>
              {stats.setor.map((item) => (
                <tr key={item.id}>
                  <td style={tableCellStyle}>{formatDate(item.created_at)}</td>
                  <td style={{ ...tableCellStyle, fontWeight: '600', color: '#0f172a' }}>{item.jenis_sampah}</td>
                  <td style={tableCellStyle}>
                    {formatNumber(item.jumlah)} {item.satuan}
                  </td>
                  <td style={{ ...tableCellStyle, fontWeight: '700', color: '#b45309' }}>
                    +{formatCoins(item.koin_estimasi)}
                  </td>
                  <td style={tableCellStyle}>
                    <Badge variant={statusBadge(item.status)} size="sm">{item.status}</Badge>
                  </td>
                  <td style={{ ...tableCellStyle, fontSize: '0.82rem', color: '#64748b', maxWidth: '260px' }}>
                    {item.alasan_admin || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  /* ========================= RIWAYAT PENUKARAN ============================== */
  const renderRiwayatReward = () => (
    <Card padding="0">
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Riwayat Penukaran Hadiah</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Kode klaim &amp; status verifikasi reward oleh admin.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm" variant="secondary" onClick={refreshTab} loading={tabLoading}>
            Muat Ulang
          </Button>
          <Button size="sm" variant="coin" onClick={() => onNavigate('reward')} leftIcon={<Gift size={15} />}>
            Tukar Koin
          </Button>
        </div>
      </div>

      {tabLoading && stats.reward.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat riwayat...</div>
      ) : stats.reward.length === 0 ? (
        <EmptyState
          title="Belum pernah menukarkan koin"
          message="Buka katalog reward untuk melihat pilihan yang bisa Anda tukar."
        />
      ) : (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stats.reward.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                backgroundColor: item.status === 'Ditolak' ? '#fef2f2' : '#ffffff',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Gift size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.reward?.nama_reward || 'Reward'}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {formatDate(item.created_at)} • <strong style={{ color: '#b45309' }}>-{formatCoins(item.koin_terpakai)} koin</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    {item.catatan_admin || ''}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <Badge variant={statusBadge(item.status)} size="sm">{item.status}</Badge>
                {item.kode_voucher && (
                  <button
                    onClick={() => handleCopy(item.kode_voucher)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      color: '#15803d',
                    }}
                    title="Klik untuk salin kode"
                  >
                    {item.kode_voucher}
                    {copiedCode === item.kode_voucher ? <CheckCircle2 size={15} color="#16a34a" /> : <Copy size={15} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  /* ============================ MUTASI KOIN ================================= */
  const renderMutasi = () => {
    const totalMasuk = stats.transaksi
      .filter((t) => Number(t.jumlah_koin) > 0)
      .reduce((sum, t) => sum + Number(t.jumlah_koin), 0);
    const totalKeluar = stats.transaksi
      .filter((t) => Number(t.jumlah_koin) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.jumlah_koin)), 0);

    return (
      <div>
        <div className="grid grid-cols-2 md-grid-cols-1 gap-5" style={{ marginBottom: '20px' }}>
          <Card style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowDownLeft size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>
                  Total Koin Masuk
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#15803d' }}>
                  +{formatCoins(totalMasuk)}
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowUpRight size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#b91c1c', textTransform: 'uppercase' }}>
                  Total Koin Keluar
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b91c1c' }}>
                  -{formatCoins(totalKeluar)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="0">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Riwayat Mutasi Koin</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Catatan otomatis setiap pemasukan & pengeluaran koin.</p>
          </div>

          {tabLoading && stats.transaksi.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat mutasi...</div>
          ) : stats.transaksi.length === 0 ? (
            <EmptyState title="Belum ada transaksi koin" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Tanggal</th>
                    <th style={tableHeaderStyle}>Jenis</th>
                    <th style={tableHeaderStyle}>Keterangan</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Jumlah Koin</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.transaksi.map((t) => {
                    const isMasuk = Number(t.jumlah_koin) > 0;
                    return (
                      <tr key={t.id}>
                        <td style={tableCellStyle}>{formatDate(t.created_at)}</td>
                        <td style={tableCellStyle}>
                          <Badge variant={isMasuk ? 'green' : 'danger'} size="sm">
                            {t.jenis_transaksi}
                          </Badge>
                        </td>
                        <td style={tableCellStyle}>{t.deskripsi}</td>
                        <td
                          style={{
                            ...tableCellStyle,
                            textAlign: 'right',
                            fontWeight: '800',
                            color: isMasuk ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {isMasuk ? '+' : '-'}
                          {formatCoins(Math.abs(Number(t.jumlah_koin)))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  };

  /* ============================== EDIT PROFIL =============================== */
  const renderProfil = () => (
    <div className="grid grid-cols-2 md-grid-cols-1 gap-5">
      <Card>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
          Edit Profil Pengguna
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
          Perbarui data diri Anda. Kosongkan kolom password jika tidak ingin mengganti password.
        </p>

        <form onSubmit={handleSaveProfile}>
          <Input
            label="Nama Lengkap"
            name="name"
            value={profileValues.name}
            onChange={(e) => setProfileForm({ ...profileValues, name: e.target.value })}
            required
          />
          <Input
            label="Username"
            value={user?.username || ''}
            disabled
            helperText="Username tidak dapat diubah."
          />
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            helperText="Email terdaftar tidak dapat diubah."
          />
          <Input
            label="Nomor WhatsApp / HP"
            name="no_hp"
            value={profileValues.no_hp}
            onChange={(e) => setProfileForm({ ...profileValues, no_hp: e.target.value })}
            placeholder="08123456789"
          />
          <Input
            label="Password Baru (opsional)"
            type="password"
            name="password"
            value={profileValues.password}
            onChange={(e) => setProfileForm({ ...profileValues, password: e.target.value })}
            placeholder="Biarkan kosong jika tidak diganti"
          />

          <Button type="submit" variant="primary" loading={savingProfile} style={{ width: '100%' }}>
            Simpan Perubahan
          </Button>
        </form>
      </Card>

      <Card style={{ alignSelf: 'start' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          Kartu Anggota
        </h4>
        <div
          style={{
            backgroundColor: '#16a34a',
            borderRadius: '18px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 15px 30px -15px rgba(22, 163, 74, 0.6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.85 }}>
              Livora Member Card
            </span>
            <Crown size={22} color="#fef3c7" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '16px' }}>{user?.name}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>@{user?.username}</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '22px', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>Saldo Koin</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{formatCoins(user?.saldo_koin ?? 0)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>Tier</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fef3c7' }}>{tier}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.87rem', color: '#475569' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Email</span>
            <strong style={{ color: '#0f172a' }}>{user?.email}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>No. HP</span>
            <strong style={{ color: '#0f172a' }}>{user?.no_hp || '-'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Role</span>
            <Badge variant="blue" size="sm">Member</Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  /* --------------------------------- RENDER --------------------------------- */
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', paddingBottom: '80px' }}>
      {/* Header */}
      <section
        style={{
          backgroundColor: '#f0fdf4',
          paddingTop: '44px',
          paddingBottom: '30px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="container">
          <Badge variant="green" size="md" style={{ marginBottom: '12px' }} icon={<Wallet size={14} />}>
            Area Member
          </Badge>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Halo, <span style={{ color: '#16a34a' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '640px', marginTop: '8px' }}>
            Pantau saldo koin, ajukan setor sampah, dan tukar koin dengan reward pilihan Anda dalam
            satu tempat.
          </p>
        </div>
      </section>

      <div className="container" style={{ marginTop: '28px' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div style={{ marginTop: '28px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              Memuat dashboard...
            </div>
          ) : activeTab === 'ringkasan' ? (
            renderRingkasan()
          ) : activeTab === 'setor' ? (
            renderSetor()
          ) : activeTab === 'riwayat-setor' ? (
            renderRiwayatSetor()
          ) : activeTab === 'riwayat-reward' ? (
            renderRiwayatReward()
          ) : activeTab === 'mutasi' ? (
            renderMutasi()
          ) : (
            renderProfil()
          )}
        </div>
      </div>
    </div>
  );
}
