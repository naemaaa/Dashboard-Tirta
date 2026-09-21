/**
 * ============================================================================
 * DATA CLEANING SERVICE
 * Pipeline pembersihan & validasi data sebelum masuk ke Zustand store
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta · September 2026
 * ============================================================================
 *
 * ATURAN PEMBERSIHAN:
 * 1. Deduplikasi: composite key (id_responden + id_periode + id_komoditas + jenis_aliran)
 * 2. Validasi FK: id_periode ∈ REF_KALENDER, id_komoditas ∈ REF_KOMODITAS, kab_kota ∈ REF_WILAYAH
 * 3. Validasi Satuan UNIT-AWARE:
 *    - Komoditas satuan_dasar = 'Ton'  → volume_ton (Ton/Kg/Kuintal/Karung dikonversi ke Ton, Liter → DITOLAK)
 *    - Komoditas satuan_dasar = 'Liter' → volume_liter (Liter valid, Ton/Kg dikonversi ke Liter via densitas, satuan lain → DITOLAK)
 * 4. Filter Volume ≤ 1: is_deleted = true (toko tutup / tidak laporan)
 */

import { REF_KALENDER, REF_KOMODITAS, REF_WILAYAH } from '../data/seedData.js';

// Build lookup maps for fast FK validation
const VALID_PERIODE_IDS = new Set(REF_KALENDER.map(k => k.id_periode));
const VALID_KAB_KOTA = new Set(REF_WILAYAH.map(w => w.nama_kab_kota));

// Commodity lookup: id_komoditas → { satuan_dasar, nama }
const KOMODITAS_MAP = new Map(
  REF_KOMODITAS.map(k => [k.id_komoditas, k])
);
// Also index by normalized name for fuzzy matching
const KOMODITAS_NAME_MAP = new Map(
  REF_KOMODITAS.map(k => [
    k.nama_komoditas.toLowerCase().replace(/\s*\(ton\)|\s*\(liter\)/g, '').trim(),
    k
  ])
);

/**
 * Resolve satuan_dasar for a row based on id_komoditas or komoditas name
 */
function resolveKomoditasRef(row) {
  if (row.id_komoditas && KOMODITAS_MAP.has(row.id_komoditas)) {
    return KOMODITAS_MAP.get(row.id_komoditas);
  }
  if (row.komoditas) {
    const key = row.komoditas.toLowerCase().replace(/\s*\(ton\)|\s*\(liter\)/g, '').trim();
    if (KOMODITAS_NAME_MAP.has(key)) return KOMODITAS_NAME_MAP.get(key);
  }
  return null;
}

/**
 * Normalize volume based on satuan input and komoditas's satuan_dasar.
 *
 * Rules:
 * - If komoditas.satuan_dasar === 'Ton':
 *     Ton   → ×1
 *     Kg    → ×0.001
 *     Kuintal → ×0.1
 *     Karung 50kg → ×0.05
 *     Liter → NULL (rejected, quality issue)
 * - If komoditas.satuan_dasar === 'Liter':
 *     Liter → ×1
 *     Liter (ML/dL) → appropriate conversion
 *     Ton/Kg → NULL (rejected, quality issue — cannot mix mass with volume for liquid)
 *
 * Returns { normalizedVolume, satuan_normalized, rejected, rejectionReason }
 */
