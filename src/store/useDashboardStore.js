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

/**
 * Periode terakhir yang BENAR-BENAR sudah terisi data (volume > 0).
 * Minggu yang belum ada di database / baru berisi baris kosong tidak dihitung.
 */
function pickLatestPeriode(data) {
  const withVolume = new Set(
    (data?.laporan_ringkasan || [])
      .filter(r => !r.is_deleted && (Number(r.volume_ton) > 0 || Number(r.volume_liter) > 0))
      .map(r => r.id_periode)
  );
  return [...(data?.REF_KALENDER || [])].reverse().find(k => withVolume.has(k.id_periode)) || null;
}

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

  // Master Dataset 2A: EWS / Early Warning System Alert Database (Sub-Tab 1 Lama — 100% Standalone)
  ewsDatabase: null,
  ewsSyncTime: null,
  ewsSyncSource: 'Default Seed EWS Database',

  // Master Dataset 2B: Hubungan Harga PIHPS & Arus Perdagangan (Sub-Tab 2 Baru — Link 2)
  hargaArusDatabase: null,
  hargaArusSyncTime: null,
  hargaArusSyncSource: 'OneDrive Hubungan Harga & Arus (2026-09-21)',

  // ─────────────────────────────────────────────────────────────────
  // Actions — Global Filters & Credentials
  // ─────────────────────────────────────────────────────────────────
  setSelectedPeriode:    (periode) => set({ selectedPeriode: periode }),
  setSelectedKomoditas:  (komoditas) => set((state) => {
    const isMapTab = state.activeTab === 'tab5' || state.activeTab === 'peta';
    const isSemua = komoditas === 'Semua' || komoditas === 'Semua Komoditas';
    const finalKomoditas = (!isMapTab && isSemua) ? DEFAULT_KOMODITAS : komoditas;
    return { selectedKomoditas: finalKomoditas };
  }),
  setSelectedWilayah:    (wilayah) => set({ selectedWilayah: wilayah }),
  setSelectedKlaster:    (klaster) => set({ selectedKlaster: klaster }),

  // P4: Auto-expire isRespondentUnlocked after 30 minutes
  setRespondentUnlocked: (unlocked) => {
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
    let current = [];
    if (Array.isArray(state.selectedPeriode)) {
      current = state.selectedPeriode.filter(p => p !== 'Semua');
    } else if (state.selectedPeriode && state.selectedPeriode !== 'Semua') {
      current = [state.selectedPeriode];
    }

    const idx = current.indexOf(periodeId);
    if (idx >= 0) {
      const next = current.filter(p => p !== periodeId);
      return { selectedPeriode: next.length === 0 ? 'Semua' : next.length === 1 ? next[0] : next };
    } else {
      const next = [...current, periodeId];
      return { selectedPeriode: next.length === 1 ? next[0] : next };
    }
  }),

  // ─────────────────────────────────────────────────────────────────
  // Actions — Tab-specific Filters (kept for backward compat)
  // ─────────────────────────────────────────────────────────────────
  setTab2Filters: (updates) => set((state) => ({ ...state, ...updates })),
  setTab3Filters: (updates) => set((state) => ({ ...state, ...updates })),
  setTab4Filters: (updates) => set((state) => ({ ...state, ...updates })),

  setActiveTab: (tab) => {
    set((state) => {
      const isMapTab = tab === 'tab5' || tab === 'peta';
      const isSemua = state.selectedKomoditas === 'Semua' || state.selectedKomoditas === 'Semua Komoditas' || !state.selectedKomoditas;
      const nextKomoditas = (!isMapTab && isSemua) ? DEFAULT_KOMODITAS : state.selectedKomoditas;
      return {
        activeTab: tab,
        selectedKomoditas: nextKomoditas,
        tabRenderKey: (state.tabRenderKey ?? 0) + 1
      };
    });
  },
  setDataModalOpen: (open) => set({ isDataModalOpen: open }),

  resetFilters: () => set((state) => ({
    selectedPeriode:   pickLatestPeriode(state.data)?.id_periode || DEFAULT_PERIODE,
    selectedKomoditas: DEFAULT_KOMODITAS,
    selectedWilayah:   DEFAULT_WILAYAH,
    selectedKlaster:   DEFAULT_KLASTER,
  })),

  // ─────────────────────────────────────────────────────────────────
  // Data Loading (100% sesuai versi deployed origin/main + hargaArusDatabase untuk Sub-Tab 2)
  // ─────────────────────────────────────────────────────────────────
  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [masterResult, hargaArusResult, alpsResult] = await Promise.all([
        ExcelService.getInitialData(),
        ExcelService.fetchEwsDatabase(false).catch(() => ({ data: null, source: 'seed_ews', timestamp: new Date().toISOString() })),
        // Database 2A (ALPS PIHPS) — tanpa ini Sub-Tab 1 EWS jatuh ke data seed bawaan
        ExcelService.fetchEwsAlpsDatabase(false).catch(() => ({ data: null, source: 'seed_alps', timestamp: new Date().toISOString() })),
      ]);
      const alpsParsed = alpsResult?.data || null;

      const { data, source, timestamp } = masterResult;
      const lastKal = pickLatestPeriode(data) || data.REF_KALENDER?.[data.REF_KALENDER.length - 1];
      const latestPeriode = lastKal?.id_periode || DEFAULT_PERIODE;

      const hargaArusParsed = hargaArusResult?.data || null;
      const ewsLatestWeek = hargaArusParsed?.meta?.lastPeriod || '2026-09-21';

      set({
        data,
        selectedPeriode: latestPeriode,
        hargaArusDatabase: hargaArusParsed,
        ...(alpsParsed ? {
          ewsDatabase: alpsParsed,
          ewsSyncTime: new Date(alpsResult.timestamp || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
          ewsSyncSource: `Dashboard ALPS PIHPS (${alpsParsed.meta?.periodeData || 'Jan 2019 – Sept 2026'})`,
        } : {}),
        hargaArusSyncTime: hargaArusParsed
          ? new Date(hargaArusResult.timestamp || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB'
          : null,
        hargaArusSyncSource: hargaArusParsed
          ? `OneDrive Hubungan Harga & Arus (${ewsLatestWeek})`
          : 'OneDrive Hubungan Harga & Arus',
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
      const lastKal = pickLatestPeriode(parsed) || parsed.REF_KALENDER?.[parsed.REF_KALENDER.length - 1];
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
        const lastKal = pickLatestPeriode(parsed) || parsed.REF_KALENDER?.[parsed.REF_KALENDER.length - 1];
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
        const { data: fresh, source } = await ExcelService.fetchMasterDatabase(true);
        const freshKal = pickLatestPeriode(fresh) || fresh.REF_KALENDER?.[fresh.REF_KALENDER.length - 1];
        set({
          data: fresh,
          selectedPeriode: freshKal?.id_periode || get().selectedPeriode,
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
  // Actions — Dedicated Database 2 (EWS Alert Database & Hubungan Harga-Arus)
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
      const nowLabel = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB';
      const isHubungan = url === 'hubungan' || (typeof url === 'string' && url.includes('IQCyJrPP'));

      if (isHubungan) {
        const res = await ExcelService.fetchEwsDatabase(true);
        if (res?.data) {
          const latestWeek = res.data.meta?.lastPeriod || '2026-09-21';
          set({
            hargaArusDatabase: res.data,
            isLoading: false,
            isDataModalOpen: false,
            hargaArusSyncTime: nowLabel,
            hargaArusSyncSource: `OneDrive Hubungan Harga & Arus (${latestWeek})`,
          });
        } else {
          set({ isLoading: false });
        }
        return;
      }

      if (url) {
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
          ewsSyncTime: nowLabel,
          ewsSyncSource: 'OneDrive EWS Live Sync',
        });
      }
    } catch (err) {
      set({ isLoading: false, error: 'Gagal sinkronisasi Database EWS: ' + err.message });
    }
  }
}));
