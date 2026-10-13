import { useState, useCallback } from 'react';
import { ConfirmContext } from '../../context/confirm-context';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

/**
 * Dialog konfirmasi aksi (menggantikan confirm/prompt bawaan browser).
 * Dipakai lewat useConfirm() dari halaman mana pun di dalam provider ini.
 */
export default function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const confirm = useCallback((options) => {
    setInputValue(options.defaultValue ?? '');
    return new Promise((resolve) => {
      setRequest({ ...options, resolve });
    });
  }, []);

  const settle = (value) => {
    if (!request) return;
    request.resolve(value);
    setRequest(null);
  };

  const handleCancel = () => settle(request?.withInput ? null : false);

  const handleConfirm = () => {
    if (!request) return;
    if (request.withInput) {
      const trimmed = inputValue.trim();
      if (!trimmed) return;
      settle(trimmed);
    } else {
      settle(true);
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        isOpen={Boolean(request)}
        onClose={handleCancel}
        title={request?.title || ''}
        maxWidth="460px"
        footer={
          request && (
            <>
              <Button variant="ghost" onClick={handleCancel}>
                {request.cancelText || 'Batal'}
              </Button>
              <Button
                variant={request.danger ? 'danger' : 'primary'}
                onClick={handleConfirm}
                disabled={Boolean(request.withInput) && !inputValue.trim()}
              >
                {request.confirmText || 'Lanjutkan'}
              </Button>
            </>
          )
        }
      >
        {request && (
          <>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#475569',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {request.message}
            </p>
            {request.withInput && (
              <div style={{ marginTop: '14px' }}>
                <Input
                  label={request.inputLabel || 'Keterangan'}
                  type="textarea"
                  rows={4}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={request.inputPlaceholder}
                  required
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}
