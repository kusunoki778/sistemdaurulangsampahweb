import { useState, useEffect } from 'react';
import {
  Coins,
  Calculator,
  Search,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import PageHeader from '../components/common/PageHeader';
import ChipFilter from '../components/common/ChipFilter';
import EmptyState from '../components/common/EmptyState';
import { getNilaiTukarApi, calculateWasteCoinsApi } from '../api/waste';
import { formatCoins, getWasteTypeVisual } from '../utils/helpers';

/**
 * Katalog sampah publik + kalkulator koin manual (tombol Hitung).
 * Web hanya menampilkan edukasi & harga: penyetoran dilakukan langsung di
 * drop point, sedangkan katalog hadiah/penukaran koin hanya lewat Aplikasi
 * Mobile Livora. Filter kategori & pencarian dari master /jenis-sampah.
 */
export default function WasteCatalog({ showToast }) {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter kategori & pencarian
  const [selectedKategori, setSelectedKategori] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculator states
  const [selectedWasteId, setSelectedWasteId] = useState('');
  const [inputAmount, setInputAmount] = useState('5');
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const data = await getNilaiTukarApi();
        setWasteTypes(data);
        if (data.length > 0) {
          setSelectedWasteId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load waste types:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Hitung estimasi koin hanya saat tombol "Hitung" ditekan.
  // Hasil lama dibersihkan langsung di handler ketika input berubah.
  const handleCalculate = async () => {
    if (!selectedWasteId || !inputAmount || isNaN(inputAmount) || Number(inputAmount) <= 0) {
      if (showToast) showToast('Pilih jenis sampah dan masukkan jumlah yang valid.', 'error');
      return;
    }

    setCalcLoading(true);
    try {
      const res = await calculateWasteCoinsApi(selectedWasteId, inputAmount);
      setCalcResult(res);
    } catch {
      // Fallback perhitungan lokal bila API bermasalah
      const item = wasteTypes.find((w) => w.id === Number(selectedWasteId));
      if (item) {
        const coins = Math.round(item.koin_per_satuan * Number(inputAmount));
        setCalcResult({
          jenis_sampah: item.jenis_sampah,
          satuan: item.satuan,
          jumlah: Number(inputAmount),
          koin_per_satuan: item.koin_per_satuan,
          estimasi_koin: coins,
        });
      }
    } finally {
      setCalcLoading(false);
    }
  };

  // Opsi chip kategori dibangun dari data master (hanya kategori yang punya item)
  const kategoriOptions = [...new Set(wasteTypes.map((w) => w.kategori?.nama_kategori).filter(Boolean))].map(
    (nama) => ({ id: nama, label: nama })
  );

  const query = searchTerm.trim().toLowerCase();
  const filteredTypes = wasteTypes.filter((item) => {
    const matchKategori =
      selectedKategori === 'semua' || (item.kategori?.nama_kategori || '') === selectedKategori;
    const matchSearch =
      !query ||
      item.jenis_sampah.toLowerCase().includes(query) ||
      (item.deskripsi || '').toLowerCase().includes(query);
    return matchKategori && matchSearch;
  });

  const handleResetFilter = () => {
    setSelectedKategori('semua');
    setSearchTerm('');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', paddingBottom: '80px' }}>
      {/* Header standar + filter kategori & pencarian */}
      <PageHeader
        eyebrow="Transparansi Harga & Nilai Tukar"
        title={
          <>
            Katalog Sampah & <span style={{ color: '#16a34a' }}>Nilai Tukar Koin</span>
          </>
        }
        subtitle="Daftar jenis sampah anorganik dan minyak jelantah yang diterima Livora, lengkap dengan nilai koin per satuannya. Setor dilakukan langsung di drop point — sampah ditimbang di tempat, koin masuk setelah verifikasi admin."
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <ChipFilter
            options={kategoriOptions}
            value={selectedKategori}
            onChange={setSelectedKategori}
          />
          <div style={{ flex: '1 1 240px', maxWidth: '300px' }}>
            <Input
              type="search"
              placeholder="Cari jenis sampah..."
              aria-label="Cari jenis sampah"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>
      </PageHeader>

      {/* Main Content Layout */}
      <div className="container" style={{ marginTop: '40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.9fr',
            gap: '32px',
            alignItems: 'start',
          }}
          className="md-grid-cols-1"
        >
          {/* Left Column: Waste Type Cards */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
                Jenis Sampah Diterima
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                {loading ? 'Memuat…' : `${filteredTypes.length} dari ${wasteTypes.length} jenis`}
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                Memuat katalog sampah dari server...
              </div>
            ) : filteredTypes.length === 0 ? (
              <EmptyState
                icon={<Search size={40} />}
                title="Jenis sampah tidak ditemukan"
                message={
                  query
                    ? `Tidak ada hasil untuk pencarian "${searchTerm}".`
                    : 'Belum ada jenis sampah pada kategori ini.'
                }
              >
                <Button variant="secondary" onClick={handleResetFilter}>
                  Reset Filter & Pencarian
                </Button>
              </EmptyState>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredTypes.map((item) => {
                  const visual = getWasteTypeVisual(item.jenis_sampah);
                  return (
                    <Card
                      key={item.id}
                      hover
                      style={{
                        padding: '20px',
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center',
                      }}
                      className="md-flex-col"
                    >
                      <img
                        src={visual.img}
                        alt={item.jenis_sampah}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '14px',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                            {item.jenis_sampah}
                          </h3>
                          <Badge variant="blue" size="sm">
                            {item.kategori?.nama_kategori || 'Umum'}
                          </Badge>
                          <Badge variant="green" size="sm">
                            per {item.satuan}
                          </Badge>
                        </div>

                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            lineHeight: 1.5,
                            marginBottom: '12px',
                          }}
                        >
                          {item.deskripsi || 'Pastikan sampah dalam keadaan kering dan bersih dari kotoran organik.'}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#fef3c7',
                              border: '1px solid #fde68a',
                              padding: '6px 12px',
                              borderRadius: '10px',
                              color: '#92400e',
                              fontWeight: '800',
                              fontSize: '0.95rem',
                            }}
                          >
                            <Coins size={18} />
                            <span>
                              {item.koin_per_satuan} Koin / {item.satuan}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setSelectedWasteId(item.id.toString());
                                setCalcResult(null);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              leftIcon={<Calculator size={14} />}
                            >
                              Hitung
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Coin Calculator */}
          <div style={{ position: 'sticky', top: '96px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid #bbf7d0',
                boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.08)',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Calculator size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                    Kalkulator Koin
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Pilih sampah, isi jumlah, lalu tekan Hitung
                  </span>
                </div>
              </div>

              {/* Calculator Form */}
              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Pilih Jenis Sampah"
                  type="select"
                  value={selectedWasteId}
                  onChange={(e) => {
                    setSelectedWasteId(e.target.value);
                    setCalcResult(null);
                  }}
                  options={wasteTypes.map((w) => ({
                    value: w.id.toString(),
                    label: `${w.jenis_sampah} (${w.koin_per_satuan} koin/${w.satuan})`,
                  }))}
                />

                <Input
                  label="Jumlah / Berat Sampah"
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={inputAmount}
                  onChange={(e) => {
                    setInputAmount(e.target.value);
                    setCalcResult(null);
                  }}
                  placeholder="Contoh: 5"
                  helperText="Masukkan angka berat (kg) atau volume minyak (liter)"
                />
              </div>

              {/* Result Preview Box */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#15803d',
                    textTransform: 'uppercase',
                  }}
                >
                  Estimasi Koin Yang Didapat:
                </span>
                {calcResult ? (
                  <>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: '#16a34a',
                        lineHeight: 1.2,
                        margin: '6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      <Coins size={32} color="#f59e0b" />
                      <span>{formatCoins(calcResult.estimasi_koin)}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      Untuk <strong>{calcResult.jumlah} {calcResult.satuan}</strong>{' '}
                      {calcResult.jenis_sampah}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: '#94a3b8',
                        lineHeight: 1.2,
                        margin: '6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <Coins size={32} color="#cbd5e1" />
                      <span>—</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {calcLoading
                        ? 'Menghitung…'
                        : 'Masukkan jumlah sampah lalu tekan tombol Hitung.'}
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="primary"
                style={{ width: '100%' }}
                onClick={handleCalculate}
                loading={calcLoading}
                leftIcon={<Calculator size={18} />}
              >
                Hitung
              </Button>

              <p
                style={{
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  marginTop: '12px',
                  textAlign: 'center',
                }}
              >
                Estimasi bersifat perkiraan; koin final ditentukan hasil penimbangan
                di drop point Livora.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
