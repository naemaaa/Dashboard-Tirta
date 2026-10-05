// SheetJS Excel Parser & Data Pipeline Service
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
// AUDIT FIXES:
// - C1: syncKalenderFromData() — auto-extend REF_KALENDER saat periode baru dari upload Excel
// - P1: fetchFromUrl() — 15-detik AbortController timeout
// - P2: cacheData() — quota-safe try/catch dengan estimasi ukuran

import * as XLSX from 'xlsx';
import { generateMasterDataset, REF_WILAYAH, REF_KOMODITAS, REF_KALENDER, REF_SATUAN } from '../data/seedData.js';
import { cleanDataset } from './dataCleaningService.js';
import { CACHE_KEY, FETCH_TIMEOUT_MS, API_SYNC_ONEDRIVE } from '../config/env.js';

export class ExcelService {

  // ─────────────────────────────────────────────────────────────────
  // C1 FIX: Auto-extend REF_KALENDER from uploaded data
  // Jika data Excel mengandung id_periode yang belum ada di REF_KALENDER,
  // tambahkan entri baru ke array kalender agar FK validator tidak membuang baris.
  // ─────────────────────────────────────────────────────────────────
  static syncKalenderFromData(rows = [], refKalender = []) {
    const existingIds = new Set(refKalender.map(k => k.id_periode));
    let added = 0;

    rows.forEach(row => {
      let pid = row.id_periode;

      // Handle missing id_periode by checking periode_mulai or tgl_mulai
      if (!pid && (row.periode_mulai || row.tgl_mulai)) {
        const rawDateStr = String(row.periode_mulai || row.tgl_mulai);
        const dateObj = new Date(rawDateStr);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const jan1 = new Date(year, 0, 1);
          const dayOfYear = Math.floor((dateObj - jan1) / 86400000);
          const week = Math.ceil((dayOfYear + jan1.getDay() + 1) / 7);
          pid = `PER_${year}_W${week}`;
          row.id_periode = pid;
        }
      }

      if (!pid) return;

      // Normalize period format (PER_YYYY_Www or YYYY-Www)
      const match = pid.match(/(?:PER_)?(\d{4})_?W(\d+)/i);
      if (match) {
        const year = match[1];
        const week = parseInt(match[2], 10);
        pid = `PER_${year}_W${week}`;
        row.id_periode = pid;
      }

      if (existingIds.has(pid)) return;

      let label = pid;
      let labelSingkat = pid;
      let tglMulai = new Date().toISOString().slice(0, 10);
      let namaBulan = '';
      let mingguKe = 0;

      if (match) {
        const year = match[1];
        const week = parseInt(match[2], 10);
        mingguKe = week;
        const jan1 = new Date(parseInt(year), 0, 1);
        const dayOffset = (week - 1) * 7;
        const weekDate = new Date(jan1.getTime() + dayOffset * 86400000);
        tglMulai = weekDate.toISOString().slice(0, 10);
        const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        namaBulan = monthNames[weekDate.getMonth()];
        label = `${year}-W${week} (${namaBulan})`;
        labelSingkat = `${year}-W${week}`;
      }

      refKalender.push({
        id_periode: pid,
        label_periode: label,
        label_singkat: labelSingkat,
        tgl_mulai: tglMulai,
        nama_bulan: namaBulan,
        minggu_ke: mingguKe,
        _auto_generated: true,
      });
      existingIds.add(pid);
      added++;
    });

    if (added > 0) {
      refKalender.sort((a, b) => new Date(a.tgl_mulai) - new Date(b.tgl_mulai));
      console.info(`[ExcelService] C1 Fix: Auto-extended REF_KALENDER dengan ${added} periode baru.`);
    }

