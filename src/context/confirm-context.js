import { createContext } from 'react';

/**
 * Context dialog konfirmasi custom (pengganti window.confirm / window.prompt).
 * Instance tunggal dirender oleh <ConfirmProvider> di App.jsx.
 */
export const ConfirmContext = createContext(null);
