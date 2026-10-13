import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Users } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatDate } from '../../utils/helpers';
import { getAdminUsersApi } from '../../api/admin';
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
 * Pengguna terdaftar (read-only, support pencarian + filter role) — /admin/pengguna
 */
export default function Pengguna({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // useCallback: identitas stabil mengikuti filter, supaya efek tidak
  // berulang tiap render (react-hooks/exhaustive-deps).
  const loadData = useCallback(() => {
    return getAdminUsersApi({ role: roleFilter, search })
      .then((data) => {
        setUsers(data);
        setLoading(false);
        return data;
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        return [];
      });
  }, [roleFilter, search]);

  // Reload setiap kali filter role / kata kunci pencarian berubah
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData().then((data) => {
      if (showToast) showToast(`Berhasil memuat ${data.length} pengguna.`, 'success');
    });
  };

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Sistem', variant: 'blue' }]}
        title="Pengguna Terdaftar"
        subtitle="Daftar akun member & admin Livora. Pencarian berdasarkan nama, username, atau email."
        actions={
          <Button variant="secondary" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw size={14} />}>
            Segarkan
          </Button>
        }
      />

      <div className="container" style={{ marginTop: '28px' }}>
        {/* Filter: cari + role */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '20px',
            alignItems: 'flex-end',
          }}
        >
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Cari Pengguna"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nama, username, atau email..."
                leftIcon={<Search size={16} />}
              />
            </div>
            <Button type="submit" variant="primary" style={{ marginBottom: '16px' }}>
              Cari
            </Button>
          </form>

          <div style={{ minWidth: '180px' }}>
            <Input
              label="Filter Role"
              type="select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: '', label: 'Semua Role' },
                { value: 'user', label: 'Member' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Memuat pengguna...
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              color: '#64748b',
            }}
          >
            Tidak ada pengguna yang cocok dengan pencarian.
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                fontSize: '0.85rem',
                color: '#64748b',
              }}
            >
              <Users size={15} />
              <span>
                Menampilkan <strong>{users.length}</strong> pengguna
                {search && (
                  <>
                    {' '}
                    untuk pencarian &quot;<strong>{search}</strong>&quot;
                  </>
                )}
              </span>
            </div>

            <div style={WRAPPER}>
              <table style={TABLE}>
                <thead>
                  <tr style={HEAD_ROW}>
                    <th style={{ padding: '14px 20px' }}>Nama</th>
                    <th style={{ padding: '14px 16px' }}>Email</th>
                    <th style={{ padding: '14px 16px' }}>Role</th>
                    <th style={{ padding: '14px 16px' }}>Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          @{u.username || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <Badge variant={u.role === 'admin' ? 'blue' : 'green'} size="sm">
                          {u.role === 'admin' ? 'Admin' : 'Member'}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>
                        {formatDate(u.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
