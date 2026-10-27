import { useState, useEffect } from 'react';
import { BookOpen, Search, ArrowRight, Leaf } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ChipFilter from '../components/common/ChipFilter';
import EmptyState from '../components/common/EmptyState';
import { getArticlesApi } from '../api/article';
import { formatDate, getArticleImage, estimateReadingMinutes } from '../utils/helpers';

// Kategori = pilihan yang tersedia di CMS KelolaArtikel (satu sumber daftar).
const CATEGORY_OPTIONS = [
  'Pemilahan Sampah',
  'Daur Ulang',
  'Gaya Hidup',
  'Ekonomi Hijau',
  'Isu Lingkungan',
].map((name) => ({ id: name, label: name }));

// Font serif untuk judul display (Playfair Display sudah dimuat di index.html).
const DISPLAY_FONT = "'Playfair Display', Georgia, 'Times New Roman', serif";

// Waktu publikasi sebagai timestamp untuk pengurutan terbaru di atas.
function publishedTimestamp(article) {
  const value = article.tanggal_publikasi || article.created_at || '';
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

// Ringkasan teks polos (tag HTML dibersihkan) untuk kartu dan artikel unggulan.
function buildExcerpt(article, maxLength = 220) {
  const source = article.deskripsi_singkat || article.isi || article.konten_lengkap || '';
  const plain = String(source)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()} ...`;
}

export default function Articles({ onSelectArticle }) {
  const [articles, setArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Daftar artikel sesuai filter aktif (kategori & pencarian dikirim ke API).
  useEffect(() => {
    let active = true;
    async function loadArticles() {
      try {
        setLoading(true);
        const data = await getArticlesApi({
          kategori: selectedCategory === 'semua' ? null : selectedCategory,
          search: searchQuery,
        });
        if (active) setArticles(data);
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadArticles();
    return () => {
      active = false;
    };
  }, [selectedCategory, searchQuery]);

  // Total artikel tanpa filter, untuk teks "Menampilkan X dari Y".
  useEffect(() => {
    let active = true;
    async function loadTotal() {
      try {
        const data = await getArticlesApi({});
        if (active) setTotalArticles(data.length);
      } catch (err) {
        console.error('Failed to load article total:', err);
      }
    }
    loadTotal();
    return () => {
      active = false;
    };
  }, []);

  const readingMinutes = (article) =>
    estimateReadingMinutes(article.isi || article.konten_lengkap || article.deskripsi_singkat);

  const sortedArticles = [...articles].sort(
    (a, b) => publishedTimestamp(b) - publishedTimestamp(a)
  );
  const featured = sortedArticles[0] || null;
  const gridItems = sortedArticles.slice(1);

  const resultCountLabel =
    totalArticles !== null && totalArticles > articles.length
      ? `Menampilkan ${articles.length} dari ${totalArticles} artikel`
      : `Menampilkan ${articles.length} artikel`;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '85vh' }}>
      {/* =====================================================================
          HERO — judul display, badge kecil, pencarian, dan chip kategori
         ===================================================================== */}
      <section
        className="reveal stagger"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '40px 0 36px',
        }}
      >
        <div className="container">
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#16a34a',
              marginBottom: '14px',
            }}
          >
            Edukasi Publik • Materi Pembelajaran Hijau
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 540px', maxWidth: '760px' }}>
              <h1
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontSize: 'clamp(2.1rem, 4.6vw, 3.1rem)',
                  fontWeight: '800',
                  lineHeight: 1.14,
                  color: '#0f172a',
                  marginBottom: '14px',
                }}
              >
                Artikel & Wawasan Daur Ulang
              </h1>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#64748b',
                  maxWidth: '62ch',
                }}
              >
                Panduan praktis, wawasan ilmiah, dan langkah mudah memilah sampah dari rumah untuk
                mendukung gaya sirkular yang berkelanjutan.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                borderRadius: '9999px',
                padding: '9px 16px',
                fontSize: '0.82rem',
                fontWeight: '700',
                flex: '0 0 auto',
              }}
            >
              <Leaf size={16} />
              Disusun oleh Tim Livora
            </span>
          </div>

          {/* Pencarian artikel */}
          <div style={{ marginTop: '26px' }}>
            <Input
              type="search"
              placeholder="Cari topik, jenis sampah, atau panduan pemilahan..."
              aria-label="Cari artikel"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          {/* Filter kategori */}
          <ChipFilter
            options={CATEGORY_OPTIONS}
            value={selectedCategory}
            onChange={setSelectedCategory}
            allLabel="Semua Artikel"
          />
        </div>
      </section>

      {/* =====================================================================
          BAND HIJAU — artikel unggulan + katalog artikel terkini
         ===================================================================== */}
      <section
        className="reveal stagger"
        style={{
          backgroundColor: '#f0fdf4',
          borderTop: '1px solid #dcfce7',
          padding: '48px 0 72px',
          minHeight: '50vh',
        }}
      >
        <div className="container">
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 0',
                color: '#64748b',
                fontWeight: '600',
              }}
            >
              Memuat daftar artikel edukasi...
            </div>
          ) : articles.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={40} />}
              title="Tidak Ada Artikel Ditemukan"
              message="Coba sesuaikan kata kunci pencarian atau ubah filter kategori."
            />
          ) : (
            <>
              {/* ---------------- Artikel unggulan (terbaru) ---------------- */}
              <Card
                hover
                padding="0"
                className="md-grid-cols-1"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.02fr 0.98fr',
                  overflow: 'hidden',
                  borderRadius: '20px',
                  border: '1px solid #bbf7d0',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectArticle(featured.slug || featured.id)}
              >
                {/* Gambar sampul */}
                <div style={{ position: 'relative', minHeight: '300px', height: '100%' }}>
                  <img
                    src={getArticleImage(featured.gambar, featured.kategori)}
                    alt={featured.judul}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                    <Badge
                      variant="green"
                      size="sm"
                      style={{
                        fontWeight: '800',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Artikel Terbaru
                    </Badge>
                  </div>
                </div>

                {/* Panel kanan */}
                <div
                  style={{
                    padding: 'clamp(24px, 3vw, 40px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#15803d',
                      marginBottom: '14px',
                    }}
                  >
                    {featured.kategori} • {readingMinutes(featured)} menit baca
                  </p>

                  <h2
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontSize: 'clamp(1.5rem, 2.4vw, 2.15rem)',
                      fontWeight: '800',
                      lineHeight: 1.2,
                      color: '#0f172a',
                      marginBottom: '14px',
                    }}
                  >
                    {featured.judul}
                  </h2>

                  <p
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      color: '#64748b',
                      marginBottom: '18px',
                    }}
                  >
                    {buildExcerpt(featured) || 'Ringkasan artikel belum tersedia.'}
                  </p>

                  {/* Metadata jujur: penulis & tanggal publikasi dari data API */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      marginBottom: '22px',
                    }}
                  >
                    <BookOpen size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#14532d' }}>
                        Ditulis oleh {featured.author?.name || 'Admin Livora'}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '2px' }}>
                        Dipublikasikan {formatDate(featured.tanggal_publikasi)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectArticle(featured.slug || featured.id);
                      }}
                      rightIcon={<ArrowRight size={16} />}
                      style={{ fontWeight: '700', padding: '12px 22px' }}
                    >
                      Baca Artikel Lengkap
                    </Button>
                  </div>
                </div>
              </Card>

              {/* ---------------- Katalog artikel terkini ---------------- */}
              <div
                style={{
                  marginTop: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: '0',
                    }}
                  >
                    <BookOpen size={18} />
                  </span>
                  <h2
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)',
                      fontWeight: '800',
                      color: '#0f172a',
                    }}
                  >
                    Katalog Artikel Terkini
                  </h2>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                  {resultCountLabel}
                </span>
              </div>

              {gridItems.length > 0 ? (
                <div
                  className="grid grid-cols-3 lg-grid-cols-2 md-grid-cols-1 gap-6"
                  style={{ marginTop: '24px' }}
                >
                  {gridItems.map((art) => (
                    <Card
                      key={art.id}
                      hover
                      padding="0"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                      onClick={() => onSelectArticle(art.slug || art.id)}
                    >
                      {/* Gambar sampul */}
                      <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                        <img
                          src={getArticleImage(art.gambar, art.kategori)}
                          alt={art.judul}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                          <Badge
                            variant="green"
                            size="sm"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.94)',
                              fontWeight: '800',
                              fontSize: '0.66rem',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Kategori: {art.kategori}
                          </Badge>
                        </div>
                      </div>

                      {/* Konten kartu */}
                      <div
                        style={{
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        <p
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#16a34a',
                            marginBottom: '10px',
                          }}
                        >
                          {formatDate(art.tanggal_publikasi)} • {readingMinutes(art)} mnt baca
                        </p>

                        <h3
                          style={{
                            fontFamily: DISPLAY_FONT,
                            fontSize: '1.05rem',
                            fontWeight: '700',
                            color: '#0f172a',
                            lineHeight: 1.35,
                            marginBottom: '8px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {art.judul}
                        </h3>

                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            lineHeight: 1.6,
                            marginBottom: '16px',
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {buildExcerpt(art) || 'Ringkasan artikel belum tersedia.'}
                        </p>

                        <div
                          style={{
                            marginTop: 'auto',
                            paddingTop: '14px',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              color: '#16a34a',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            Baca Artikel <ArrowRight size={14} />
                          </span>
                          <BookOpen size={15} color="#94a3b8" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    marginTop: '24px',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    border: '1px dashed #bbf7d0',
                    borderRadius: '12px',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  Belum ada artikel lain untuk ditampilkan.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
