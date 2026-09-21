// SheetJS Excel Parser & Data Pipeline Service
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import * as XLSX from 'xlsx';
import { generateMasterDataset, REF_WILAYAH, REF_KOMODITAS, REF_KALENDER, REF_SATUAN } from '../data/seedData.js';
import { cleanDataset } from './dataCleaningService.js';

const CACHE_KEY = 'dashboard_komoditas_diy_data_v8';

export class ExcelService {
  /**
   * Fetch master dataset from static JSON with cache-busting
   */
  static async fetchMasterDatabase() {
    const timestamp = Date.now();

    // 1. Try Live Serverless API Proxy for OneDrive
    try {
      const apiRes = await fetch(`/api/sync-onedrive?t=${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (apiRes.ok) {
        const contentType = apiRes.headers.get('content-type') || '';
        if (contentType.includes('spreadsheet') || contentType.includes('octet-stream')) {
          const buffer = await apiRes.arrayBuffer();
          const parsed = await this.parseExcelBuffer(buffer);
          this.cacheData(parsed);
          return { data: parsed, source: 'onedrive_api_live', timestamp: new Date().toISOString() };
        } else {
          const parsed = await apiRes.json();
          if (parsed && parsed.laporan_ringkasan && parsed.laporan_ringkasan.length > 0) {
            const { cleanedDataset } = cleanDataset(parsed);
            this.cacheData(cleanedDataset);
            return { data: cleanedDataset, source: 'onedrive_api_live', timestamp: new Date().toISOString() };
          }
        }
      }
    } catch (apiErr) {
      console.info('[ExcelService] API Proxy not available, falling back to static master JSON', apiErr);
    }

    // 2. Try static master database JSON
    try {
      const res = await fetch(`/data/masterDatabase.json?t=${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const parsed = await res.json();
        if (parsed && parsed.laporan_ringkasan && parsed.laporan_ringkasan.length > 0) {
          const { cleanedDataset } = cleanDataset(parsed);
          this.cacheData(cleanedDataset);
          return { data: cleanedDataset, source: 'network_master', timestamp: new Date().toISOString() };
        }
      }
    } catch (err) {
      console.warn('Network fetch for masterDatabase.json failed, falling back to cache/seed', err);
    }

    // Fallback to cache if available
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.laporan_ringkasan && parsed.laporan_ringkasan.length > 0) {
          return { data: parsed, source: 'cache', timestamp: new Date().toISOString() };
        }
      }
    } catch (e) {
      console.warn('Cache read error, falling back to seed dataset', e);
    }

    // Ultimate fallback to runtime code generator
    const defaultData = generateMasterDataset();
    const { cleanedDataset } = cleanDataset(defaultData);
    this.cacheData(cleanedDataset);
    return { data: cleanedDataset, source: 'local_master', timestamp: new Date().toISOString() };
  }

  /**
   * Load data either from network masterDatabase, cache, or seed generator
   */
  static async getInitialData() {
    return await this.fetchMasterDatabase();
  }

  /**
   * Cache dataset in localStorage
   */
  static cacheData(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache in localStorage', e);
    }
  }

  /**
   * Clear localStorage cache (all versions)
   */
  static clearCache() {
    try {
      // AUDIT FIX: v8 (versi aktif) ditambahkan agar refresh benar-benar membersihkan cache terkini
      ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'].forEach(v => {
        localStorage.removeItem(`dashboard_komoditas_diy_data_${v}`);
      });
      // Juga hapus dengan CACHE_KEY lengkap untuk keamanan
      localStorage.removeItem(CACHE_KEY);
    } catch (e) {
      console.warn('Failed to clear cache', e);
    }
  }

  /**
   * Normalize and unpivot laporan_ringkasan for standard calculation engine.
   * Handles both pre-normalized (long format) and wide format rows.
   */
  static normalizeLaporanRingkasan(rawRows = [], komoditasRef = []) {
    const normalized = [];

    // Build a lookup map for satuan_dasar by komoditas name (from REF_KOMODITAS)
    const satuanDasarMap = new Map();
    komoditasRef.forEach(k => {
      satuanDasarMap.set(k.nama_komoditas.toLowerCase().trim(), k.satuan_dasar || 'Ton');
      if (k.nama_singkat) satuanDasarMap.set(k.nama_singkat.toLowerCase().trim(), k.satuan_dasar || 'Ton');
    });

    const resolveSatuanDasar = (komoditasName) => {
      if (!komoditasName) return 'Ton';
      const key = komoditasName.toLowerCase().replace(/\s*\(ton\)|\s*\(liter\)/g, '').trim();
      return satuanDasarMap.get(key) || 'Ton';
    };

    rawRows.forEach((row, idx) => {
      const idPeriode = row.id_periode || 'PER_2026_W38';
      const kabKota = row.kab_kota_responden || row.kab_kota || 'Kab. Sleman';
      const komoditas = row.komoditas || 'Beras Medium I';
      const idResponden = row.id_responden || `R_${idx + 1}`;
      const tipeResponden = (row.tipe_responden || 'PB').toLowerCase().includes('pb') ||
        (row.tipe_responden || '').toLowerCase().includes('pedagang')
        ? 'pedagang_besar' : 'produsen';
      const satuanField = row.satuan || 'Ton';
      const isDeleted = row.is_deleted || false;

      // Resolve satuan_dasar for this commodity
      const satuanDasar = resolveSatuanDasar(komoditas);
      const isLiquid = satuanDasar === 'Liter';

      // Check if row already has 'jenis_aliran' (long/normalized format)
      if (row.jenis_aliran && (typeof row.volume_ton !== 'undefined' || typeof row.volume_liter !== 'undefined')) {
        normalized.push({
          ...row,
          is_deleted: isDeleted,
          id_periode: idPeriode,
          kab_kota: kabKota,
          komoditas,
          id_responden: idResponden,
          tipe_responden: tipeResponden,
          volume_ton: Number(row.volume_ton) || 0,
          volume_liter: Number(row.volume_liter) || 0,
          harga_beli: Number(row.harga_beli) || 0,
          harga_jual: Number(row.harga_jual) || 0,
          satuan: satuanField,
          satuan_dasar: satuanDasar,
        });
        return;
      }

      // Wide format with vol_masuk & vol_keluar columns
      const volMasuk = Number(row.vol_masuk) || 0;
      const volKeluar = Number(row.vol_keluar) || 0;
      const hargaBeli = Number(row.harga_beli) || 0;
      const hargaJual = Number(row.harga_jual) || 0;

      // Use jenis_aliran suffix based on unit awareness
      // For liquid commodities (Minyak Goreng): still use 'vol_masuk_ton' key for compatibility
      // but route the numeric value into volume_liter, not volume_ton
      const inflowType  = 'vol_masuk_ton';
      const outflowType = 'vol_keluar_ton';

      // Row for Inflow (vol_masuk)
      normalized.push({
        row_id: row.row_id ? `${row.row_id}_in` : `norm_in_${idx}`,
        id_laporan: row.id_laporan ? `${row.id_laporan}_in` : `LAP_in_${idx}`,
        id_responden: idResponden,
        nama_responden: row.nama_responden || row.nama_usaha || `Responden ${idResponden}`,
        kab_kota: kabKota,
        komoditas,
        id_periode: idPeriode,
        jenis_aliran: inflowType,
        // Unit-aware volume routing: liquid goes to volume_liter, solid to volume_ton
        volume_ton:   isLiquid ? 0 : volMasuk,
        volume_liter: isLiquid ? volMasuk : 0,
        harga_beli: hargaBeli,
        harga_jual: hargaJual,
        tipe_responden: tipeResponden,
        satuan: isLiquid ? 'Liter' : satuanField,
        satuan_dasar: satuanDasar,
        is_deleted: isDeleted
      });

      // Row for Outflow (vol_keluar)
      normalized.push({
        row_id: row.row_id ? `${row.row_id}_out` : `norm_out_${idx}`,
        id_laporan: row.id_laporan ? `${row.id_laporan}_out` : `LAP_out_${idx}`,
        id_responden: idResponden,
        nama_responden: row.nama_responden || row.nama_usaha || `Responden ${idResponden}`,
        kab_kota: kabKota,
        komoditas,
        id_periode: idPeriode,
        jenis_aliran: outflowType,
        volume_ton:   isLiquid ? 0 : volKeluar,
        volume_liter: isLiquid ? volKeluar : 0,
        harga_beli: hargaBeli,
        harga_jual: hargaJual,
        tipe_responden: tipeResponden,
        satuan: isLiquid ? 'Liter' : satuanField,
        satuan_dasar: satuanDasar,
        is_deleted: isDeleted
      });
    });

    return normalized;
  }



  /**
   * Parse an ArrayBuffer / File object using SheetJS
   */
  static async parseExcelBuffer(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const result = {
      REF_WILAYAH,
      REF_KOMODITAS,
      REF_KALENDER,
      REF_SATUAN,
      laporan_ringkasan: [],
      arus_masuk: [],
      arus_keluar: [],
      respondents: [],
      quality_issues: []
    };

    let rawRingkasan = [];
    let profilPB = [];
    let profilProdusen = [];

    // Parse all sheets
    workbook.SheetNames.forEach(sheetName => {
      const cleanName = sheetName.trim();
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: null });

      if (/laporan_ringkasan|ringkasan/i.test(cleanName)) {
        rawRingkasan = json;
      } else if (/arus_masuk/i.test(cleanName)) {
        result.arus_masuk = json;
      } else if (/arus_keluar/i.test(cleanName)) {
        result.arus_keluar = json;
      } else if (/profil_pb/i.test(cleanName)) {
        profilPB = json;
      } else if (/profil_produsen/i.test(cleanName)) {
        profilProdusen = json;
      } else if (/ref_komoditas/i.test(cleanName)) {
        result.REF_KOMODITAS = json;
      } else if (/ref_wilayah/i.test(cleanName)) {
        result.REF_WILAYAH = json;
      } else if (/ref_kalender/i.test(cleanName)) {
        result.REF_KALENDER = json;
      }
    });

    // Fallback: use first sheet if no specific sheet found
    if (rawRingkasan.length === 0 && workbook.SheetNames.length > 0) {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      rawRingkasan = XLSX.utils.sheet_to_json(firstSheet, { defval: null });
    }

    // Normalize and unpivot laporan_ringkasan (pass komoditasRef for unit-aware routing)
    const komoditasRefForNorm = result.REF_KOMODITAS?.length > 0 ? result.REF_KOMODITAS : REF_KOMODITAS;
    result.laporan_ringkasan = this.normalizeLaporanRingkasan(rawRingkasan, komoditasRefForNorm);


    // Build respondents list
    const respondents = [];
    profilPB.forEach((pb, idx) => {
      respondents.push({
        id_responden: pb.id_responden || `PB00${idx + 1}`,
        nama_responden: pb.nama_usaha || pb.nama_narasumber || `Pedagang Besar ${idx + 1}`,
        tipe_responden: 'Pedagang Besar',
        kabupaten: pb.kab_kota || 'Kab. Sleman',
        status: 'Aktif'
      });
    });

    profilProdusen.forEach((prod, idx) => {
      respondents.push({
        id_responden: prod.id_responden || `PR00${idx + 1}`,
        nama_responden: prod.nama_produsen || prod.nama_narasumber || `Produsen ${idx + 1}`,
        tipe_responden: 'Produsen',
        kabupaten: prod.kab_kota || 'Kab. Bantul',
        status: 'Aktif'
      });
    });

    if (respondents.length > 0) {
      result.respondents = respondents;
    }

    // Merge missing reference elements from master
    const master = generateMasterDataset();
    if (result.laporan_ringkasan.length === 0) result.laporan_ringkasan = master.laporan_ringkasan;
    if (result.arus_masuk.length === 0) result.arus_masuk = master.arus_masuk;
    if (result.arus_keluar.length === 0) result.arus_keluar = master.arus_keluar;
    if (result.respondents.length === 0) result.respondents = master.respondents;
    if (result.quality_issues.length === 0) result.quality_issues = master.quality_issues;

    // Apply data cleaning pipeline
    const { cleanedDataset } = cleanDataset(result);

    this.cacheData(cleanedDataset);
    return cleanedDataset;
  }

  /**
   * Fetch from OneDrive or Public HTTP URL with fallback
   */
  static async fetchFromUrl(url) {
    if (!url) throw new Error('URL sumber data tidak boleh kosong');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    return await this.parseExcelBuffer(buffer);
  }

  /**
   * Export Sample Workbook template
   */
  static exportSampleWorkbook() {
    const data = generateMasterDataset();
    const wb = XLSX.utils.book_new();

    const wsRingkasan = XLSX.utils.json_to_sheet(data.laporan_ringkasan);
    XLSX.utils.book_append_sheet(wb, wsRingkasan, 'laporan_ringkasan');

    const wsArusMasuk = XLSX.utils.json_to_sheet(data.arus_masuk);
    XLSX.utils.book_append_sheet(wb, wsArusMasuk, 'arus_masuk');

    const wsArusKeluar = XLSX.utils.json_to_sheet(data.arus_keluar);
    XLSX.utils.book_append_sheet(wb, wsArusKeluar, 'arus_keluar');

    const wsKomoditas = XLSX.utils.json_to_sheet(data.REF_KOMODITAS);
    XLSX.utils.book_append_sheet(wb, wsKomoditas, 'REF_Komoditas');

    const wsWilayah = XLSX.utils.json_to_sheet(data.REF_WILAYAH);
    XLSX.utils.book_append_sheet(wb, wsWilayah, 'REF_Wilayah');

    const wsKalender = XLSX.utils.json_to_sheet(data.REF_KALENDER);
    XLSX.utils.book_append_sheet(wb, wsKalender, 'REF_Kalender');

    XLSX.writeFile(wb, 'Master_Database_Template_DIY.xlsx');
  }
}
