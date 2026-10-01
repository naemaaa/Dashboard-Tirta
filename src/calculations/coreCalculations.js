/**
 * ============================================================================
 * MODUL KALKULASI UTAMA (DAX -> JAVASCRIPT)
 * Referensi Lengkap DAX Measures Dashboard Komoditas DIY v1.0
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta · September 2026
 * ============================================================================
 * 
 * ATURAN WAJIB UNPIVOT:
 * 1. SUM volume -> filter dulu jenis_aliran = 'vol_masuk_ton' / 'vol_keluar_ton', baru SUM(Value)
 * 2. AVERAGE harga -> filter jenis_aliran = 'vol_masuk_ton' && tipe_responden = 'pedagang_besar' && harga > 0
 * 3. SUM stok/susut -> filter jenis_aliran = 'vol_masuk_ton' untuk dapat 1 baris per laporan (hindari double count)
 * 4. Jangan pernah SUM(harga_beli) atau SUM(harga_jual) langsung tanpa filter jenis_aliran
 *
 * AUDIT FIX LOG (21 Sep 2026):
 * - BUG-3: VWAP || 1 fallback dihapus → hanya baris dengan volume > 0 yang masuk VWAP
 * - BUG-6: calculatePctLuarDiy() kini unit-aware (Ton & Liter)
 * - BUG-4: Unified matcher functions ditambahkan sebagai single source of truth
 */

/**
 * Unit-aware volume extractor
 * Reads volume_ton for solid commodities (satuan_dasar = 'Ton')
 * Reads volume_liter for liquid commodities (satuan_dasar = 'Liter', e.g. Minyak Goreng)
 * This ensures Liter and Ton are NEVER mixed in a single aggregation.
 */
export function getRowVolume(row) {
  if (!row) return 0;
  if (row.satuan_dasar === 'Liter') return Number(row.volume_liter) || 0;
  return Number(row.volume_ton) || Number(row.Value) || 0;
}

/**
 * Get volume unit label for a row
 */
export function getRowUnit(row) {
  return row?.satuan_dasar === 'Liter' ? 'Liter' : 'Ton';
}

/**
 * 1.1 Total Volume Masuk (unit-aware: Ton atau Liter tergantung komoditas)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton")
 * @param {Array} rows - Array data laporan_ringkasan
 * @returns {number} Total volume masuk dalam satuan native komoditas (Ton atau Liter)
 */
export function calculateVolumeMasuk(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton')
    .reduce((sum, r) => sum + getRowVolume(r), 0);
  return Number(vol.toFixed(2));
}

/**
 * 1.2 Total Volume Keluar (unit-aware: Ton atau Liter tergantung komoditas)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_keluar_ton")
 * @param {Array} rows - Array data laporan_ringkasan
 * @returns {number} Total volume keluar dalam satuan native komoditas
 */
export function calculateVolumeKeluar(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_keluar_ton')
    .reduce((sum, r) => sum + getRowVolume(r), 0);
  return Number(vol.toFixed(2));
}

/**
 * 1.3 Total Volume Masuk Pedagang Besar (unit-aware)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton", laporan_ringkasan[tipe_responden] = "pedagang_besar")
 */
export function calculateVolumeMasukPB(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton' && (r.tipe_responden === 'pedagang_besar' || (r.tipe_responden || '').toLowerCase().includes('pedagang')))
    .reduce((sum, r) => sum + getRowVolume(r), 0);
  return Number(vol.toFixed(2));
}

/**
 * 1.4 Total Volume Keluar Pedagang Besar (unit-aware)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_keluar_ton", laporan_ringkasan[tipe_responden] = "pedagang_besar")
 */
export function calculateVolumeKeluarPB(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_keluar_ton' && (r.tipe_responden === 'pedagang_besar' || (r.tipe_responden || '').toLowerCase().includes('pedagang')))
    .reduce((sum, r) => sum + getRowVolume(r), 0);
  return Number(vol.toFixed(2));
}

