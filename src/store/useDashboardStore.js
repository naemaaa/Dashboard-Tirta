// Zustand Global State Store for Dashboard Komoditas DIY
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
// AUDIT FIXES:
// - P4: isRespondentUnlocked auto-expires via 30-minute setTimeout
// - P5: lastSyncTime initialized as null → UI shows loading state correctly
// - M1: Dead tab-specific filter states removed (tab2Komoditas, tab2Kabupaten, etc.)
// - M2: tab2Responden kept only because it still exists in store API for backwards compat

import { create } from 'zustand';
import { ExcelService } from '../services/excelService.js';
import { generateMasterDataset, REF_KOMODITAS, REF_KALENDER } from '../data/seedData.js';
import { UNLOCK_SESSION_MS } from '../config/env.js';

const DEFAULT_KOMODITAS = REF_KOMODITAS[0].nama_komoditas;
const DEFAULT_PERIODE    = REF_KALENDER[REF_KALENDER.length - 1].id_periode;
const DEFAULT_WILAYAH    = 'Semua Wilayah DIY';
const DEFAULT_KLASTER    = 'semua';

// Session timer reference for respondent unlock auto-expiry
let _unlockExpiryTimer = null;

export const useDashboardStore = create((set, get) => ({

  // ─────────────────────────────────────────────────────────────────
  // Global Filters (shared di Tab 1 & default untuk tab lain)
  // selectedPeriode: string (single) | string[] (multi-select)
  // ─────────────────────────────────────────────────────────────────
  selectedPeriode:   DEFAULT_PERIODE,   // string (single) or string[] (multi)
  selectedKomoditas: DEFAULT_KOMODITAS, // string single — komoditas selalu single select
  selectedWilayah:   DEFAULT_WILAYAH,   // string single | string[] (multi)
  selectedKlaster:   DEFAULT_KLASTER,   // 'semua' | 'pedagang_besar' | 'produsen'

  // ─────────────────────────────────────────────────────────────────
  // UI State
  // ─────────────────────────────────────────────────────────────────
  activeTab:            'tab1',
  isLoading:            false,
  error:                null,
  isDataModalOpen:      false,
  // P4: isRespondentUnlocked auto-expires after UNLOCK_SESSION_MS
  isRespondentUnlocked: false,
  // P5: null = belum loaded (UI menampilkan skeleton), string = timestamp valid
  lastSyncTime:         null,
  syncSource:           null,
  tabRenderKey:         0, // used to force remount on tab change

  // Master Dataset 1: Arus Komoditas Master Database
  data: generateMasterDataset(),

  // Master Dataset 2: EWS / Early Warning System Alert Database (100% Standalone)
  ewsDatabase: null,
  ewsSyncTime: null,
  ewsSyncSource: 'Default Seed EWS Database',

  // ─────────────────────────────────────────────────────────────────
  // Actions — Global Filters & Credentials
  // ─────────────────────────────────────────────────────────────────
  setSelectedPeriode:    (periode) => set({ selectedPeriode: periode }),
  setSelectedKomoditas:  (komoditas) => set({ selectedKomoditas: komoditas }),
  setSelectedWilayah:    (wilayah) => set({ selectedWilayah: wilayah }),
  setSelectedKlaster:    (klaster) => set({ selectedKlaster: klaster }),

  // P4: Auto-expire isRespondentUnlocked after 30 minutes
  setRespondentUnlocked: (unlocked) => {
    // Clear any existing expiry timer
    if (_unlockExpiryTimer) {
      clearTimeout(_unlockExpiryTimer);
      _unlockExpiryTimer = null;
    }
    set({ isRespondentUnlocked: unlocked });
    if (unlocked) {
      _unlockExpiryTimer = setTimeout(() => {
        set({ isRespondentUnlocked: false });
        _unlockExpiryTimer = null;
      }, UNLOCK_SESSION_MS);
    }
  },

  // Toggle periode dalam array (untuk multi-select)
  togglePeriode: (periodeId) => set((state) => {
    const current = Array.isArray(state.selectedPeriode)
      ? state.selectedPeriode
      : [state.selectedPeriode];
    const idx = current.indexOf(periodeId);
    if (idx >= 0) {
      const next = current.filter(p => p !== periodeId);
      return { selectedPeriode: next.length === 1 ? next[0] : next.length === 0 ? DEFAULT_PERIODE : next };
    }
    return { selectedPeriode: [...current, periodeId] };
  }),

  // ─────────────────────────────────────────────────────────────────
  // Actions — Tab-specific Filters (kept for backward compat)
  // ─────────────────────────────────────────────────────────────────
  setTab2Filters: (updates) => set((state) => ({ ...state, ...updates })),
  setTab3Filters: (updates) => set((state) => ({ ...state, ...updates })),
  setTab4Filters: (updates) => set((state) => ({ ...state, ...updates })),

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    // Increment render key to force React remount of dependent components.
    set(state => ({ tabRenderKey: (state.tabRenderKey ?? 0) + 1 }));
  },
  setDataModalOpen: (open) => set({ isDataModalOpen: open }),

  resetFilters: () => set({
    selectedPeriode:   DEFAULT_PERIODE,
    selectedKomoditas: DEFAULT_KOMODITAS,
    selectedWilayah:   DEFAULT_WILAYAH,
    selectedKlaster:   DEFAULT_KLASTER,
  }),

  // ─────────────────────────────────────────────────────────────────
  // Data Loading
  // ─────────────────────────────────────────────────────────────────
  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, source, timestamp } = await ExcelService.getInitialData();
      const lastKal = data.REF_KALENDER?.[data.REF_KALENDER.length - 1];
      const latestPeriode = lastKal?.id_periode || DEFAULT_PERIODE;
      set({
        data,
        selectedPeriode: latestPeriode,
        isLoading: false,
        // P5: hanya set lastSyncTime jika data berhasil dimuat, bukan hardcoded
        lastSyncTime: new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
        syncSource: source === 'cache' ? 'Cached Database' : `Master Database (${lastKal?.nama_bulan || 'Oktober'} 2026)`,
      });
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Gagal memuat dataset' });
    }
  },

  importExcelBuffer: async (buffer) => {
    set({ isLoading: true, error: null });
    try {
      const parsed = await ExcelService.parseExcelBuffer(buffer);
      const lastKal = parsed.REF_KALENDER?.[parsed.REF_KALENDER.length - 1];
      set({
        data: parsed,
        selectedPeriode: lastKal?.id_periode || get().selectedPeriode,
        isLoading: false,
        isDataModalOpen: false,
        lastSyncTime: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
        syncSource: 'Local Excel Upload',
      });
    } catch (err) {
      set({ isLoading: false, error: 'Format file Excel tidak valid: ' + err.message });
    }
  },

  refreshData: async (url) => {
    set({ isLoading: true, error: null });
    try {
      if (url) {
        const parsed = await ExcelService.fetchFromUrl(url);
        const lastKal = parsed.REF_KALENDER?.[parsed.REF_KALENDER.length - 1];
        set({
          data: parsed,
          selectedPeriode: lastKal?.id_periode || get().selectedPeriode,
          isLoading: false,
          isDataModalOpen: false,
          lastSyncTime: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
          syncSource: 'OneDrive Live Sync',
        });
      } else {
        ExcelService.clearCache();
        const { data: fresh, source } = await ExcelService.fetchMasterDatabase();
        set({
          data: fresh,
          selectedPeriode: fresh.REF_KALENDER?.[fresh.REF_KALENDER.length - 1]?.id_periode || get().selectedPeriode,
          isLoading: false,
          lastSyncTime: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
          syncSource: source === 'network_master' ? 'Master JSON Live' : 'Database Terkini',
        });
      }
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Gagal sinkronisasi data' });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // Actions — Dedicated Database 2 (EWS Alert Database)
  // ─────────────────────────────────────────────────────────────────
  importEwsExcelBuffer: async (buffer) => {
    set({ isLoading: true, error: null });
    try {
      const ewsParsed = await ExcelService.parseEwsExcelBuffer(buffer);
      set({
        ewsDatabase: ewsParsed,
        isLoading: false,
        isDataModalOpen: false,
        ewsSyncTime: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
        ewsSyncSource: 'Local EWS Excel Upload',
      });
    } catch (err) {
      set({ isLoading: false, error: 'Gagal menguraikan file EWS Excel: ' + err.message });
    }
  },

  refreshEwsData: async (url) => {
    set({ isLoading: true, error: null });
    try {
      if (url) {
        // Gunakan universal URL converter yang mendukung 1drv.ms, Doc.aspx, dan download.aspx
        const directUrl = ExcelService.convertOneDriveUrlToDownloadUrl(url);
        const res = await ExcelService._fetchWithTimeout(directUrl, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*'
          }
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
        const buffer = await res.arrayBuffer();
        const ewsParsed = await ExcelService.parseEwsExcelBuffer(buffer);
        set({
          ewsDatabase: ewsParsed,
          isLoading: false,
          isDataModalOpen: false,
          ewsSyncTime: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
          ewsSyncSource: 'OneDrive EWS Live Sync',
        });
      }
    } catch (err) {
      set({ isLoading: false, error: 'Gagal sinkronisasi Database EWS: ' + err.message });
    }
  }
}));
