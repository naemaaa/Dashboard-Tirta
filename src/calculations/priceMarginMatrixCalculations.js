/**
 * ============================================================================
 * MODUL KALKULASI HARGA & MARJIN TATANIAGA
 * Referensi Lengkap DAX Measures Dashboard Komoditas DIY v1.0 - Bab 5
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta · September 2026
 * ============================================================================
 *
 * AUDIT FIX LOG (21 Sep 2026):
 * - BUG-4: Local matchWilayah / matchKlaster dihapus.
 *   Diganti import dari unified matchers di coreCalculations.js.
 */

import { REF_KOMODITAS, REF_WILAYAH } from '../data/seedData.js';
import {
  getMarginClassification,
  matchKomoditasUnified,
  matchWilayahUnified,
  matchKlasterUnified
} from './coreCalculations.js';

/**
 * 1. Matriks Harga & Marjin per Komoditas x Wilayah (Tab 3 Panel B)
 * Menghitung Harga Beli, Harga Jual, Marjin (Rp), dan Marjin (%) per wilayah & rata-rata agregat DIY
 * 
 * VWAP: avgBeliAll & avgJualAll dihitung dari SELURUH baris transaksi DIY terfilter (VWAP),
 * dengan filter periode, wilayah, dan klaster.
 */
export function calculateTab3PriceMatrix(rawRingkasan = [], selectedPeriode, selectedWilayah, selectedKlaster) {
  return REF_KOMODITAS.map(kom => {
    const row = {
      komoditas: kom.nama_komoditas,
      id_komoditas: kom.id_komoditas,
      satuan_dasar: kom.satuan_dasar || 'Ton',
      wilayahPrices: {},
      avgBeliAll: 0,
      avgJualAll: 0,
      avgMarginRp: 0,
      avgMarginPct: 0,
      statusMargin: 'Wajar'
    };

    // Per-wilayah prices (untuk matriks detail)
    REF_WILAYAH.forEach(wil => {
      const matches = rawRingkasan.filter(r =>
        !r.is_deleted &&
        (!selectedPeriode || selectedPeriode === 'Semua' || selectedPeriode === 'All' || r.id_periode === selectedPeriode) &&
        (r.komoditas === kom.nama_komoditas || r.id_komoditas === kom.id_komoditas || matchKomoditasUnified(r.komoditas, kom.nama_komoditas)) &&
        r.kab_kota === wil.nama_kab_kota &&
        matchKlasterUnified(r.tipe_responden, selectedKlaster) &&
        r.jenis_aliran === 'vol_masuk_ton' &&
        Number(r.harga_beli) > 0
      );

      // VWAP per wilayah
      const sumVolWil = matches.reduce((s, r) => {
        const vol = (kom.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
        return s + vol;
      }, 0);
      const hb = sumVolWil > 0
        ? matches.reduce((s, r) => {
            const vol = (kom.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
            return s + Number(r.harga_beli) * vol;
          }, 0) / sumVolWil
        : 0;
      const sumVolJual = matches.filter(r => Number(r.harga_jual) > 0).reduce((s, r) => {
        const vol = (kom.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
        return s + vol;
      }, 0);
      const hj = sumVolJual > 0
        ? matches.filter(r => Number(r.harga_jual) > 0).reduce((s, r) => {
            const vol = (kom.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
            return s + Number(r.harga_jual) * vol;
          }, 0) / sumVolJual
        : 0;
      const mar    = hj - hb;
      const marPct = hb > 0 ? (mar / hb) * 100 : 0;

      row.wilayahPrices[wil.nama_kab_kota] = {
        hargaBeli: Math.round(hb),
        hargaJual: Math.round(hj),
        margin: Math.round(mar),
        marginPct: Number(marPct.toFixed(1))
      };
    });

    // --- Agregat DIY (VWAP) dengan filter Wilayah & Klaster ---
    const allDIYRows = rawRingkasan.filter(r =>
      !r.is_deleted &&
      (!selectedPeriode || selectedPeriode === 'Semua' || selectedPeriode === 'All' || r.id_periode === selectedPeriode) &&
      (r.komoditas === kom.nama_komoditas || r.id_komoditas === kom.id_komoditas || matchKomoditasUnified(r.komoditas, kom.nama_komoditas)) &&
      matchWilayahUnified(r.kab_kota, selectedWilayah) &&
      matchKlasterUnified(r.tipe_responden, selectedKlaster) &&
      r.jenis_aliran === 'vol_masuk_ton' &&
      Number(r.harga_beli) > 0
    );

    const totalVolAll = allDIYRows.reduce((s, r) => {
      const vol = (kom.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
      return s + vol;
    }, 0);

    if (totalVolAll > 0) {
      row.avgBeliAll = Math.round(
        allDIYRows.reduce((s, r) => {
          const vol = (kom.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
          return s + Number(r.harga_beli) * vol;
        }, 0) / totalVolAll
      );
      const rowsWithJual = allDIYRows.filter(r => Number(r.harga_jual) > 0);
      const totalVolJual = rowsWithJual.reduce((s, r) => {
        const vol = (kom.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
        return s + vol;
      }, 0);
      if (totalVolJual > 0) {
        row.avgJualAll = Math.round(
          rowsWithJual.reduce((s, r) => {
            const vol = (kom.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
            return s + Number(r.harga_jual) * vol;
          }, 0) / totalVolJual
        );
      }
    }

    row.avgMarginRp  = row.avgJualAll - row.avgBeliAll;
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
  const pList = Array.isArray(priceMatrix) ? priceMatrix : [];
  const bList = Array.isArray(butterflyData) ? butterflyData : [];
  return REF_KOMODITAS.map(kom => {
    const p = pList.find(item => item?.id_komoditas === kom.id_komoditas);
    const b = bList.find(item => item?.id_komoditas === kom.id_komoditas);
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
 * Menggunakan VWAP agar konsisten dengan KPI card & price matrix.
 */
export function calculateTab3RegionPrices(rawRingkasan = [], selectedPeriode, selectedKomoditas, selectedKlaster) {
  return REF_WILAYAH.map(wil => {
    const matches = rawRingkasan.filter(r =>
      !r.is_deleted &&
      (!selectedPeriode || selectedPeriode === 'Semua' || selectedPeriode === 'All' || r.id_periode === selectedPeriode) &&
      (!selectedKomoditas || selectedKomoditas === 'Semua' || selectedKomoditas === 'All' || r.komoditas === selectedKomoditas) &&
      matchKlasterUnified(r.tipe_responden, selectedKlaster) &&
      r.kab_kota === wil.nama_kab_kota &&
      r.jenis_aliran === 'vol_masuk_ton' &&
      Number(r.harga_beli) > 0
    );

    const sumVol = matches.reduce((s, r) => {
      const vol = (r.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
      return s + vol;
    }, 0);

    const hb = sumVol > 0
      ? matches.reduce((s, r) => {
          const vol = (r.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
          return s + Number(r.harga_beli) * vol;
        }, 0) / sumVol
      : 0;

    const rowsWithJual = matches.filter(r => Number(r.harga_jual) > 0);
    const sumVolJual = rowsWithJual.reduce((s, r) => {
      const vol = (r.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
      return s + vol;
    }, 0);
    const hj = sumVolJual > 0
      ? rowsWithJual.reduce((s, r) => {
          const vol = (r.satuan_dasar === 'Liter' ? Number(r.volume_liter) : Number(r.volume_ton)) || 0;
          return s + Number(r.harga_jual) * vol;
        }, 0) / sumVolJual
      : 0;

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