/**
 * 1.5 Total Volume Produksi Produsen (unit-aware)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton", laporan_ringkasan[tipe_responden] = "produsen")
 */
export function calculateVolumeProduksi(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton' && (r.tipe_responden === 'produsen' || (r.tipe_responden || '').toLowerCase().includes('produsen')))
    .reduce((sum, r) => sum + getRowVolume(r), 0);
  return Number(vol.toFixed(2));
}

/**
 * 2.1 Neraca Bersih (Ton)
 * DAX: [Total_Vol_Masuk_Ton] - [Total_Vol_Keluar_Ton]
 * Positif = Surplus pasokan, Negatif = Defisit pasokan
 */
export function calculateNeracaBersih(volMasuk, volKeluar) {
  return Number(((volMasuk || 0) - (volKeluar || 0)).toFixed(2));
}

/**
 * 2.2 Status Neraca (Kondisional)
 * DAX: IF([Neraca_Bersih] > 0.1, "SURPLUS", IF([Neraca_Bersih] < -0.1, "DEFISIT", "SEIMBANG"))
 * Threshold ±0.1 ton untuk menghindari false positive pembulatan floating point.
 * AUDIT NOTE: Threshold 0.1 Ton dipertahankan (PRD menggunakan nilai berbeda 0.01, namun 0.1 lebih
 * aman untuk menghindari false positive akibat pembulatan desimal pada data grosir mingguan).
 */
export function calculateStatusNeraca(neracaBersih) {
  if (neracaBersih > 0.1) return 'SURPLUS';
  if (neracaBersih < -0.1) return 'DEFISIT';
  return 'SEIMBANG';
}

/**
 * 2.3 Rasio Masuk vs Keluar
 * DAX: DIVIDE([Total_Vol_Masuk_Ton], [Total_Vol_Keluar_Ton], 0)
 * Nilai > 1 artinya masuk lebih banyak dari keluar (surplus).
 */
export function calculateRasioMasukKeluar(volMasuk, volKeluar) {
  if (!volKeluar || volKeluar === 0) return 0;
  return Number(((volMasuk || 0) / volKeluar).toFixed(2));
}

/**
 * 3.1 Rerata Harga Beli TERTIMBANG VOLUME (VWAP) (Rp/kg)
 * DAX: SUMX(FILTER(..., harga_beli > 0 AND volume > 0), harga_beli * volume) / SUMX(..., volume)
 * Sesuai PRD: harga rata-rata tertimbang volume, bukan simple average responden.
 *
 * AUDIT FIX (BUG-3): Dihapus fallback || 1 pada getRowVolume.
 * Filter volume > 0 ditambahkan agar baris tanpa transaksi nyata tidak mendistorsi VWAP.
 */
export function calculateAvgHargaBeli(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const validRows = rows.filter(
    r => r.jenis_aliran === 'vol_masuk_ton' &&
         Number(r.harga_beli) > 0 &&
         getRowVolume(r) > 0  // FIX: hanya baris dengan volume nyata > 0
  );
  if (validRows.length === 0) return 0;
  // Volume-Weighted Average Price (VWAP) — sesuai PRD formula
  const sumWeightedPrice = validRows.reduce((acc, r) => acc + Number(r.harga_beli) * getRowVolume(r), 0);
  const sumVolume        = validRows.reduce((acc, r) => acc + getRowVolume(r), 0);
  return sumVolume > 0 ? Math.round(sumWeightedPrice / sumVolume) : 0;
}

/**
 * 3.2 Rerata Harga Jual TERTIMBANG VOLUME (VWAP) (Rp/kg)
 * DAX: SUMX(FILTER(..., harga_jual > 0 AND volume > 0), harga_jual * volume) / SUMX(..., volume)
 *
 * AUDIT FIX (BUG-3): Dihapus fallback || 1 pada getRowVolume.
 */
