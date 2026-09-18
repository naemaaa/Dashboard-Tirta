/**
 * ============================================================================
 * MODUL KALKULASI HARGA & MARJIN TATANIAGA
 * Referensi Lengkap DAX Measures Dashboard Komoditas DIY v1.0 - Bab 5
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta · September 2026
 * ============================================================================
 */

import { REF_KOMODITAS, REF_WILAYAH } from '../data/seedData';
import { getMarginClassification } from './coreCalculations';

/**
 * 1. Matriks Harga & Marjin per Komoditas x Wilayah (Tab 3 Panel B)
 * Menghitung Harga Beli, Harga Jual, Marjin (Rp), dan Marjin (%) per wilayah & rata-rata agregat DIY
 */
export function calculateTab3PriceMatrix(rawRingkasan = [], selectedPeriode) {
  return REF_KOMODITAS.map(kom => {
    const row = {
      komoditas: kom.nama_komoditas,
      id_komoditas: kom.id_komoditas,
      wilayahPrices: {},
      avgBeliAll: 0,
      avgJualAll: 0,
      avgMarginRp: 0,
      avgMarginPct: 0,
      statusMargin: 'Wajar'
    };

    let sumBeli = 0;
    let sumJual = 0;
    let count = 0;

    REF_WILAYAH.forEach(wil => {
      const matches = rawRingkasan.filter(r =>
        !r.is_deleted &&
        (!selectedPeriode || selectedPeriode === 'Semua' || selectedPeriode === 'All' || r.id_periode === selectedPeriode) &&
        (r.komoditas === kom.nama_komoditas || r.id_komoditas === kom.id_komoditas) &&
        r.kab_kota === wil.nama_kab_kota &&
        r.jenis_aliran === 'vol_masuk_ton' &&
        Number(r.harga_beli) > 0
      );

      const hb = matches.length > 0
        ? matches.reduce((s, r) => s + Number(r.harga_beli), 0) / matches.length
        : 0;
      const hj = matches.length > 0
        ? matches.reduce((s, r) => s + Number(r.harga_jual), 0) / matches.length
        : 0;
      const mar = hj - hb;
      const marPct = hb > 0 ? (mar / hb) * 100 : 0;

      row.wilayahPrices[wil.nama_kab_kota] = {
        hargaBeli: Math.round(hb),
        hargaJual: Math.round(hj),
        margin: Math.round(mar),
        marginPct: Number(marPct.toFixed(1))
      };

      if (hb > 0) {
        sumBeli += hb;
        sumJual += hj;
        count++;
      }
    });

    row.avgBeliAll = count > 0 ? Math.round(sumBeli / count) : 0;
    row.avgJualAll = count > 0 ? Math.round(sumJual / count) : 0;
    row.avgMarginRp = row.avgJualAll - row.avgBeliAll;
    row.avgMarginPct = row.avgBeliAll > 0 ? Number(((row.avgMarginRp / row.avgBeliAll) * 100).toFixed(1)) : 0;
    row.statusMargin = getMarginClassification(row.avgMarginPct);
    return row;
  });
}

/**
 * 2. Peringkat Marjin per Komoditas (Tab 3 Panel D)
 * Diurutkan secara descending berdasarkan % marjin tertinggi
 */
export function calculateTab3MarginRanking(priceMatrix = []) {
  return priceMatrix
    .map(r => ({
      komoditas: r.komoditas.replace(' (Ton)', ''),
      full_name: r.komoditas,
      marginPct: r.avgMarginPct,
      marginRp: r.avgMarginRp,
      hargaBeli: r.avgBeliAll,
      hargaJual: r.avgJualAll,
      status: r.statusMargin
    }))
    .sort((a, b) => b.marginPct - a.marginPct);
}

/**
 * 3. Scatter Plot Dataset: Harga Beli vs Harga Jual vs Skala Volume (Tab 3 Panel E)
 */
export function calculateTab3ScatterData(priceMatrix = [], butterflyData = []) {
  return REF_KOMODITAS.map(kom => {
    const p = priceMatrix.find(item => item.id_komoditas === kom.id_komoditas);
    const b = butterflyData.find(item => item.id_komoditas === kom.id_komoditas);
    return {
      name: kom.nama_singkat || kom.nama_komoditas.replace(' (Ton)', ''),
      kelompok: kom.kelompok,
      hargaBeli: p?.avgBeliAll || 0,
      hargaJual: p?.avgJualAll || 0,
      marginPct: p?.avgMarginPct || 0,
      volume: b?.volMasuk || 10,
    };
  });
}