function normalizeVolume(rawVolume, inputSatuan, satuanDasar) {
  const vol = Number(rawVolume) || 0;
  const satuan = (inputSatuan || 'Ton').trim();

  if (satuanDasar === 'Liter') {
    const satuanLower = satuan.toLowerCase();
    if (satuanLower === 'liter' || satuanLower === 'l' || satuanLower === 'lt') {
      return { normalizedVolume: vol, satuan_normalized: 'Liter', rejected: false };
    }
    if (satuanLower === 'ml' || satuanLower === 'mililiter') {
      return { normalizedVolume: vol / 1000, satuan_normalized: 'Liter', rejected: false };
    }
    if (satuanLower === 'dl' || satuanLower === 'desiliter') {
      return { normalizedVolume: vol / 10, satuan_normalized: 'Liter', rejected: false };
    }
    // Ton/Kg untuk komoditas Liter = tidak valid
    return {
      normalizedVolume: 0,
      satuan_normalized: satuan,
      rejected: true,
      rejectionReason: `Satuan '${satuan}' tidak valid untuk komoditas ber-satuan Liter. Gunakan Liter.`
    };
  }

  // Default: satuanDasar === 'Ton' (solid commodities)
  const satuanLower = satuan.toLowerCase();
  if (satuanLower === 'ton') {
    return { normalizedVolume: vol, satuan_normalized: 'Ton', rejected: false };
  }
  if (satuanLower === 'kg' || satuanLower === 'kilogram') {
    return { normalizedVolume: vol * 0.001, satuan_normalized: 'Ton', rejected: false };
  }
  if (satuanLower === 'kuintal' || satuanLower === 'kwintal' || satuanLower === 'q') {
    return { normalizedVolume: vol * 0.1, satuan_normalized: 'Ton', rejected: false };
  }
  if (satuanLower.includes('karung') || satuanLower.includes('sak')) {
    return { normalizedVolume: vol * 0.05, satuan_normalized: 'Ton', rejected: false };
  }
  // Liter untuk komoditas Ton = tidak valid
  if (satuanLower === 'liter' || satuanLower === 'l' || satuanLower === 'lt') {
    return {
      normalizedVolume: 0,
      satuan_normalized: satuan,
      rejected: true,
      rejectionReason: `Satuan 'Liter' tidak valid untuk komoditas ber-satuan Ton. Liter dan Ton tidak dapat digabungkan.`
    };
  }
  // Unknown unit
  return { normalizedVolume: vol, satuan_normalized: 'Ton', rejected: false }; // assume Ton as fallback
}

/**
 * Main cleaning function for laporan_ringkasan
 *
 * @param {Array} rows - Raw laporan_ringkasan rows
 * @param {Array} existingQualityIssues - Existing quality issues array (will be appended to)
 * @returns {{ cleanedRows: Array, qualityIssues: Array, report: Object }}
 */