export function calculateAvgHargaJual(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const validRows = rows.filter(
    r => r.jenis_aliran === 'vol_masuk_ton' &&
         Number(r.harga_jual) > 0 &&
         getRowVolume(r) > 0  // FIX: hanya baris dengan volume nyata > 0
  );
  if (validRows.length === 0) return 0;
  // Volume-Weighted Average Price (VWAP)
  const sumWeightedPrice = validRows.reduce((acc, r) => acc + Number(r.harga_jual) * getRowVolume(r), 0);
  const sumVolume        = validRows.reduce((acc, r) => acc + getRowVolume(r), 0);
  return sumVolume > 0 ? Math.round(sumWeightedPrice / sumVolume) : 0;
}

/**
 * 3.3 Nominal Marjin Perdagangan (Rp/kg)
 * DAX: [Harga_Rata_Jual] - [Harga_Rata_Beli]
 */
export function calculateMarginRp(avgHargaJual, avgHargaBeli) {
  return Math.round((avgHargaJual || 0) - (avgHargaBeli || 0));
}

/**
 * 3.4 Persentase Marjin (%)
 * DAX: DIVIDE([Margin_Harga], [Harga_Rata_Beli], 0) * 100
 */
export function calculateMarginPct(marginRp, avgHargaBeli) {
  if (!avgHargaBeli || avgHargaBeli <= 0) return 0;
  return Number(((marginRp / avgHargaBeli) * 100).toFixed(1));
}

/**
 * 3.5 Label Status Marjin
 * DAX: IF([Margin_Pct] > 5, "Wajar", IF([Margin_Pct] > 1, "Tipis", IF([Margin_Pct] > 0, "Sangat Tipis", "Negatif")))
 */
export function getMarginClassification(marginPct) {
  if (marginPct > 5) return 'Wajar';
  if (marginPct > 1) return 'Tipis';
  if (marginPct > 0) return 'Sangat Tipis';
  return 'Negatif';
}

/**
 * 4.1 Total Stok Akhir (Ton/Liter)
 * DAX: CALCULATE(SUM(laporan_ringkasan[stok_akhir_ton]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton")
 * Filter vol_masuk_ton karena stok akhir hanya ada di baris _in (baris _out tidak membawa stok).
 */
export function calculateTotalStokAkhir(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const total = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton')
    .reduce((sum, r) => {
      const vol = r.satuan_dasar === 'Liter'
        ? (Number(r.stok_akhir_liter) || Number(r.stok_akhir_ton) || 0)
        : (Number(r.stok_akhir_ton) || 0);
      return sum + vol;
    }, 0);
  return Number(total.toFixed(2));
}

/**
 * 4.2 Total Susut / Losses (Ton/Liter)
 * DAX: CALCULATE(SUM(laporan_ringkasan[susut_ton]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton")
 * Filter vol_masuk_ton karena susut hanya ada di baris _in (baris _out tidak membawa susut).
 */
export function calculateTotalSusut(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const total = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton')
    .reduce((sum, r) => {
      const vol = r.satuan_dasar === 'Liter'
        ? (Number(r.susut_liter) || Number(r.susut_ton) || 0)
        : (Number(r.susut_ton) || 0);
      return sum + vol;
    }, 0);
  return Number(total.toFixed(2));
}

/**
 * 5.1 Jumlah Responden Unik Melaporkan
 * DAX: CALCULATE(DISTINCTCOUNT(laporan_ringkasan[id_responden]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton")
 */
export function calculateJumlahResponden(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const uniqueIds = new Set(
    rows.filter(r => r.jenis_aliran === 'vol_masuk_ton').map(r => r.id_responden || r.nama_responden)
  );
  return uniqueIds.size;
}

/**
 * 5.2 Jumlah Data / Baris Laporan Aktif
 * DAX: CALCULATE(COUNTROWS(laporan_ringkasan), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton")
 */
