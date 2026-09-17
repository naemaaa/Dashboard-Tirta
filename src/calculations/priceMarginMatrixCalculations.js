/**
 * ============================================================================
 * MODUL KALKULASI HARGA & MARJIN TATANIAGA
 * PRD Dashboard Komoditas DIY v1.0 - Section 8
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
 * ============================================================================
 */

import { REF_KOMODITAS, REF_WILAYAH } from '../data/seedData';

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
      avgMarginPct: 0
    };

    let sumBeli = 0;
    let sumJual = 0;
    let count = 0;

    REF_WILAYAH.forEach(wil => {
      const matches = rawRingkasan.filter(r =>
        !r.is_deleted &&
        r.id_periode === selectedPeriode &&
        r.komoditas === kom.nama_komoditas &&
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
      hargaJual: r.avgJualAll
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
      name: kom.nama_komoditas.replace(' (Ton)', ''),
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
      r.id_periode === selectedPeriode &&
      r.komoditas === selectedKomoditas &&
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
