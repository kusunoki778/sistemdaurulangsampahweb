import { useContext } from 'react';
import { ConfirmContext } from '../context/confirm-context';

/**
 * Akses fungsi confirm() dari <ConfirmProvider>.
 *
 * Konfirmasi biasa (pengganti window.confirm):
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title, message, confirmText, danger: true });
 *   if (!ok) return;
 *
 * Dengan input teks (pengganti window.prompt):
 *   const alasan = await confirm({ ..., withInput: true, inputLabel, defaultValue });
 *   if (!alasan) return; // null saat dibatalkan
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm harus dipakai di dalam <ConfirmProvider>');
  }
  return context;
}