export function calculateJumlahDataTerekam(rows = []) {
  if (!rows || rows.length === 0) return 0;
  return rows.filter(r => r.jenis_aliran === 'vol_masuk_ton').length;
}

/**
 * 6.1 Persentase Pasokan Luar DIY vs Dalam DIY (Donut Chart)
 * DAX: Vol_Masuk_Luar_DIY / SUM(arus_masuk[volume_ton]) * 100
 *
 * AUDIT FIX (BUG-6): Kini unit-aware menggunakan getter yang membaca satuan_dasar.
 * Arus masuk Minyak Goreng disimpan di volume_liter → getter memastikan satuan yang tepat digunakan.
 * Persentase tetap valid karena pembilang & penyebut menggunakan unit yang sama.
 */
export function calculatePctLuarDiy(arusMasukRows = []) {
  // Unit-aware volume getter untuk arus_masuk rows
  const getArusVol = (r) => {
    if (r.satuan_dasar === 'Liter') return Number(r.volume_liter) || Number(r.volume_ton) || 0;
    return Number(r.volume_ton) || 0;
  };

  const totalVol = arusMasukRows.reduce((sum, r) => sum + getArusVol(r), 0) || 0;
  if (totalVol === 0) {
    return { pctLuarDiy: 0, pctLokal: 0, volLuarDiy: 0, volLokal: 0, totalVol: 0 };
  }

  const volLuarDiy = arusMasukRows
    .filter(r => r.luar_diy === true)
    .reduce((sum, r) => sum + getArusVol(r), 0);

  const volLokal = Math.max(0, totalVol - volLuarDiy);
  const pctLuarDiy = (volLuarDiy / totalVol) * 100;
  const pctLokal = (volLokal / totalVol) * 100;

  return {
    pctLuarDiy: Number(pctLuarDiy.toFixed(1)),
    pctLokal: Number(pctLokal.toFixed(1)),
    volLuarDiy: Number(volLuarDiy.toFixed(2)),
    volLokal: Number(volLokal.toFixed(2)),
    totalVol: Number(totalVol.toFixed(2))
  };
}

/**
 * 7.1 Delta Perubahan vs Periode Lalu (Δ% / WoW)
 * DAX: DIVIDE([Nilai_Ini] - [Nilai_Lalu], [Nilai_Lalu], BLANK()) * 100
 */