    return refKalender;
  }

  /**
   * Fetch master dataset from static JSON with cache-busting
   */
  static async fetchMasterDatabase() {
    const timestamp = Date.now();

    // 1. Try Live Serverless API Proxy for OneDrive
    try {
      const apiRes = await this._fetchWithTimeout(`${API_SYNC_ONEDRIVE}?t=${timestamp}`, {
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
      const res = await this._fetchWithTimeout(`/data/masterDatabase.json?t=${timestamp}`, {
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
   * P1 FIX: Fetch with AbortController timeout (15 seconds)
   */
  static async _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error(`Permintaan ke ${url} melebihi batas waktu ${FETCH_TIMEOUT_MS / 1000} detik. Cek koneksi internet.`);
      }
      throw err;
    }
  }

  /**
   * Load data either from network masterDatabase, cache, or seed generator
   */
  static async getInitialData() {
    return await this.fetchMasterDatabase();
  }

  /**
   * P2 FIX: Cache dataset in localStorage with quota-safe try/catch
   * If data is too large (>4MB estimate), skip caching gracefully.
   */
  static cacheData(data) {
    try {
      const serialized = JSON.stringify(data);
      // Estimate: 4MB = 4 * 1024 * 1024 = 4194304 chars (each JS char ≈ 2 bytes in memory)
      if (serialized.length > 4_000_000) {
        console.warn(`[ExcelService] P2: Dataset terlalu besar untuk cache (${(serialized.length / 1024).toFixed(0)} KB). Cache dilewati.`);
        return;
      }
      localStorage.setItem(CACHE_KEY, serialized);
    } catch (e) {
      // Catch QuotaExceededError and others gracefully
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn('[ExcelService] P2: localStorage quota exceeded. Cache dilewati — app tetap berfungsi dengan data di memori.');
        // Try to free space by removing old cache versions
        try {
          ['v1','v2','v3','v4','v5','v6','v7'].forEach(v => {
            localStorage.removeItem(`dashboard_komoditas_diy_data_${v}`);
          });
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          console.warn('[ExcelService] P2: Cache tidak dapat disimpan bahkan setelah pembesihan. Data hanya di memori.');
        }
      } else {
        console.warn('[ExcelService] P2: Cache gagal disimpan:', e);
      }
    }
  }

  /**
   * Clear localStorage cache (all versions)
   */
  static clearCache() {
    try {
      ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'].forEach(v => {
        localStorage.removeItem(`dashboard_komoditas_diy_data_${v}`);
      });
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
      REF_KALENDER: [...REF_KALENDER], // mutable copy for C1 fix
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
      } else if (/ews_heatmap|ews_summary|early_warning|ews_data/i.test(cleanName)) {
        if (!result.ews_data) result.ews_data = {};
        result.ews_data.heatmap = json;
      } else if (/ews_time_series|ews_history|ews_pelaku/i.test(cleanName)) {
        if (!result.ews_data) result.ews_data = {};
        result.ews_data.timeSeries = json;
      } else if (/ews_forecast|ews_proyeksi/i.test(cleanName)) {
        if (!result.ews_data) result.ews_data = {};
        result.ews_data.forecast = json;
      }
    });

    // Fallback: use first sheet if no specific sheet found
    if (rawRingkasan.length === 0 && workbook.SheetNames.length > 0) {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      rawRingkasan = XLSX.utils.sheet_to_json(firstSheet, { defval: null });
    }

    // C1 FIX: Auto-extend REF_KALENDER from actual data before cleaning
    result.REF_KALENDER = this.syncKalenderFromData(rawRingkasan, result.REF_KALENDER);

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
   * Parse EWS Excel File (Database 2 — Standalone)
   * File: Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx
   *
   * Membaca semua sheet dan mengekstrak data EWS secara fleksibel.
   * Sheet yang dicari (case-insensitive, trim):
   *   - heatmap / ews_heatmap / alps / summary → ewsData.heatmap
   *   - time_series / pelaku / history / perkembangan → ewsData.timeSeries
   *   - forecast / proyeksi / arima → ewsData.forecast
   *
   * Kolom heatmap yang dinormalisasi (case-insensitive):
   *   komoditas | heatmap_pb / pb | heatmap_pe / pe | heatmap_prod / prod
   *   alps komoditas / alps / status | current_pressure | forecast_pressure
   */
  static async parseEwsExcelBuffer(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const ewsData = {
      heatmap: [],
      timeSeries: [],
      forecast: [],
    };

    console.info('[EWS Parser] Sheet ditemukan:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
      const cn = sheetName.trim().toLowerCase().replace(/\s+/g, '_');
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: null });

      if (json.length === 0) return;

      // ── Heatmap / ALPS Summary Sheet ──────────────────────────────────────
      if (
        /heatmap|ews_heatmap|alps|early.warning.*harga|summary|komoditas.*diy|harga.*komoditas/i.test(cn)
      ) {
        console.info(`[EWS Parser] Sheet HEATMAP terdeteksi: "${sheetName}" (${json.length} baris)`);
        ewsData.heatmap = json;
        return;
      }

      // ── Time Series / Perkembangan Harga Pelaku ───────────────────────────
      if (
        /time.series|pelaku|perkembangan|history|ews_history|tingkat.*produsen|produsen.*pedagang/i.test(cn)
      ) {
        console.info(`[EWS Parser] Sheet TIME SERIES terdeteksi: "${sheetName}" (${json.length} baris)`);
        ewsData.timeSeries = json;
        return;
      }

      // ── Forecast / Proyeksi ARIMA ─────────────────────────────────────────
      if (
        /forecast|proyeksi|arima|prediksi|tren.*harga|harga.*tren/i.test(cn)
      ) {
        console.info(`[EWS Parser] Sheet FORECAST terdeteksi: "${sheetName}" (${json.length} baris)`);
        ewsData.forecast = json;
        return;
      }
    });

    // ── Fallback: Jika hanya 1 sheet, anggap sebagai heatmap ─────────────────
    if (ewsData.heatmap.length === 0 && workbook.SheetNames.length > 0) {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      ewsData.heatmap = XLSX.utils.sheet_to_json(firstSheet, { defval: null });
      console.warn('[EWS Parser] Tidak ada sheet bernama heatmap/alps. Menggunakan sheet pertama sebagai fallback heatmap.');
    }

    console.info('[EWS Parser] Hasil parse:', {
      heatmap: ewsData.heatmap.length,
      timeSeries: ewsData.timeSeries.length,
      forecast: ewsData.forecast.length,
    });

    return ewsData;
  }

  /**
   * Universal OneDrive URL Converter
   * Handles ALL OneDrive link formats and converts them to direct binary download URLs.
   *
   * Format yang didukung:
   *   1. 1drv.ms short links  → https://1drv.ms/x/c/...?e=...
   *   2. Doc.aspx viewer      → https://onedrive.live.com/.../Doc.aspx?sourcedoc=...
   *   3. Direct download.aspx → passthrough
   *   4. SharePoint embed     → passthrough
   */
  static convertOneDriveUrlToDownloadUrl(url) {
    if (!url) return url;
    let converted = url.trim();

    // Format 1: 1drv.ms short link
    // Konversi 1drv.ms ke OneDrive download endpoint menggunakan parameter download=1
    // Contoh: https://1drv.ms/x/c/91bfd97920eb749f/IQAMD...?e=actP9C
    if (converted.includes('1drv.ms')) {
      // Tambahkan parameter download=1 agar forced ke download bukan preview
      // Jika sudah ada query string pakai &, jika tidak pakai ?
      if (converted.includes('?')) {
        // Hapus parameter berlebih yang tidak relevan lalu tambah download=1
        converted = converted + '&download=1';
      } else {
        converted = converted + '?download=1';
      }
      return converted;
    }

    // Format 2: OneDrive live Doc.aspx (web viewer) → ubah ke download.aspx
    // Contoh: https://onedrive.live.com/personal/xxx/_layouts/15/Doc.aspx?sourcedoc={...}&action=default
    if (converted.includes('onedrive.live.com') && converted.includes('Doc.aspx')) {
      converted = converted
        .replace('Doc.aspx', 'download.aspx')
        .replace('action=default', 'action=download')
        .replace('mobileredirect=true', '');
      return converted;
    }

    // Format 3: onedrive.live.com/download atau sharepoint — passthrough langsung
    return converted;
  }

  /**
   * Fetch Excel dari OneDrive / URL publik manapun dengan 15s timeout.
   * Mendukung semua format OneDrive URL via convertOneDriveUrlToDownloadUrl().
   */
  static async fetchFromUrl(url) {
    if (!url) throw new Error('URL sumber data tidak boleh kosong');
    const directUrl = this.convertOneDriveUrlToDownloadUrl(url);
    const res = await this._fetchWithTimeout(directUrl, {
      redirect: 'follow',                  // ikuti redirect 1drv.ms → download server
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*'
      }
    });
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