/**
 * 4. Perbandingan Disparitas Harga Jual antar 5 Kabupaten/Kota (Tab 3 Panel F)
 */
export function calculateTab3RegionPrices(rawRingkasan = [], selectedPeriode, selectedKomoditas) {
  return REF_WILAYAH.map(wil => {
    const matches = rawRingkasan.filter(r =>
      !r.is_deleted &&
      (!selectedPeriode || selectedPeriode === 'Semua' || selectedPeriode === 'All' || r.id_periode === selectedPeriode) &&
      (!selectedKomoditas || selectedKomoditas === 'Semua' || selectedKomoditas === 'All' || r.komoditas === selectedKomoditas) &&
      r.kab_kota === wil.nama_kab_kota &&
      r.jenis_aliran === 'vol_masuk_ton'
    );
    const hb = matches.length > 0 ? matches.reduce((s, r) => s + Number(r.harga_beli), 0) / matches.length : 0;
    const hj = matches.length > 0 ? matches.reduce((s, r) => s + Number(r.harga_jual), 0) / matches.length : 0;
    return {
      wilayah: wil.nama_kab_kota,
      hargaJual: Math.round(hj),
      hargaBeli: Math.round(hb),
      margin: Math.round(hj - hb)
    };
  });
}

/**
 * 5. Disparitas Harga Wilayah (DAX 5.1)
 * DAX: MAXX(ALL(REF_Wilayah), [Harga_Rata_Jual]) - MINX(ALL(REF_Wilayah), [Harga_Rata_Jual])
 */
export function calculateDisparitasHargaWilayah(regionPrices = []) {
  const validPrices = regionPrices.map(r => r.hargaJual).filter(p => p > 0);
  if (validPrices.length === 0) return 0;
  const maxPrice = Math.max(...validPrices);
  const minPrice = Math.min(...validPrices);
  return maxPrice - minPrice;
}

/**
 * 6. Wilayah Harga Tertinggi (DAX 5.1)
 * DAX: MAXX(TOPN(1, SUMMARIZE(laporan_ringkasan, [kab_kota], "harga", [Harga_Rata_Jual]), [harga], DESC), [kab_kota])
 */
export function calculateWilayahHargaTertinggi(regionPrices = []) {
  if (!regionPrices || regionPrices.length === 0) return 'Kota Yogyakarta';
  const sorted = [...regionPrices].sort((a, b) => b.hargaJual - a.hargaJual);
  return sorted[0]?.wilayah || 'Kota Yogyakarta';
}

/**
 * 7. Komoditas & Nilai Margin Tertinggi (DAX 5.2)
 * DAX: MAXX(TOPN(1, SUMMARIZE(..., "margin", [Margin_Harga]), [margin], DESC), [nama_komoditas])
 */
export function calculateKomoditasMarginTertinggi(priceMatrix = []) {
  if (!priceMatrix || priceMatrix.length === 0) return { komoditas: 'Bawang Merah', marginRp: 0, marginPct: 0 };
  const sorted = [...priceMatrix].sort((a, b) => b.avgMarginPct - a.avgMarginPct);
  return {
    komoditas: sorted[0]?.komoditas || 'Bawang Merah',
    marginRp: sorted[0]?.avgMarginRp || 0,
    marginPct: sorted[0]?.avgMarginPct || 0
  };
}

/**
 * 8. Volatilitas Harga Jual (DAX 5.3)
 * DAX: DIVIDE(MaxH - MinH, AvgHarga, 0) * 100
 */
export function calculateVolatilitasHargaJual(historicalTrends = []) {
  const validPrices = historicalTrends.map(t => t.hargaJual).filter(p => p > 0);
  if (validPrices.length === 0) return 0;
  const maxH = Math.max(...validPrices);
  const minH = Math.min(...validPrices);
  const avgH = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
  if (avgH === 0) return 0;
  return Number((((maxH - minH) / avgH) * 100).toFixed(1));
}