export function calculateDeltaPct(currentVal, prevVal) {
  if (!prevVal || prevVal === 0) return 0;
  return Number((((currentVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1));
}

/**
 * 8.1 Rata-rata Volume Per Minggu (untuk multi-periode selection)
 * Bukan dijumlah total — dibagi jumlah periode yang dipilih.
 * DAX equivalent: AVERAGEX(DISTINCT(kalender[id_periode]), CALCULATE(SUM(volume_ton)))
 *
 * @param {Array} rows - Rows dari semua periode yang dipilih
 * @param {number} jumlahPeriode - Jumlah periode unik yang dipilih
 * @param {'vol_masuk_ton'|'vol_keluar_ton'} jenisAliran
 * @returns {number} Rata-rata volume per minggu
 */
export function calculateVolumePerMinggu(rows = [], jumlahPeriode = 1, jenisAliran = 'vol_masuk_ton') {
  if (!rows || rows.length === 0 || jumlahPeriode <= 0) return 0;
  const totalVol = rows
    .filter(r => r.jenis_aliran === jenisAliran)
    .reduce((sum, r) => sum + getRowVolume(r), 0);
  return Number((totalVol / jumlahPeriode).toFixed(2));
}

/**
 * 8.2 Deteksi unit dominan dari kumpulan rows
 * Digunakan untuk menentukan label sumbu (Ton atau Liter) ketika filter multi-komoditas aktif
 * @param {Array} rows
 * @returns {'Ton'|'Liter'|'Mixed'}
 */
export function detectDominantUnit(rows = []) {
  if (!rows || rows.length === 0) return 'Ton';
  const hasLiter = rows.some(r => r.satuan_dasar === 'Liter');
  const hasTon = rows.some(r => !r.satuan_dasar || r.satuan_dasar === 'Ton');
  if (hasLiter && hasTon) return 'Mixed';
  if (hasLiter) return 'Liter';
  return 'Ton';
}

// ============================================================================
// UNIFIED MATCHER FUNCTIONS — Single Source of Truth (AUDIT FIX: BUG-4)
// Import fungsi-fungsi ini di SEMUA modul kalkulasi.
// Sebelumnya setiap modul mendefinisikan versi sendiri dengan regex berbeda.
// ============================================================================

/**
 * M1. Unified Komoditas Matcher
 * Menghapus semua suffix satuan: (Ton), (kg), (Kilogram), (Liter) — case-insensitive.
 * Sebelumnya ada 3 versi berbeda yang tidak seragam menghapus suffix ini.
 *
 * @param {string} rowKomoditas - Nama komoditas di baris data
 * @param {string} targetKomoditas - Nama komoditas yang dicari
 * @returns {boolean}
 */
export function matchKomoditasUnified(rowKomoditas, targetKomoditas) {
  if (!targetKomoditas || targetKomoditas === 'Semua' || targetKomoditas === 'All') return true;
  if (!rowKomoditas) return false;
  const strip = (s) => s.toString().toLowerCase()
    .replace(/\s*\(ton\)|\s*\(kg\)|\s*\(kilogram\)|\s*\(liter\)/g, '').trim();
  return strip(rowKomoditas) === strip(targetKomoditas) || rowKomoditas === targetKomoditas;
}

/**
 * M2. Unified Wilayah Matcher
 * Menghapus prefiks "Kab." dan "Kota" — mendukung target berupa string tunggal atau string[].
 *
 * @param {string} rowWilayah - Nama kab/kota di baris data
 * @param {string|string[]} targetWilayah - Target wilayah (bisa array untuk multi-select)
 * @returns {boolean}
 */
export function matchWilayahUnified(rowWilayah, targetWilayah) {
  if (!targetWilayah || targetWilayah === 'Semua Wilayah DIY' || targetWilayah === 'All' || targetWilayah === 'Semua') return true;
  if (!rowWilayah) return false;
  const strip = (s) => s.toString().toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim();
  if (Array.isArray(targetWilayah)) {
    return targetWilayah.some(tw => strip(rowWilayah) === strip(tw) || rowWilayah === tw);
  }
  return strip(rowWilayah) === strip(targetWilayah) || rowWilayah === targetWilayah;
}

/**
 * M3. Unified Klaster Matcher
 * Mencocokkan tipe_responden (pedagang_besar / produsen).
 *
 * Catatan: Baris dengan tipe_responden null/undefined dianggap cocok dengan SEMUA klaster
 * (defensive inclusion untuk data Excel eksternal yang belum terklasifikasi).
 * Ini disengaja agar data tidak hilang — quality issue akan dilaporkan di Tab 5.
 *
 * @param {string} rowKlaster - tipe_responden di baris data
 * @param {string} targetKlaster - Klaster yang dipilih
 * @returns {boolean}
 */
export function matchKlasterUnified(rowKlaster, targetKlaster) {
  if (!targetKlaster || targetKlaster === 'semua' || targetKlaster === 'All' || targetKlaster === 'Semua') return true;
  if (!rowKlaster) return true; // Unclassified rows: defensive inclusion
  const k1 = rowKlaster.toString().toLowerCase();
  const k2 = targetKlaster.toString().toLowerCase();
  if (k2.includes('pedagang') || k2.includes('pb') || k2 === 'pedagang_besar') {
    return k1.includes('pedagang') || k1.includes('pb') || k1 === 'pedagang_besar';
  }
  if (k2.includes('produsen') || k2.includes('pr') || k2 === 'produsen') {
    return k1.includes('produsen') || k1.includes('pr') || k1 === 'produsen';
  }
  return k1 === k2;
}