export function cleanLaporanRingkasan(rows = [], existingQualityIssues = []) {
  const qualityIssues = [...existingQualityIssues];
  const report = {
    total_input: rows.length,
    duplicates_removed: 0,
    fk_invalid: 0,
    unit_rejected: 0,
    volume_low_filtered: 0,
    cleaned_output: 0,
  };

  // Step 1: Deduplikasi
  const deduplicatedRows = [];
  const seenKeys = new Set();

  for (const row of rows) {
    const key = [
      row.id_responden || row.nama_responden || '',
      row.id_periode || '',
      row.id_komoditas || row.komoditas || '',
      row.jenis_aliran || ''
    ].join('|');

    if (seenKeys.has(key)) {
      report.duplicates_removed++;
      qualityIssues.push({
        periode: row.id_periode || '-',
        nama_responden: row.nama_responden || row.id_responden || '-',
        komoditas: row.komoditas || row.id_komoditas || '-',
        kab_kota: row.kab_kota || '-',
        jenis_isu: 'Duplikasi Data',
        detail: `Baris duplikat ditemukan: key=${key}. Baris pertama dipertahankan.`,
        status: 'Auto Dihapus'
      });
      continue;
    }
    seenKeys.add(key);
    deduplicatedRows.push(row);
  }

  // Step 2 & 3: FK validation + unit normalization + volume filter
  const cleanedRows = [];

  for (const row of deduplicatedRows) {
    let isInvalid = false;

    // --- FK: id_periode ---
    if (row.id_periode && !VALID_PERIODE_IDS.has(row.id_periode)) {
      report.fk_invalid++;
      qualityIssues.push({
        periode: row.id_periode || '-',
        nama_responden: row.nama_responden || '-',
        komoditas: row.komoditas || '-',
        kab_kota: row.kab_kota || '-',
        jenis_isu: 'FK Tidak Valid',
        detail: `id_periode '${row.id_periode}' tidak ditemukan di REF_KALENDER.`,
        status: 'Pending Review'
      });
      isInvalid = true;
    }

    // --- FK: kab_kota (fuzzy match) ---
    const rawKabKota = row.kab_kota || '';
    const kabKotaValid = VALID_KAB_KOTA.has(rawKabKota) ||
      Array.from(VALID_KAB_KOTA).some(v =>
        v.toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim() ===
        rawKabKota.toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim()
      );

    if (rawKabKota && !kabKotaValid) {
      report.fk_invalid++;
      qualityIssues.push({
        periode: row.id_periode || '-',
        nama_responden: row.nama_responden || '-',
        komoditas: row.komoditas || '-',
        kab_kota: rawKabKota,
        jenis_isu: 'Wilayah Non-Standar',
        detail: `Kab/Kota '${rawKabKota}' tidak terpetakan di REF_WILAYAH.`,
        status: 'Pending Review'
      });
      // Tidak invalidate — bisa jadi wilayah luar DIY yang legitimate
    }

    if (isInvalid) continue;

    // --- Unit normalization ---
    const komRef = resolveKomoditasRef(row);
    const satuanDasar = komRef?.satuan_dasar || row.satuan_dasar || 'Ton';
    const inputSatuan = row.satuan || satuanDasar;

    // CRITICAL FIX: Unit-aware rawVol extraction.
    // ?? operator fails for Liter komoditas: volume_ton=0 is a number (not null/undefined),
    // so `volume_ton ?? volume_liter` always reads 0 and never falls to volume_liter.
    // Solution: choose the correct field based on satuanDasar BEFORE applying ??.
    const rawVol = satuanDasar === 'Liter'
      ? (Number(row.volume_liter) || Number(row.volume) || 0)
      : (Number(row.volume_ton)   || Number(row.volume) || 0);

    const { normalizedVolume, satuan_normalized, rejected, rejectionReason } = normalizeVolume(
      rawVol, inputSatuan, satuanDasar
    );


    if (rejected) {
      report.unit_rejected++;
      qualityIssues.push({
        periode: row.id_periode || '-',
        nama_responden: row.nama_responden || '-',
        komoditas: row.komoditas || '-',
        kab_kota: row.kab_kota || '-',
        jenis_isu: 'Anomali Satuan',
        detail: rejectionReason,
        status: 'Pending Review'
      });
      continue; // Skip baris ini
    }

    // --- Volume field name based on satuan ---
    const volumeFieldName = satuanDasar === 'Liter' ? 'volume_liter' : 'volume_ton';

    // --- Filter Volume = 0 (toko tutup / tidak beroperasi) ---
    // CATATAN: Ambang batas HANYA volume = 0 (atau sangat kecil < 0.001).
    // Volume 0.1-1 Ton (100-1000 kg) adalah transaksi grosir yang VALID
    // untuk komoditas bernilai tinggi seperti cabai, bawang, daging, minyak goreng.
    if (normalizedVolume <= 0.001) {
      report.volume_low_filtered++;
      const cleanedRow = {
        ...row,
        [volumeFieldName]: normalizedVolume,
        volume_ton: satuanDasar === 'Ton' ? normalizedVolume : (row.volume_ton || 0),
        volume_liter: satuanDasar === 'Liter' ? normalizedVolume : (row.volume_liter || 0),
        satuan: satuan_normalized,
        satuan_dasar: satuanDasar,
        is_deleted: true,
        deletion_reason: `Volume = ${normalizedVolume} ${satuan_normalized} (toko tutup / tidak melaporkan transaksi pada periode ini)`
      };
      cleanedRows.push(cleanedRow);
      continue;
    }

    // --- Valid row ---
    cleanedRows.push({
      ...row,
      [volumeFieldName]: normalizedVolume,
      volume_ton: satuanDasar === 'Ton' ? normalizedVolume : (row.volume_ton || 0),
      volume_liter: satuanDasar === 'Liter' ? normalizedVolume : (row.volume_liter || 0),
      satuan: satuan_normalized,
      satuan_dasar: satuanDasar,
      is_deleted: row.is_deleted || false,
    });
  }

  report.cleaned_output = cleanedRows.filter(r => !r.is_deleted).length;

  return { cleanedRows, qualityIssues, report };
}

/**
 * Main entry point: clean entire dataset
 * @param {Object} dataset - Full master dataset object
 * @returns {{ cleanedDataset: Object, cleaning_report: Object }}
 */
export function cleanDataset(dataset) {
  if (!dataset || !dataset.laporan_ringkasan) {
    return { cleanedDataset: dataset, cleaning_report: { error: 'Dataset kosong atau tidak valid' } };
  }

  const { cleanedRows, qualityIssues, report } = cleanLaporanRingkasan(
    dataset.laporan_ringkasan,
    dataset.quality_issues || []
  );

  const cleanedDataset = {
    ...dataset,
    laporan_ringkasan: cleanedRows,
    quality_issues: qualityIssues,
    cleaning_report: report,
  };

  console.info('[DataCleaningService] Laporan pembersihan data:', report);

  return { cleanedDataset, cleaning_report: report };
}

/**
 * Get unit label for a given row based on satuan_dasar
 */
export function getUnitLabel(row) {
  return row?.satuan_dasar === 'Liter' ? 'Liter' : 'Ton';
}

/**
 * Get volume value for a given row based on satuan_dasar
 */
export function getVolume(row) {
  if (row?.satuan_dasar === 'Liter') return Number(row.volume_liter) || 0;
  return Number(row.volume_ton) || 0;
}
