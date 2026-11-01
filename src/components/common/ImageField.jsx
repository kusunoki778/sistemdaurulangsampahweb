import { useRef, useState } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Pilih gambar dari komputer (diunggah backend ke Cloudinary) atau tempel
 * URL gambar secara manual. Menampilkan preview bila ada sumber gambar.
 *
 * Preview file memakai object URL yang dibuat saat memilih file; pasang
 * `key` unik per pembukaan modal agar state ikut ter-reset.
 */
export default function ImageField({
  label = 'Gambar',
  fileValue,
  onFileChange,
  urlValue = '',
  onUrlChange,
  helperText = 'JPG, PNG, atau WebP. Ukuran maksimal 5 MB.',
}) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef('');
  const [objectUrl, setObjectUrl] = useState('');
  const [error, setError] = useState('');

  const previewUrl = objectUrl || urlValue || '';

  const revokeCurrentObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = '';
    }
  };

  const handleSelect = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) {
      onFileChange(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Format file harus JPG, PNG, atau WebP.');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('Ukuran file maksimal 5 MB.');
      return;
    }
    revokeCurrentObjectUrl();
    const url = URL.createObjectURL(selected);
    objectUrlRef.current = url;
    setObjectUrl(url);
    setError('');
    onFileChange(selected);
  };

  const handleClear = () => {
    revokeCurrentObjectUrl();
    setObjectUrl('');
    setError('');
    onFileChange(null);
    if (onUrlChange) onUrlChange('');
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#334155',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>

      {previewUrl ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
          }}
        >
          <img
            src={previewUrl}
            alt="Preview gambar"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '8px',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, fontSize: '0.8rem', color: '#64748b' }}>
            {fileValue ? fileValue.name : 'Gambar dari URL'}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            title="Ganti gambar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} /> Ganti
          </button>
          <button
            type="button"
            onClick={handleClear}
            title="Hapus gambar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '14px',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <ImagePlus size={18} />
          Pilih gambar dari komputer
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelect}
        style={{ display: 'none' }}
      />

      {onUrlChange && (
        <input
          type="text"
          value={urlValue}
          onChange={(e) => {
            setError('');
            onUrlChange(e.target.value);
          }}
          placeholder="Atau tempel URL gambar (opsional)"
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            boxSizing: 'border-box',
          }}
        />
      )}

      {error ? (
        <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', fontWeight: '500' }}>
          {error}
        </p>
      ) : (
        helperText && (
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{helperText}</p>
        )
      )}
    </div>
  );
}
