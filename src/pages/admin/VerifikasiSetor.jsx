import { useState, useEffect, useMemo, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  RefreshCw,
  QrCode,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  UserRound,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { formatCoins, formatNumber } from '../../utils/helpers';
import {
  getAdminSetorSampahApi,
  createAdminSetorApi,
  reissueSetorQrApi,
  selesaikanSetorApi,
  batalkanSetorApi,
  getAdminUsersApi,
  getAdminJenisApi,
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
  pending: 'gray',
  menunggu_konfirmasi: 'coin',
  approved: 'green',
  rejected: 'danger',
};

const STATUS_LABEL = {
  pending: 'Pending',
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  approved: 'Diterima',
  rejected: 'Ditolak',
};

const STATUS_OPTIONS = [
  { label: 'Semua status', value: '' },
  { label: 'Menunggu konfirmasi', value: 'menunggu_konfirmasi' },
  { label: 'Diterima', value: 'approved' },
  { label: 'Ditolak', value: 'rejected' },
];

const ITEM_BARU = { jenis_sampah_id: '', jumlah: '' };

/**
 * Verifikasi Setor Sampah (offline direct drop-off) — /admin/verifikasi/setor
 *
 * Alur:
 * 1. Admin cari member lalu input jenis & berat sampah di drop point.
 * 2. Admin menekan "Setujui & Tampilkan QR" — koin BELUM cair.
 * 3. Member memindai QR dari aplikasi, melihat rincian, lalu menekan Konfirmasi.
 * 4. Koin cair otomatis. Bila member tidak bisa scan, admin boleh memakai
 *    "Selesaikan Tanpa Konfirmasi" (tercatat sebagai settlement_method admin).
 */
export default function VerifikasiSetor({ showToast }) {
  const confirm = useConfirm();

  const [setorList, setSetorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [jenisList, setJenisList] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [items, setItems] = useState([{ ...ITEM_BARU }]);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // { transaksi, qr, image, secondsLeft }
  const [qrState, setQrState] = useState(null);

  const loadSetorData = useCallback(() => {
    return getAdminSetorSampahApi({ status: filterStatus, search })
      .then((data) => {
        setSetorList(data);
        return data;
      })
      .catch((err) => {
        console.error(err);
        return [];
      })
      .finally(() => setLoading(false));
  }, [filterStatus, search]);

  useEffect(() => {
    loadSetorData();
  }, [loadSetorData]);

  // Debounce pencarian tabel agar tidak memanggil API tiap ketukan.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    getAdminJenisApi()
      .then(setJenisList)
      .catch((err) => console.error(err));
  }, []);

  // Pencarian member (autocomplete).
  useEffect(() => {
    const q = userQuery.trim();

    if (q.length < 2) {
      return undefined;
    }

    let aktif = true;

    const timer = setTimeout(() => {
      setUserLoading(true);

      getAdminUsersApi({ role: 'user', search: q })
        .then((data) => {
          if (aktif) setUserResults(data.slice(0, 8));
        })
        .catch(() => {
          if (aktif) setUserResults([]);
        })
        .finally(() => {
          if (aktif) setUserLoading(false);
        });
    }, 350);

    return () => {
      aktif = false;
      clearTimeout(timer);
    };
  }, [userQuery]);

  const jenisById = useMemo(
    () => Object.fromEntries(jenisList.map((jenis) => [String(jenis.id), jenis])),
    [jenisList]
  );

  const totalKoin = useMemo(
    () =>
      items.reduce((total, item) => {
        const jenis = jenisById[String(item.jenis_sampah_id)];
        const jumlah = Number(item.jumlah);

        if (!jenis || !Number.isFinite(jumlah) || jumlah <= 0) return total;

        return total + Number(jenis.koin_per_satuan) * jumlah;
      }, 0),
    [items, jenisById]
  );

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

  const openQr = useCallback(async (transaksi, qr) => {
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

    setQrState({ transaksi, qr, image, secondsLeft: qr.expires_in });
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadSetorData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} transaksi setor.`, 'success');
    });
  };

  const updateItem = (index, patch) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const tambahItem = () => setItems((prev) => [...prev, { ...ITEM_BARU }]);

  const hapusItem = (index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const resetForm = () => {
    setSelectedUser(null);
    setUserQuery('');
    setUserResults([]);
    setItems([{ ...ITEM_BARU }]);
    setCatatan('');
  };

  const handleCreate = async () => {
    if (!selectedUser) {
      if (showToast) showToast('Pilih member terlebih dahulu.', 'error');
      return;
    }

    const itemsBersih = items
      .filter((item) => item.jenis_sampah_id && Number(item.jumlah) > 0)
      .map((item) => ({
        jenis_sampah_id: Number(item.jenis_sampah_id),
        jumlah: Number(item.jumlah),
      }));

    if (itemsBersih.length === 0) {
      if (showToast) showToast('Isi minimal satu jenis sampah dengan berat lebih dari 0.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const res = await createAdminSetorApi({
        user_id: selectedUser.id,
        items: itemsBersih,
        catatan: catatan.trim() || undefined,
      });

      await openQr(res.data.transaksi, res.data.qr);
      resetForm();
      loadSetorData();
      window.dispatchEvent(new Event('livora:stats-changed'));

      if (showToast) {
        showToast('Transaksi setor dibuat. Minta member memindai QR untuk konfirmasi.', 'success');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal membuat transaksi setor.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowQr = async (item) => {
    try {
      const res = await reissueSetorQrApi(item.id);
      await openQr(res.data.transaksi, res.data.qr);
      loadSetorData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menerbitkan QR.', 'error');
    }
  };

  const handleReissue = async () => {
    if (!qrState) return;

    try {
      const res = await reissueSetorQrApi(qrState.transaksi.id);
      await openQr(res.data.transaksi, res.data.qr);
      loadSetorData();
      if (showToast) showToast('QR baru diterbitkan. Token lama tidak berlaku lagi.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menerbitkan QR baru.', 'error');
    }
  };

  const handleSelesaikan = async (transaksi) => {
    const ok = await confirm({
      title: 'Selesaikan tanpa konfirmasi?',
      message:
        'Koin akan langsung dicairkan ke wallet member tanpa scan QR. Tindakan ini tercatat sebagai penyelesaian oleh admin.',
      confirmText: 'Selesaikan',
    });

    if (!ok) return;

    try {
      await selesaikanSetorApi(transaksi.id);
      setQrState(null);
      loadSetorData();
      window.dispatchEvent(new Event('livora:stats-changed'));
      if (showToast) showToast('Transaksi selesai. Koin sudah dicairkan.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyelesaikan transaksi.', 'error');
    }
  };

  const handleBatalkan = async (transaksi) => {
    const alasan = await confirm({
      title: 'Batalkan transaksi setor?',
      message: 'Koin tidak akan dicairkan. Alasan ini tersimpan pada transaksi.',
      withInput: true,
      inputLabel: 'Alasan pembatalan',
      inputPlaceholder: 'Tulis alasan yang jelas untuk member...',
      defaultValue: 'Sampah tidak sesuai kriteria atau kondisi tidak layak daur ulang.',
      confirmText: 'Batalkan Transaksi',
      danger: true,
    });

    if (!alasan) return;

    try {
      await batalkanSetorApi(transaksi.id, alasan.trim());
      if (qrState && qrState.transaksi.id === transaksi.id) setQrState(null);
      loadSetorData();
      if (showToast) showToast('Transaksi setor dibatalkan.', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal membatalkan transaksi.', 'error');
    }
  };

  const hitungSubtotal = (item) => {
    const jenis = jenisById[String(item.jenis_sampah_id)];
    const jumlah = Number(item.jumlah);

    if (!jenis || !Number.isFinite(jumlah) || jumlah <= 0) return null;

    return Number(jenis.koin_per_satuan) * jumlah;
  };

  const formatRincian = (detail) => {
    const jenis = detail.jenisSampah || detail.jenis_sampah || {};
    const nama = jenis.nama_jenis || jenis.jenis_sampah || 'Sampah';
    const satuan = jenis.satuan || '';

    return `${nama} — ${formatNumber(detail.jumlah)} ${satuan}`.trim();
  };

  const renderAksi = (item) => {
    const status = item.status_mentah;

    if (status === 'menunggu_konfirmasi') {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleShowQr(item)}
            leftIcon={<QrCode size={14} />}
          >
            Tampilkan QR
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSelesaikan(item)}
            leftIcon={<CheckCircle2 size={14} />}
          >
            Selesaikan
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

    if (status === 'pending') {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSelesaikan(item)}
            leftIcon={<CheckCircle2 size={14} />}
          >
            Selesaikan
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

    return (
      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
        {status === 'approved' ? 'Koin sudah dicairkan' : 'Tidak dicairkan'}
      </span>
    );
  };

  const menit = qrState ? Math.floor(qrState.secondsLeft / 60) : 0;
  const detik = qrState ? qrState.secondsLeft % 60 : 0;
  const sudahKedaluwarsa = qrState ? qrState.secondsLeft <= 0 : false;

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Verifikasi Transaksi', variant: 'blue' }]}
        title="Verifikasi Setor Sampah"
        subtitle="Admin menginput jenis dan berat sampah di drop point, lalu member memindai QR untuk mengonfirmasi nominal sebelum koin dicairkan."
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
        {/* Form transaksi baru */}
        <div style={{ ...CARD, marginBottom: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
              Buat Transaksi Setor
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Cari member, masukkan jenis dan berat sampah, lalu setujui untuk menampilkan QR
              konfirmasi.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {/* Pilih member */}
            <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                1. Pilih Member
              </h3>

              {selectedUser ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '9999px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      flexShrink: 0,
                    }}
                  >
                    {selectedUser.name?.charAt(0)?.toUpperCase() || <UserRound size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{selectedUser.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      @{selectedUser.username}
                      {selectedUser.email ? ` · ${selectedUser.email}` : ''}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)}>
                    Ganti
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    label="Cari nama, username, atau email"
                    value={userQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserQuery(value);

                      if (value.trim().length < 2) {
                        setUserResults([]);
                        setUserLoading(false);
                      }
                    }}
                    placeholder="Ketik minimal 2 karakter..."
                    leftIcon={<Search size={16} />}
                  />

                  <div style={{ marginTop: '-6px' }}>
                    {userLoading && (
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '4px 0' }}>
                        Mencari member...
                      </div>
                    )}

                    {!userLoading && userQuery.trim().length >= 2 && userResults.length === 0 && (
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '4px 0' }}>
                        Member tidak ditemukan.
                      </div>
                    )}

                    {userResults.length > 0 && (
                      <div
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          overflow: 'hidden',
                        }}
                      >
                        {userResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserResults([]);
                              setUserQuery('');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              width: '100%',
                              padding: '10px 12px',
                              border: 'none',
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: '#ffffff',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            <UserRound size={16} color="#16a34a" />
                            <span style={{ flex: 1 }}>
                              <span style={{ display: 'block', fontWeight: '600', color: '#0f172a' }}>
                                {user.name}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                                @{user.username}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div style={{ marginTop: '14px' }}>
                <Input
                  label="Catatan (opsional)"
                  type="textarea"
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Mis. sampah sudah dipilah di rumah."
                />
              </div>
            </div>

            {/* Item sampah */}
            <div style={{ flex: '1 1 360px', minWidth: '280px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                2. Jenis & Berat Sampah
              </h3>

              {items.map((item, index) => {
                const jenis = jenisById[String(item.jenis_sampah_id)];
                const subtotal = hitungSubtotal(item);

                return (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) 120px 36px',
                      gap: '10px',
                      alignItems: 'start',
                    }}
                  >
                    <Input
                      type="select"
                      label={index === 0 ? 'Jenis sampah' : undefined}
                      value={item.jenis_sampah_id}
                      onChange={(e) => updateItem(index, { jenis_sampah_id: e.target.value })}
                      options={[
                        { label: 'Pilih jenis...', value: '' },
                        ...jenisList.map((j) => ({
                          label: `${j.nama_jenis} (${j.satuan}) — ${formatCoins(j.koin_per_satuan)} koin/${j.satuan}`,
                          value: String(j.id),
                        })),
                      ]}
                    />

                    <Input
                      type="number"
                      label={index === 0 ? `Jumlah${jenis ? ` (${jenis.satuan})` : ''}` : undefined}
                      step="0.01"
                      min="0.01"
                      value={item.jumlah}
                      onChange={(e) => updateItem(index, { jumlah: e.target.value })}
                      placeholder="0"
                      helperText={subtotal !== null ? `${formatCoins(subtotal)} koin` : ''}
                    />

                    <div style={{ marginTop: index === 0 ? '28px' : 0 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => hapusItem(index)}
                        disabled={items.length === 1}
                        aria-label="Hapus baris"
                        title="Hapus baris"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Button size="sm" variant="secondary" onClick={tambahItem} leftIcon={<Plus size={14} />}>
                Tambah Jenis
              </Button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '18px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: '600' }}>
                    TOTAL KOIN
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#b45309' }}>
                    {formatCoins(totalKoin)} koin
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={submitting}
                  disabled={!selectedUser || submitting}
                  leftIcon={<QrCode size={17} />}
                >
                  Setujui & Tampilkan QR
                </Button>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '10px' }}>
                Koin belum cair saat tombol ini ditekan. Member harus memindai QR dan menekan
                Konfirmasi di aplikasi.
              </p>
            </div>
          </div>
        </div>

        {/* Daftar transaksi */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
            Riwayat Transaksi Setor
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Menampilkan {setorList.length} transaksi. Menampilkan QR akan menerbitkan token baru
            dan mematikan token sebelumnya.
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
              label="Cari transaksi"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Kode transaksi atau nama member..."
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
            Memuat transaksi setor...
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
            Belum ada transaksi setor.
          </div>
        ) : (
          <div style={TABLE_WRAPPER}>
            <table style={TABLE}>
              <thead>
                <tr style={HEAD_ROW}>
                  <th style={{ padding: '14px 20px' }}>Member / Kode</th>
                  <th style={{ padding: '14px 16px' }}>Rincian Sampah</th>
                  <th style={{ padding: '14px 16px' }}>Total Koin</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {setorList.map((item) => (
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
                        {item.kode_transaksi}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      {Array.isArray(item.details) && item.details.length > 0 ? (
                        item.details.map((detail) => (
                          <div key={detail.id} style={{ marginBottom: '4px' }}>
                            <div style={{ fontWeight: '600', color: '#334155' }}>
                              {formatRincian(detail)}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                              {formatCoins(detail.koin_subtotal)} koin
                            </div>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8' }}>
                          {item.jenis_sampah || item.nilai_tukar?.jenis_sampah || '-'}
                        </span>
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
                      +{formatCoins(item.total_koin)} koin
                    </td>

                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <Badge variant={STATUS_VARIANT[item.status_mentah] || 'gray'} size="sm">
                        {STATUS_LABEL[item.status_mentah] || item.status}
                      </Badge>
                      {item.settlement_method && (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                          {item.settlement_method === 'admin' ? 'Oleh admin' : 'Konfirmasi QR'}
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

      {/* Modal QR */}
      <Modal
        isOpen={Boolean(qrState)}
        onClose={() => setQrState(null)}
        title="QR Konfirmasi Setoran"
        subtitle="Minta member memindai QR ini dari aplikasi Livora."
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
              <Button
                variant="coin"
                onClick={() => handleSelesaikan(qrState.transaksi)}
                leftIcon={<CheckCircle2 size={14} />}
              >
                Selesaikan Tanpa Konfirmasi
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
                  alt="QR konfirmasi setoran"
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
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Kode</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#0f172a' }}>
                  {qrState.transaksi.kode_transaksi}
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
                  {qrState.transaksi.user?.name || 'Member'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Total koin</span>
                <span style={{ fontWeight: '800', color: '#b45309' }}>
                  {formatCoins(qrState.transaksi.total_koin)} koin
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px', lineHeight: 1.5 }}>
              Koin baru cair setelah member menekan Konfirmasi. Jika QR kedaluwarsa, tekan
              Terbitkan QR Baru agar member dapat memindai ulang.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
