import { useState } from 'react';
import Modal from '../common/Modal';
import AuthForm from '../auth/AuthForm';

export default function LoginModal({ isOpen, onClose, defaultMode = 'login', onLoginSuccess, onNavigate }) {
  const [mode] = useState(defaultMode);

  const handleSuccess = (loggedInUser) => {
    if (onLoginSuccess) onLoginSuccess(loggedInUser);
    onClose();
  };

  // Tutup modal dulu baru buka halaman lupa password.
  const handleForgotPassword = () => {
    onClose();
    if (onNavigate) onNavigate('lupa-password');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'register' ? 'Daftar Akun Livora' : 'Masuk ke Akun Livora'}
      subtitle={
        mode === 'register'
          ? 'Daftar gratis dan mulai kumpulkan koin dari setoran sampah Anda.'
          : 'Kelola koin, riwayat setoran, dan tukar reward dalam satu akun.'
      }
      maxWidth="460px"
    >
      <AuthForm
        initialMode={mode}
        onSuccess={handleSuccess}
        onForgotPassword={handleForgotPassword}
      />
    </Modal>
  );
}
