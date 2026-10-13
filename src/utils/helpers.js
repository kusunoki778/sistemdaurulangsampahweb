/**
 * Utility functions for Livora Web Frontend
 */

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatCoins(amount) {
  if (amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/** Perkiraan waktu baca artikel (±200 kata per menit), minimal 1 menit. */
export function estimateReadingMinutes(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function getArticleImage(path, category = '') {
  if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path;
  }

  // Fallbacks curated from Unsplash for crisp environmental imagery
  const categoryMap = {
    'Pemilahan Sampah': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    'Daur Ulang': 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=800&q=80',
    'Ekonomi Hijau': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    'Gaya Hidup': 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=800&q=80',
    'Isu Lingkungan': 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80',
  };

  return categoryMap[category] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
}

export function getRewardImage(path, category = '') {
  if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path;
  }

  const categoryMap = {
    'Voucher': 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=800&q=80',
    'Produk': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    'Tanaman': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
  };

  return categoryMap[category] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
}

export function getWasteTypeVisual(jenis) {
  const map = {
    'Minyak Jelantah': {
      color: '#f59e0b',
      bgColor: '#fef3c7',
      label: 'Minyak Jelantah',
      satuan: 'Liter',
      img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'
    },
    'Botol Plastik': {
      color: '#0284c7',
      bgColor: '#e0f2fe',
      label: 'Plastik PET',
      satuan: 'Kg',
      img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80'
    },
    'Kardus': {
      color: '#b45309',
      bgColor: '#fef3c7',
      label: 'Kardus & Karton',
      satuan: 'Kg',
      img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'
    },
    'Kaleng Aluminium': {
      color: '#64748b',
      bgColor: '#f1f5f9',
      label: 'Kaleng Logam',
      satuan: 'Kg',
      img: 'https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&w=600&q=80'
    },
    'Kertas Bekas': {
      color: '#059669',
      bgColor: '#d1fae5',
      label: 'Kertas HVS/Koran',
      satuan: 'Kg',
      img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80'
    },
  };

  return map[jenis] || {
    color: '#16a34a',
    bgColor: '#dcfce7',
    label: jenis,
    satuan: 'Kg',
    img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
  };
}
