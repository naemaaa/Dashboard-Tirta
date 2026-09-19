// Zustand Global State Store for Dashboard Komoditas DIY
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import { create } from 'zustand';
import { ExcelService } from '../services/excelService';
import { generateMasterDataset, REF_KOMODITAS, REF_KALENDER } from '../data/seedData';

const DEFAULT_KOMODITAS = REF_KOMODITAS[0].nama_komoditas; // 'Beras Medium I (Ton)'
const DEFAULT_PERIODE = REF_KALENDER[REF_KALENDER.length - 1].id_periode; // 'PER_2026_W33'
const DEFAULT_WILAYAH = 'Semua Wilayah DIY';
const DEFAULT_KLASTER = 'pedagang_besar';

export const useDashboardStore = create((set, get) => ({
  // Global Filters (Section 6.1, Section 12.2)
  selectedPeriode: DEFAULT_PERIODE,
  selectedKomoditas: DEFAULT_KOMODITAS,
  selectedWilayah: DEFAULT_WILAYAH,
  selectedKlaster: DEFAULT_KLASTER,

  // Tab 2 Sub Filters
  tab2Komoditas: DEFAULT_KOMODITAS,
  tab2Kabupaten: 'Semua', // 'Semua' or array of kab
  tab2Responden: 'Semua',

  // UI State
  activeTab: 'tab1',
  isLoading: false,
  error: null,
  isDataModalOpen: false,
  lastSyncTime: '19 Sep 2026 20:00 WIB',
  syncSource: 'Master Database (September 2026)',

  // Master & Raw Dataset
  data: generateMasterDataset(),

  // Actions
  setSelectedPeriode: (periode) => set({ selectedPeriode: periode }),
  setSelectedKomoditas: (komoditas) => set({ selectedKomoditas: komoditas }),
  setSelectedWilayah: (wilayah) => set({ selectedWilayah: wilayah }),
  setSelectedKlaster: (klaster) => set({ selectedKlaster: klaster }),

  setTab2Filters: (updates) => set((state) => ({ ...state, ...updates })),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setDataModalOpen: (open) => set({ isDataModalOpen: open }),

  resetFilters: () => set({
    selectedPeriode: DEFAULT_PERIODE,
    selectedKomoditas: DEFAULT_KOMODITAS,
    selectedWilayah: DEFAULT_WILAYAH,
    selectedKlaster: DEFAULT_KLASTER,
    tab2Komoditas: DEFAULT_KOMODITAS,
    tab2Kabupaten: 'Semua',
    tab2Responden: 'Semua',
  }),

  // Data Loading actions
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
        lastSyncTime: new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
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
          lastSyncTime: `${timeStr}`,
          syncSource: 'OneDrive Live Sync',
        });
      } else {
        // Clear stale local storage caches
        ExcelService.clearCache();
        // Fetch fresh master dataset
        const { data: fresh, source } = await ExcelService.fetchMasterDatabase();
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
        const lastKal = fresh.REF_KALENDER?.[fresh.REF_KALENDER.length - 1];
        set({
          data: fresh,
          selectedPeriode: lastKal?.id_periode || get().selectedPeriode,
          isLoading: false,
          lastSyncTime: `${timeStr}`,
          syncSource: source === 'network_master' ? 'Master JSON Live' : 'Database Terkini (September 2026)',
        });
      }
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Gagal sinkronisasi data' });
    }
  }
}));
