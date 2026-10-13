import { useState, useEffect } from 'react';
import { Eye, Trash2, RefreshCw } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { getAdminPesanApi, markPesanReadApi, deletePesanApi } from '../../api/admin';
import { useConfirm } from '../../hooks/useConfirm';
import AdminPageHeader from './AdminPageHeader';

/**
 * Pesan Kontak dari pengunjung (form kontak halaman publik) — /admin/pesan
 */
export default function PesanKontak({ showToast }) {
  const confirm = useConfirm();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessagesData = () =>
    getAdminPesanApi()
      .then((data) => {
        setMessages(data);
        setLoading(false);
        return data;
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        return [];
      });

  useEffect(() => {
    loadMessagesData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadMessagesData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} pesan.`, 'success');
    });
  };

  // Baca pesan → tandai sudah dibaca, badge sidebar ikut diperbarui
  const handleViewMessage = async (msg) => {
    setSelectedMessage(msg);
    if (msg.status_baca === 'Belum Dibaca') {
      try {
        await markPesanReadApi(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status_baca: 'Dibaca' } : m))
        );
        window.dispatchEvent(new Event('livora:stats-changed'));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (
      await confirm({
        title: 'Hapus pesan kontak?',
        message: 'Pesan yang dihapus tidak dapat dikembalikan.',
        confirmText: 'Hapus',
        danger: true,
      })
    ) {
      try {
        await deletePesanApi(id);
        if (showToast) showToast('Pesan berhasil dihapus.', 'success');
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
        window.dispatchEvent(new Event('livora:stats-changed'));
      } catch (err) {
        if (showToast) showToast(err.message || 'Gagal menghapus pesan', 'error');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Kotak Masuk', variant: 'blue' }]}
        title="Pesan Kontak Pengunjung"
        subtitle="Daftar pesan dan formulir kontak yang dikirim melalui halaman /kontak website."
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
            Pesan Masuk dari Pengunjung
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Klik &quot;Baca&quot; untuk melihat isi pesan (otomatis ditandai sudah dibaca).
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat pesan...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            Belum ada pesan kontak masuk.
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
                  <th style={{ padding: '14px 20px' }}>Pengirim</th>
                  <th style={{ padding: '14px 16px' }}>Subjek</th>
                  <th style={{ padding: '14px 16px' }}>Tanggal</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor:
                        msg.status_baca === 'Belum Dibaca' ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{msg.nama}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {msg.email} • {msg.telepon}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                      <div
                        style={{
                          fontWeight: '600',
                          color: '#334155',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {msg.subjek}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {msg.pesan}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        color: '#64748b',
                        fontSize: '0.85rem',
                      }}
                    >
                      {formatDate(msg.tanggal_kirim || msg.created_at)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={msg.status_baca === 'Belum Dibaca' ? 'danger' : 'gray'}
                        size="sm"
                      >
                        {msg.status_baca}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewMessage(msg)}
                          leftIcon={<Eye size={14} />}
                        >
                          Baca
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Pesan */}
      <Modal
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title="Detail Pesan Kontak"
        subtitle={selectedMessage?.subjek}
        maxWidth="500px"
        footer={
          <Button variant="secondary" onClick={() => setSelectedMessage(null)}>
            Tutup
          </Button>
        }
      >
        {selectedMessage && (
          <div>
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '14px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <strong>Pengirim:</strong> {selectedMessage.nama}
              </div>
              <div>
                <strong>Email:</strong> {selectedMessage.email}
              </div>
              <div>
                <strong>No. Telp / WA:</strong> {selectedMessage.telepon}
              </div>
              <div>
                <strong>Tanggal:</strong>{' '}
                {formatDate(selectedMessage.tanggal_kirim || selectedMessage.created_at)}
              </div>
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Isi Pesan:
            </div>
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedMessage.pesan}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
