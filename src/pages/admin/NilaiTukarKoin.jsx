import { useState, useEffect } from 'react';
import { RefreshCw, Save, Coins } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getAdminJenisApi, getAdminKategoriApi, updateJenisApi } from '../../api/admin';
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

/**
 * Master Data: Nilai Tukar Koin — /admin/master/nilai-tukar
 *
 * Tampilan ringkas untuk mengubah `poin_per_satuan` tiap jenis sampah
 * (berapa Koin Eco per kg/liter/pcs). Data & endpoint sama dengan
 * Master Jenis Sampah — halaman ini hanya fokus ke nilai tukarnya saja,
 * sesuai pemisahan menu pada desain CMS.
 */
export default function NilaiTukarKoin({ showToast }) {
  const [items, setItems] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const loadData = () =>
    Promise.all([getAdminJenisApi(), getAdminKategoriApi()])
      .then(([jenis, kategori]) => {
        setItems(jenis);
        setKategoriList(kategori);
        setDrafts({});
        setLoading(false);
        return jenis;
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        return [];
      });

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} jenis sampah.`, 'success');
    });
  };

  const handleDraftChange = (id, value) => setDrafts((prev) => ({ ...prev, [id]: value }));

  const isDirty = (item) => {
    const draft = drafts[item.id];
    return draft !== undefined && Number(draft) !== Number(item.poin_per_satuan);
  };

  const handleSave = async (item) => {
    const nilai = Number(drafts[item.id]);
    if (!Number.isFinite(nilai) || nilai < 0) {
      if (showToast) showToast('Nilai tukar harus berupa angka nol atau lebih.', 'error');
      return;
    }
    setSavingId(item.id);
    try {
      // Payload lengkap: field lain dikirim apa adanya (endpoint PUT jenis-sampah).
      await updateJenisApi(item.id, {
        kategori_id: item.kategori_id,
        nama_jenis: item.nama_jenis,
        satuan: item.satuan,
        poin_per_satuan: nilai,
        deskripsi: item.deskripsi || '',
      });
      if (showToast) {
        showToast(`Nilai tukar "${item.nama_jenis}" berhasil diperbarui.`, 'success');
      }
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Gagal menyimpan nilai tukar', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const kategoriName = (id) => kategoriList.find((k) => k.id === id)?.nama_kategori || '—';

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Master Data', variant: 'green' }]}
        title="Nilai Tukar Koin"
        subtitle="Berapa Koin Eco yang diterima member per satuan (kg/liter/pcs) pada tiap jenis sampah. Ubah angkanya, lalu klik Simpan di barisnya."
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
        <div style={WRAPPER}>
          <table style={TABLE}>
            <thead>
              <tr style={HEAD_ROW}>
                <th style={{ padding: '12px 16px', width: '48px' }}>No</th>
                <th style={{ padding: '12px 16px' }}>Jenis Sampah</th>
                <th style={{ padding: '12px 16px' }}>Kategori</th>
                <th style={{ padding: '12px 16px', width: '120px' }}>Satuan</th>
                <th style={{ padding: '12px 16px', width: '230px' }}>Nilai Tukar (Koin Eco)</th>
                <th style={{ padding: '12px 16px', width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: '34px', textAlign: 'center', color: '#94a3b8' }}
                  >
                    Memuat data nilai tukar…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: '34px', textAlign: 'center', color: '#94a3b8' }}
                  >
                    Belum ada jenis sampah. Tambahkan lewat menu Jenis Sampah.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const draftValue = drafts[item.id] ?? String(item.poin_per_satuan);
                  const dirty = isDirty(item);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {item.nama_jenis}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge variant="green" size="sm">
                          {kategoriName(item.kategori_id)}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontSize: '0.88rem' }}>
                        per {item.satuan}
                      </td>
                      <td style={{ padding: '8px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            value={draftValue}
                            onChange={(e) => handleDraftChange(item.id, e.target.value)}
                            style={{
                              width: '110px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: `1.5px solid ${dirty ? '#16a34a' : '#cbd5e1'}`,
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            koin/{item.satuan}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Button
                          variant={dirty ? 'primary' : 'outline'}
                          size="sm"
                          disabled={!dirty}
                          loading={savingId === item.id}
                          onClick={() => handleSave(item)}
                          leftIcon={savingId === item.id ? undefined : <Save size={14} />}
                        >
                          Simpan
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p
          style={{
            marginTop: '14px',
            fontSize: '0.8rem',
            color: '#64748b',
            lineHeight: 1.6,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
          }}
        >
          <span style={{ marginTop: '1px', color: '#16a34a', flexShrink: 0 }}>
            <Coins size={14} />
          </span>
          Nilai tukar dipakai pada perhitungan koin untuk setoran baru. Riwayat setoran
          yang sudah tercatat tidak berubah nilainya.
        </p>
      </div>
    </div>
  );
}
