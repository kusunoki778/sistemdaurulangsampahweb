import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Lightbulb, 
  ArrowRight
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { getArticleDetailApi, getArticlesApi } from '../api/article';
import { formatDate, getArticleImage, estimateReadingMinutes } from '../utils/helpers';

export default function ArticleDetail({ identifier, onBack, onSelectArticle }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const data = await getArticleDetailApi(identifier);
        setArticle(data);

        // Load related articles
        const allArticles = await getArticlesApi();
        if (allArticles) {
          const filtered = allArticles.filter((a) => a.id !== data.id).slice(0, 3);
          setRelatedArticles(filtered);
        }
      } catch (err) {
        console.error('Failed to load article detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [identifier]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748b' }}>
        Memuat konten artikel edukasi...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Artikel Tidak Ditemukan</h2>
        <Button variant="primary" onClick={onBack} style={{ marginTop: '16px' }}>
          Kembali ke Daftar Artikel
        </Button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', paddingBottom: '80px' }}>
      {/* Header ringkas: tombol kembali, kategori, waktu baca, judul, meta */}
      <section
        className="reveal stagger"
        style={{
          backgroundColor: '#f0fdf4',
          paddingTop: '36px',
          paddingBottom: '36px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="container-narrow">
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Artikel</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Badge variant="green" size="md">
              {article.kategori}
            </Badge>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              • {estimateReadingMinutes(article.konten_lengkap || article.isi)} Menit Baca
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: '800',
              color: '#0f172a',
              lineHeight: 1.25,
              letterSpacing: '-0.5px',
              marginBottom: '20px',
            }}
          >
            {article.judul}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} color="#16a34a" />
                <span>Penulis: <strong>{article.author?.name || 'Administrator Livora'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="#0284c7" />
                <span>Diterbitkan: {formatDate(article.tanggal_publikasi)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleShare}
                leftIcon={<Share2 size={14} />}
              >
                {copied ? 'Tautan Disalin!' : 'Bagikan'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body Container */}
      <div className="container-narrow reveal stagger" style={{ marginTop: '36px' }}>
        {/* Main Cover Image */}
        <div
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            marginBottom: '36px',
          }}
        >
          <img
            src={getArticleImage(article.gambar, article.kategori)}
            alt={article.judul}
            style={{
              width: '100%',
              maxHeight: '440px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        {/* Lead Excerpt */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px 28px',
            borderLeft: '5px solid #16a34a',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
            marginBottom: '36px',
            fontSize: '1.15rem',
            lineHeight: 1.7,
            color: '#1e293b',
            fontWeight: '500',
          }}
        >
          {article.deskripsi_singkat}
        </div>

        {/* Full Content */}
        <article
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '36px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: '#334155',
          }}
        >
          {(article.konten_lengkap || article.isi || '').split('\n\n').map((paragraph, idx) => {
            // Check if paragraph is a heading or numbered list
            if (paragraph.startsWith('1.') || paragraph.startsWith('Apa Itu') || paragraph.startsWith('Kesimpulan:')) {
              return (
                <div key={idx} style={{ marginTop: '24px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                    {paragraph.split('\n')[0]}
                  </h3>
                  {paragraph.split('\n').slice(1).map((sub, sIdx) => (
                    <p key={sIdx} style={{ marginBottom: '8px', color: '#475569' }}>
                      {sub}
                    </p>
                  ))}
                </div>
              );
            }
            return (
              <p key={idx} style={{ marginBottom: '20px' }}>
                {paragraph}
              </p>
            );
          })}

          {/* Eco Tip Callout Box */}
          <div
            style={{
              marginTop: '40px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Lightbulb size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#15803d', marginBottom: '6px' }}>
                Tips Ramah Lingkungan Livora
              </h4>
              <p style={{ fontSize: '0.925rem', color: '#166534', lineHeight: 1.6 }}>
                Jangan buang minyak jelantah ke wastafel karena dapat menyumbat saluran pipa air dan mencemari air tanah. Kumpulkan di jeriken tertutup dan setorkan ke bank sampah Livora untuk mendapatkan koin Livora!
              </p>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div style={{ marginTop: '56px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>
              Artikel Edukasi Lainnya
            </h3>
            <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
              {relatedArticles.map((rel) => (
                <Card
                  key={rel.id}
                  hover
                  padding="0"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => onSelectArticle(rel.slug || rel.id)}
                >
                  <img
                    src={getArticleImage(rel.gambar, rel.kategori)}
                    alt={rel.judul}
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Badge variant="green" size="sm" style={{ width: 'fit-content', marginBottom: '8px' }}>
                      {rel.kategori}
                    </Badge>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        lineHeight: 1.3,
                        marginBottom: '8px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {rel.judul}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '700', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Baca <ArrowRight size={12} />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
