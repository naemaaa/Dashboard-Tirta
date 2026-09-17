/**
 * ============================================================================
 * MODUL KALKULASI UTAMA (DAX -> JAVASCRIPT)
 * PRD Dashboard Komoditas DIY v1.0 - Section 5.3 & 6.2
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
 * ============================================================================
 */

/**
 * 1. Total Volume Masuk (Ton)
 * Formula DAX: CALCULATE(SUM(laporan_ringkasan[Value]), jenis_aliran = "vol_masuk_ton")
 * @param {Array} rows - Array data laporan_ringkasan
 * @returns {number} Total volume masuk dalam satuan Ton
 */
export function calculateVolumeMasuk(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton')
    .reduce((sum, r) => sum + (Number(r.volume_ton) || Number(r.vol_masuk_ton) || 0), 0);
  return Number(vol.toFixed(2));
}

/**
 * 2. Total Volume Keluar (Ton)
 * Formula DAX: CALCULATE(SUM(laporan_ringkasan[Value]), jenis_aliran = "vol_keluar_ton")
 * @param {Array} rows - Array data laporan_ringkasan
 * @returns {number} Total volume keluar dalam satuan Ton
 */
export function calculateVolumeKeluar(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_keluar_ton')
    .reduce((sum, r) => sum + (Number(r.volume_ton) || Number(r.vol_keluar_ton) || 0), 0);
  return Number(vol.toFixed(2));
}

/**
 * 3. Neraca Bersih (Ton)
 * Formula DAX: [Total Vol Masuk] - [Total Vol Keluar]
 * Positif = Surplus pasokan, Negatif = Defisit pasokan
 * @param {number} volMasuk - Total volume masuk (Ton)
 * @param {number} volKeluar - Total volume keluar (Ton)
 * @returns {number} Nilai neraca bersih (Ton)
 */
export function calculateNeracaBersih(volMasuk, volKeluar) {
  return Number(((volMasuk || 0) - (volKeluar || 0)).toFixed(2));
}

/**
 * 4. Status Neraca (Kondisional)
 * Formula: IF(neraca > 0.1, "SURPLUS", IF(neraca < -0.1, "DEFISIT", "SEIMBANG"))
 * Note PRD: Threshold 0.1 Ton digunakan untuk menghindari false positive pembulatan.
 * @param {number} neracaBersih - Nilai neraca bersih (Ton)
 * @returns {'SURPLUS' | 'DEFISIT' | 'SEIMBANG'}
 */
export function calculateStatusNeraca(neracaBersih) {
  if (neracaBersih > 0.1) return 'SURPLUS';
  if (neracaBersih < -0.1) return 'DEFISIT';
  return 'SEIMBANG';
}

/**
 * 5. Rerata Harga Beli (Rp/kg)
 * Formula DAX: CALCULATE(AVERAGE(harga_beli), tipe = "pedagang_besar", jenis_aliran = "vol_masuk_ton")
 * PENTING: Karena data unpivot (vol_masuk dan vol_keluar menjadi 2 baris), harga terduplikasi.
 * Wajib filter jenis_aliran = 'vol_masuk_ton' sebelum di-AVERAGE untuk menghindari double counting!
 * @param {Array} rows - Array data laporan_ringkasan
 * @returns {number} Rata-rata harga beli distributor (Rp/kg)
 */
export function calculateAvgHargaBeli(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const validRows = rows.filter(
    r => r.jenis_aliran === 'vol_masuk_ton' && Number(r.harga_beli) > 0
  );
  if (validRows.length === 0) return 0;
  const sum = validRows.reduce((acc, r) => acc + Number(r.harga_beli), 0);
  return Math.round(sum / validRows.length);
}

/**
 * 6. Rerata Harga Jual (Rp/kg)
 * Formula DAX: CALCULATE(AVERAGE(harga_jual), tipe = "pedagang_besar", jenis_aliran = "vol_masuk_ton")
 * @param {Array} rows - Array data laporan_ringkasan
 * @returns {number} Rata-rata harga jual pedagang besar/grosir (Rp/kg)
 */
export function calculateAvgHargaJual(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const validRows = rows.filter(
    r => r.jenis_aliran === 'vol_masuk_ton' && Number(r.harga_jual) > 0
  );
  if (validRows.length === 0) return 0;
  const sum = validRows.reduce((acc, r) => acc + Number(r.harga_jual), 0);
  return Math.round(sum / validRows.length);
}

/**
 * 7. Nominal Marjin Perdagangan (Rp/kg)
 * Formula: [Harga Rata Jual] - [Harga Rata Beli]
 * @param {number} avgHargaJual - Rata-rata harga jual
 * @param {number} avgHargaBeli - Rata-rata harga beli
 * @returns {number} Nominal marjin perdagangan dalam Rp/kg
 */
export function calculateMarginRp(avgHargaJual, avgHargaBeli) {
  return Math.round((avgHargaJual || 0) - (avgHargaBeli || 0));
}

/**
 * 8. Persentase Marjin (%)
 * Formula: ([Marjin Rp] / [Harga Rata Beli]) * 100
 * @param {number} marginRp - Nominal marjin dalam Rp
 * @param {number} avgHargaBeli - Rata-rata harga beli dalam Rp
 * @returns {number} Persentase marjin perdagangan
 */
export function calculateMarginPct(marginRp, avgHargaBeli) {
  if (!avgHargaBeli || avgHargaBeli <= 0) return 0;
  return Number(((marginRp / avgHargaBeli) * 100).toFixed(1));
}

/**
 * 9. Klasifikasi Status Marjin
 * Standar PRD:
 * - > 5% : Wajar / Sehat (Hijau)
 * - 1% s/d 5% : Tipis (Kuning)
 * - < 1% : Negatif / Tertekan (Merah)
 * @param {number} marginPct - Persentase marjin
 * @returns {'Wajar / Sehat' | 'Tipis' | 'Negatif / Kritis'}
 */
export function getMarginClassification(marginPct) {
  if (marginPct > 5) return 'Wajar / Sehat';
  if (marginPct >= 1) return 'Tipis';
  return 'Negatif / Kritis';
}

/**
 * 10. Persentase Ketergantungan Pasokan Luar DIY (%)
 * Formula: (SUM(Volume Luar DIY) / Total Volume Masuk) * 100
 * Dari tabel `arus_masuk`
 * @param {Array} arusMasukRows - Data tabel arus_masuk
 * @returns {{ pctLuarDiy: number, pctLokal: number, volLuarDiy: number, volLokal: number, totalVol: number }}
 */
export function calculatePctLuarDiy(arusMasukRows = []) {
  const totalVol = arusMasukRows.reduce((sum, r) => sum + (Number(r.volume_ton) || 0), 0) || 0;
  if (totalVol === 0) {
    return { pctLuarDiy: 0, pctLokal: 0, volLuarDiy: 0, volLokal: 0, totalVol: 0 };
  }

  const volLuarDiy = arusMasukRows
    .filter(r => r.luar_diy === true)
    .reduce((sum, r) => sum + (Number(r.volume_ton) || 0), 0);

  const volLokal = totalVol - volLuarDiy;
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
 * 11. Delta Perubahan vs Periode Lalu (Δ%)
 * Formula: ((Nilai Ini - Nilai Lalu) / ABS(Nilai Lalu)) * 100
 * @param {number} currentVal - Nilai periode aktif
 * @param {number} prevVal - Nilai periode sebelumnya
 * @returns {number} Persentase delta (%)
 */
export function calculateDeltaPct(currentVal, prevVal) {
  if (!prevVal || prevVal === 0) return 0;
  return Number((((currentVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1));
}
