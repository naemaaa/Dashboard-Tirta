/**
 * ============================================================================
 * CONFIG — Environment & App Constants (Single Source of Truth)
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
 *
 * Semua nilai konfigurasi dibaca dari .env (via import.meta.env di Vite).
 * JANGAN hardcode URL sensitif, API key, atau PIN langsung di komponen/service.
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE URLS (OneDrive Excel Sources)
// Diset di .env — tidak di-push ke GitHub
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Database 1: Arus Komoditas Master (Tab 1–6)
 * Set via VITE_ONEDRIVE_MASTER_URL di .env
 */
export const ONEDRIVE_MASTER_URL = import.meta.env.VITE_ONEDRIVE_MASTER_URL || '';

/**
 * Database 2: Early Warning System (EWS) Alert — Tab 7, standalone, no cross-filter
 * Set via VITE_ONEDRIVE_EWS_URL di .env
 */
export const ONEDRIVE_EWS_URL = import.meta.env.VITE_ONEDRIVE_EWS_URL || '';

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SHA-256 hash dari PIN admin untuk akses data responden.
 * Set via VITE_ADMIN_PIN_HASH di .env.
 * Generate di: https://emn178.github.io/online-tools/sha256.html
 * Default fallback: hash dari 'tpid2026'
 */
export const ADMIN_PIN_HASH =
  import.meta.env.VITE_ADMIN_PIN_HASH ||
  '7539d57e08012a92aeff3e5ff7b2b4b9a354eabbcf3f1f4f2e96a9c6b671d01a';

// ─────────────────────────────────────────────────────────────────────────────
// APP METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const APP_NAME    = import.meta.env.VITE_APP_NAME    || 'Dashboard Komoditas DIY';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// ─────────────────────────────────────────────────────────────────────────────
// RUNTIME CONSTANTS (tidak sensitif — boleh di-commit)
// ─────────────────────────────────────────────────────────────────────────────
export const CACHE_KEY          = 'dashboard_komoditas_diy_data_v8';
export const FETCH_TIMEOUT_MS   = 15000;       // 15 detik timeout fetch
export const UNLOCK_SESSION_MS  = 30 * 60 * 1000; // 30 menit session respondent

// ─────────────────────────────────────────────────────────────────────────────
// VERCEL SERVERLESS API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const API_SYNC_ONEDRIVE  = '/api/sync-onedrive';
export const API_AI_ADVISOR     = '/api/ai-advisor';
