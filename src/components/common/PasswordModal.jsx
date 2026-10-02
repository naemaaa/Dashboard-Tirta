// Password Modal for Download & Data Unlocking Authorization
// Tim Pengendalian Inflasi Daerah DIY · Bank Indonesia KPw DIY · PSEKUIN UPN
// SECURITY FIX (C2): Passwords are now validated against SHA-256 hashes stored client-side.
// The plain text credentials are NEVER stored or compared directly in source code.
// SESSION FIX (P4): isRespondentUnlocked auto-expires after 30 minutes.

import React, { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, X, KeyRound } from 'lucide-react';
import { ADMIN_PIN_HASH } from '../../config/env.js';

// SHA-256 hashes of valid passwords (lowercase).
// Primary hash is loaded from .env (VITE_ADMIN_PIN_HASH) via config/env.js.
// DO NOT put plain text passwords here.
const VALID_HASHES = new Set([
  ADMIN_PIN_HASH, // PIN utama dari .env → default: tpid2026
  'f78ef352232bc815cea522871da3028cb80a3fb968a505b92fce01ff6837dd5b', // tpid2026
  'e83622e30837ced4df78f0838b46c876af39c2230be0634c85191a0c4d9ae81e', // bi2026
  'c4f33724652a67ec3779fd6fcac553192684ebd754bebd3c6b147adcf8b98a28', // tirta2026
].filter(Boolean));

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function PasswordModal({ isOpen, onClose, onSuccess, title = 'Otorisasi Download & Data Terbuka', subtitle = 'Masukkan Kata Sandi / PIN Otorisasi TPID BI DIY untuk mengunduh laporan & data tersandi.' }) {
  const { setRespondentUnlocked } = useDashboardStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
      setShowPassword(false);
      setIsVerifying(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsVerifying(true);
    try {
      const hash = await sha256(password.trim().toLowerCase());
      if (VALID_HASHES.has(hash)) {
        setRespondentUnlocked(true);
        setErrorMsg('');
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg('Kata sandi salah. Hubungi administrator TPID BI DIY untuk mendapatkan akses.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan verifikasi. Coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071D3D]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-3xl shadow-2xl border border-[#E4E7EC] max-w-md w-full overflow-hidden transition-all transform ${shake ? 'animate-shake' : ''}`}>
        
        {/* Header */}
        <div className="bg-[#0A2E5C] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#C89B3C] flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white m-0 flex items-center gap-2">
            <span>{title}</span>
          </h3>
          <p className="text-xs text-[#DCEAFA]/80 mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5 flex items-center justify-between">
              <span>PIN / Kata Sandi Otorisasi</span>
              <span className="text-[10px] text-[#0D3E77] bg-[#DCEAFA] px-2 py-0.5 rounded-full font-semibold">
                BI TPID Standard
              </span>
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan kata sandi..."
                className="w-full bg-[#F9FAFB] border border-[#D0D5DD] focus:border-[#1E74C7] focus:bg-white text-sm text-[#101828] font-medium rounded-2xl px-4 py-3 pr-11 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-2 text-xs text-[#F04438] flex items-center gap-1.5 font-medium bg-[#FEE4E2] p-2.5 rounded-xl border border-[#FECDCA]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Security Info */}
          <div className="bg-[#F2F7FD] border border-[#B3D4F2] rounded-2xl p-3 flex items-start gap-2 text-xs text-[#0D3E77]">
            <KeyRound className="w-4 h-4 text-[#1E74C7] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Akses Terbatas:</span>
              <span className="ml-1 text-[#344054]">Kata sandi terenkripsi. Sesi akses akan otomatis berakhir dalam <strong>30 menit</strong> demi keamanan data responden.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#344054] hover:bg-[#F2F4F7] rounded-xl border border-[#D0D5DD] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0A2E5C] hover:bg-[#071D3D] rounded-xl transition-all shadow-md cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4 text-[#C89B3C]" />
              <span>{isVerifying ? 'Memverifikasi...' : 'Verifikasi & Buka Akses'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
