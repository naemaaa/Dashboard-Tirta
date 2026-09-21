// Zustand Global State Store for Dashboard Komoditas DIY
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import { create } from 'zustand';
import { ExcelService } from '../services/excelService.js';
import { generateMasterDataset, REF_KOMODITAS, REF_KALENDER } from '../data/seedData.js';

const DEFAULT_KOMODITAS = REF_KOMODITAS[0].nama_komoditas; // 'Beras Medium I'
const DEFAULT_PERIODE    = REF_KALENDER[REF_KALENDER.length - 1].id_periode; // 'PER_2026_W38' (periode terbaru)
const DEFAULT_WILAYAH    = 'Semua Wilayah DIY';
const DEFAULT_KLASTER    = 'semua';

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
  // Tab 2 Sub Filters (Detail Arus & Rantai Pasok)
  // Komoditas: single, Kabupaten: multi, Responden: single
  // ─────────────────────────────────────────────────────────────────
  tab2Komoditas:  DEFAULT_KOMODITAS,
  tab2Kabupaten:  'Semua',    // string 'Semua' or specific kab
  tab2Responden:  'Semua',    // 'Semua' | 'Pedagang Besar' | 'Produsen'

  // ─────────────────────────────────────────────────────────────────
  // Tab 3 Sub Filters (Harga & Marjin)
  // Periode: multi-select, Komoditas: single
  // ─────────────────────────────────────────────────────────────────
  tab3Periode:    [],           // string[] — kosong = semua periode
  tab3Komoditas:  DEFAULT_KOMODITAS,

  // ─────────────────────────────────────────────────────────────────
  // Tab 4 Sub Filters (Tren Antarwaktu)
  // Komoditas: single, Wilayah: single
  // Periode sudah multi by design (chart menampilkan semua periode)
  // ─────────────────────────────────────────────────────────────────
  tab4Komoditas:  DEFAULT_KOMODITAS,
  tab4Wilayah:    DEFAULT_WILAYAH,
  tab4Klaster:    DEFAULT_KLASTER,

  // ─────────────────────────────────────────────────────────────────
  // UI State
  // ─────────────────────────────────────────────────────────────────
  activeTab:       'tab1',
  isLoading:       false,
  error:           null,
  isDataModalOpen: false,
  lastSyncTime:    '20 Sep 2026 13:00 WIB',
  syncSource:      'Master Database (September 2026)',

  // Master & Raw Dataset
  data: generateMasterDataset(),

  // ─────────────────────────────────────────────────────────────────
  // Actions — Global Filters
  // ─────────────────────────────────────────────────────────────────
  setSelectedPeriode:   (periode) => set({ selectedPeriode: periode }),
  setSelectedKomoditas: (komoditas) => set({ selectedKomoditas: komoditas }),
  setSelectedWilayah:   (wilayah) => set({ selectedWilayah: wilayah }),
  setSelectedKlaster:   (klaster) => set({ selectedKlaster: klaster }),

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
  // Actions — Tab-specific Filters
  // ─────────────────────────────────────────────────────────────────
  setTab2Filters: (updates) => set((state) => ({ ...state, ...updates })),
  setTab3Filters: (updates) => set((state) => ({ ...state, ...updates })),
  setTab4Filters: (updates) => set((state) => ({ ...state, ...updates })),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setDataModalOpen: (open) => set({ isDataModalOpen: open }),

  resetFilters: () => set({
    selectedPeriode:   DEFAULT_PERIODE,
    selectedKomoditas: DEFAULT_KOMODITAS,
    selectedWilayah:   DEFAULT_WILAYAH,
    selectedKlaster:   DEFAULT_KLASTER,
    tab2Komoditas:     DEFAULT_KOMODITAS,
    tab2Kabupaten:     'Semua',
    tab2Responden:     'Semua',
    tab3Periode:       [],
    tab3Komoditas:     DEFAULT_KOMODITAS,
    tab4Komoditas:     DEFAULT_KOMODITAS,
    tab4Wilayah:       DEFAULT_WILAYAH,
    tab4Klaster:       DEFAULT_KLASTER,
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
        lastSyncTime: new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
        syncSource: source === 'cache' ? 'Cached Database' : 'Master Database (September 2026)',
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
        lastSyncTime: 'Baru saja diunggah',
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
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
        const lastKal = parsed.REF_KALENDER?.[parsed.REF_KALENDER.length - 1];
        set({
          data: parsed,
          selectedPeriode: lastKal?.id_periode || get().selectedPeriode,
          isLoading: false,
          isDataModalOpen: false,
          lastSyncTime: timeStr,
          syncSource: 'OneDrive Live Sync',
        });
      } else {
        ExcelService.clearCache();
        const { data: fresh, source } = await ExcelService.fetchMasterDatabase();
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
        const lastKal = fresh.REF_KALENDER?.[fresh.REF_KALENDER.length - 1];
        set({
          data: fresh,
          selectedPeriode: lastKal?.id_periode || get().selectedPeriode,
          isLoading: false,
          lastSyncTime: timeStr,
          syncSource: source === 'network_master' ? 'Master JSON Live' : 'Database Terkini (September 2026)',
        });
      }
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Gagal sinkronisasi data' });
    }
  }
}));
