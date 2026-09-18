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
 */

/**
 * 1.1 Total Volume Masuk (Ton)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton")
 * @param {Array} rows - Array data laporan_ringkasan
 * @returns {number} Total volume masuk dalam satuan Ton
 */
export function calculateVolumeMasuk(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton')
    .reduce((sum, r) => sum + (Number(r.volume_ton) || Number(r.vol_masuk_ton) || Number(r.Value) || 0), 0);
  return Number(vol.toFixed(2));
}

/**
 * 1.2 Total Volume Keluar (Ton)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_keluar_ton")
 * @param {Array} rows - Array data laporan_ringkasan
 * @returns {number} Total volume keluar dalam satuan Ton
 */
export function calculateVolumeKeluar(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_keluar_ton')
    .reduce((sum, r) => sum + (Number(r.volume_ton) || Number(r.vol_keluar_ton) || Number(r.Value) || 0), 0);
  return Number(vol.toFixed(2));
}

/**
 * 1.3 Total Volume Masuk Pedagang Besar (Ton)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton", laporan_ringkasan[tipe_responden] = "pedagang_besar")
 */
export function calculateVolumeMasukPB(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton' && (r.tipe_responden === 'pedagang_besar' || (r.tipe_responden || '').toLowerCase().includes('pedagang')))
    .reduce((sum, r) => sum + (Number(r.volume_ton) || Number(r.vol_masuk_ton) || Number(r.Value) || 0), 0);
  return Number(vol.toFixed(2));
}

/**
 * 1.4 Total Volume Keluar Pedagang Besar (Ton)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_keluar_ton", laporan_ringkasan[tipe_responden] = "pedagang_besar")
 */
export function calculateVolumeKeluarPB(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_keluar_ton' && (r.tipe_responden === 'pedagang_besar' || (r.tipe_responden || '').toLowerCase().includes('pedagang')))
    .reduce((sum, r) => sum + (Number(r.volume_ton) || Number(r.vol_keluar_ton) || Number(r.Value) || 0), 0);
  return Number(vol.toFixed(2));
}

/**
 * 1.5 Total Volume Produksi Produsen (Ton)
 * DAX: CALCULATE(SUM(laporan_ringkasan[Value]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton", laporan_ringkasan[tipe_responden] = "produsen")
 */
export function calculateVolumeProduksi(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const vol = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton' && (r.tipe_responden === 'produsen' || (r.tipe_responden || '').toLowerCase().includes('produsen')))
    .reduce((sum, r) => sum + (Number(r.volume_ton) || Number(r.vol_masuk_ton) || Number(r.Value) || 0), 0);
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
 * Threshold ±0.1 ton untuk menghindari false positive pembulatan.
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
 * 3.1 Rerata Harga Beli (Rp/kg)
 * DAX: AVERAGEX(FILTER(laporan_ringkasan, jenis_aliran = "vol_masuk_ton" && tipe_responden = "pedagang_besar" && harga_beli > 0), [harga_beli])
 */
export function calculateAvgHargaBeli(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const validRows = rows.filter(
    r => r.jenis_aliran === 'vol_masuk_ton' &&
         (r.tipe_responden === 'pedagang_besar' || (r.tipe_responden || '').toLowerCase().includes('pedagang') || !r.tipe_responden) &&
         Number(r.harga_beli) > 0
  );
  if (validRows.length === 0) return 0;
  const sum = validRows.reduce((acc, r) => acc + Number(r.harga_beli), 0);
  return Math.round(sum / validRows.length);
}

/**
 * 3.2 Rerata Harga Jual (Rp/kg)
 * DAX: AVERAGEX(FILTER(laporan_ringkasan, jenis_aliran = "vol_masuk_ton" && tipe_responden = "pedagang_besar" && harga_jual > 0), [harga_jual])
 */
export function calculateAvgHargaJual(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const validRows = rows.filter(
    r => r.jenis_aliran === 'vol_masuk_ton' &&
         (r.tipe_responden === 'pedagang_besar' || (r.tipe_responden || '').toLowerCase().includes('pedagang') || !r.tipe_responden) &&
         Number(r.harga_jual) > 0
  );
  if (validRows.length === 0) return 0;
  const sum = validRows.reduce((acc, r) => acc + Number(r.harga_jual), 0);
  return Math.round(sum / validRows.length);
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
 * 4.1 Total Stok Akhir (Ton)
 * DAX: CALCULATE(SUM(laporan_ringkasan[stok_akhir_ton]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton")
 */
export function calculateTotalStokAkhir(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const total = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton')
    .reduce((sum, r) => sum + (Number(r.stok_akhir_ton) || 0), 0);
  return Number(total.toFixed(2));
}

/**
 * 4.2 Total Susut / Losses (Ton)
 * DAX: CALCULATE(SUM(laporan_ringkasan[susut_ton]), laporan_ringkasan[jenis_aliran] = "vol_masuk_ton")
 */
export function calculateTotalSusut(rows = []) {
  if (!rows || rows.length === 0) return 0;
  const total = rows
    .filter(r => r.jenis_aliran === 'vol_masuk_ton')
    .reduce((sum, r) => sum + (Number(r.susut_ton) || 0), 0);
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
 */
export function calculatePctLuarDiy(arusMasukRows = []) {
  const totalVol = arusMasukRows.reduce((sum, r) => sum + (Number(r.volume_ton) || 0), 0) || 0;
  if (totalVol === 0) {
    return { pctLuarDiy: 0, pctLokal: 0, volLuarDiy: 0, volLokal: 0, totalVol: 0 };
  }

  const volLuarDiy = arusMasukRows
    .filter(r => r.luar_diy === true || (r.daerah_asal && !['Kota Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunungkidul'].includes(r.daerah_asal.replace(/^(kab\.|kota)\s*/i, ''))))
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
 * 7.1 Delta Perubahan vs Periode Lalu (Δ% / WoW)
 * DAX: DIVIDE([Nilai_Ini] - [Nilai_Lalu], [Nilai_Lalu], BLANK()) * 100
 */
export function calculateDeltaPct(currentVal, prevVal) {
  if (!prevVal || prevVal === 0) return 0;
  return Number((((currentVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1));
}
