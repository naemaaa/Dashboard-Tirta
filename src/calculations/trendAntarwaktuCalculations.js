/**
 * ============================================================================
 * MODUL KALKULASI TREN ANTARWAKTU & HISTORIS
 * Referensi Lengkap DAX Measures Dashboard Komoditas DIY v1.0 - Bab 6
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta · September 2026
 * ============================================================================
 *
 * AUDIT FIX LOG (21 Sep 2026):
 * - BUG-4: Local matchKomoditas / matchWilayah / matchKlaster dihapus.
 *   Diganti import dari unified matchers di coreCalculations.js.
 *   Sebelumnya versi lokal tidak menghapus suffix '(liter)' dari nama komoditas.
 */

import { REF_KOMODITAS, REF_WILAYAH, REF_KALENDER } from '../data/seedData.js';
import {
  calculateVolumeMasuk,
  calculateVolumeKeluar,
  calculateNeracaBersih,
  calculateAvgHargaBeli,
  calculateAvgHargaJual,
  calculateMarginRp,
  calculateMarginPct,
  calculateDeltaPct,
  getRowVolume,
  matchKomoditasUnified,
  matchWilayahUnified,
  matchKlasterUnified
} from './coreCalculations.js';

/**
 * 1. Deret Waktu Historis Multi-Periode (Tab 1 Panel A, Tab 4 Panel B & C, Tab 4 Panel G)
 */
export function calculateHistoricalTrends(
  rawRingkasan = [],
  selectedKomoditas = 'Semua',
  selectedWilayah = 'Semua Wilayah DIY',
  selectedKlaster = 'semua'
) {
  const sortedKalender = [...REF_KALENDER].sort((a, b) => new Date(a.tgl_mulai) - new Date(b.tgl_mulai));

  return sortedKalender.map((kal, idx) => {
    const periodRows = rawRingkasan.filter(r =>
      !r.is_deleted &&
      r.id_periode === kal.id_periode &&
      matchKomoditasUnified(r.komoditas, selectedKomoditas) &&
      matchWilayahUnified(r.kab_kota, selectedWilayah) &&
      matchKlasterUnified(r.tipe_responden, selectedKlaster)
    );

    const volMasuk = calculateVolumeMasuk(periodRows);
    const volKeluar = calculateVolumeKeluar(periodRows);
    const neraca = calculateNeracaBersih(volMasuk, volKeluar);
    const avgHb = calculateAvgHargaBeli(periodRows);
    const avgHj = calculateAvgHargaJual(periodRows);
    const marRp = calculateMarginRp(avgHj, avgHb);
    const marPct = calculateMarginPct(marRp, avgHb);

    return {
      id_periode: kal.id_periode,
      label: kal.label_singkat || kal.label_periode.split(' ')[0],
      fullLabel: kal.label_periode,
      tgl_mulai: kal.tgl_mulai,
      volMasuk,
      volKeluar,
      neraca,
      hargaBeli: avgHb,
      hargaJual: avgHj,
      marginRp: marRp,
      marginPct: marPct,
      tpidRef: 13500 // Garis referensi benchmark inflasi pangan
    };
  });
}

/**
 * 2. Perbandingan Delta Perkembangan per Wilayah Periode Ini vs Periode Lalu (Tab 4 Panel D & F)
 * DAX: Selisih_Perkembangan = [Total_Vol_Masuk_Ton] - [Vol_Masuk_Periode_Lalu]
 */
export function calculateTab4RegionalDeltas(
  rawRingkasan = [],
  selectedPeriode,
  prevPeriodObj,
  selectedKomoditas = 'Semua'
) {
  return REF_WILAYAH.map(wil => {
    const currMatches = rawRingkasan.filter(r =>
      !r.is_deleted &&
      (!selectedPeriode || selectedPeriode === 'Semua' || selectedPeriode === 'All' || r.id_periode === selectedPeriode) &&
      matchWilayahUnified(r.kab_kota, wil.nama_kab_kota) &&
      matchKomoditasUnified(r.komoditas, selectedKomoditas)
    );

    const prevMatches = prevPeriodObj
      ? rawRingkasan.filter(r =>
        !r.is_deleted &&
        r.id_periode === prevPeriodObj.id_periode &&
        matchWilayahUnified(r.kab_kota, wil.nama_kab_kota) &&
        matchKomoditasUnified(r.komoditas, selectedKomoditas)
      )
      : [];

    const currIn = calculateVolumeMasuk(currMatches);
    const currOut = calculateVolumeKeluar(currMatches);
    const prevIn = calculateVolumeMasuk(prevMatches);
    const prevOut = calculateVolumeKeluar(prevMatches);

    const currNet = currIn - currOut;
    const prevNet = prevIn - prevOut;
    const diffNeraca = currNet - prevNet;
    const selisihPerkembangan = currIn - prevIn;

    return {
      wilayah: wil.label || wil.nama_kab_kota.replace(/^(kab\.|kota)\s*/i, ''),
      full_wilayah: wil.nama_kab_kota,
      arusMasuk: Number(currIn.toFixed(2)),
      arusKeluar: Number(currOut.toFixed(2)),
      selisihNeracaIni: Number(currNet.toFixed(2)),
      selisihNeracaLalu: Number(prevNet.toFixed(2)),
      deltaNet: Number(diffNeraca.toFixed(2)),
      selisihPerkembangan: Number(selisihPerkembangan.toFixed(2)),
      masukDeltaPct: calculateDeltaPct(currIn, prevIn),
      keluarDeltaPct: calculateDeltaPct(currOut, prevOut),
    };
  });
}

/**
 * 3. Evolusi Multi-Line Pasokan Komoditas Utama (Tab 4 Panel E)
 */
export function calculateTab4CommodityEvolution(rawRingkasan = []) {
  const sortedKalender = [...REF_KALENDER].sort((a, b) => new Date(a.tgl_mulai) - new Date(b.tgl_mulai));

  return sortedKalender.map(kal => {
    const point = { label: kal.label_singkat || kal.label_periode.split(' ')[0] };
    REF_KOMODITAS.forEach(kom => {
      const matches = rawRingkasan.filter(r =>
        !r.is_deleted &&
        r.id_periode === kal.id_periode &&
        matchKomoditasUnified(r.komoditas, kom.nama_komoditas) &&
        r.jenis_aliran === 'vol_masuk_ton'
      );
      const vol = matches.reduce((s, r) => s + getRowVolume(r), 0);
      const keyName = kom.nama_singkat || kom.nama_komoditas.replace(' (Ton)', '');
      point[keyName] = Number(vol.toFixed(1));
    });
    return point;
  });
}

/**
 * 4. Label Trend Panah DAX 6.3
 * DAX: Label_Trend_Masuk / Label_Trend_Harga
 */
export function formatLabelTrend(deltaPct) {
  if (deltaPct === null || deltaPct === undefined || deltaPct === 0) return '-';
  if (deltaPct > 0) return `▲ +${deltaPct.toFixed(1)}%`;
  return `▼ ${deltaPct.toFixed(1)}%`;
}
