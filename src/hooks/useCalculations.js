// Custom Hook: useCalculations
// Menghubungkan Zustand state dengan modul kalkulasi murni (src/calculations)
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
//
// AUDIT FIX LOG (21 Sep 2026):
// - BUG-4: Local matchKomoditas / matchWilayah / matchKlaster dihapus.
//   Diganti import dari unified matchers di coreCalculations.js.

import { useMemo } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { REF_KALENDER } from '../data/seedData.js';
import {
  calculateVolumeMasuk,
  calculateVolumeKeluar,
  calculateVolumePerMinggu,
  detectDominantUnit,
  calculateNeracaBersih,
  calculateStatusNeraca,
  calculateAvgHargaBeli,
  calculateAvgHargaJual,
  calculateMarginRp,
  calculateMarginPct,
  getMarginClassification,
  calculatePctLuarDiy,
  calculateDeltaPct,
  calculateMatrixNeracaTab1,
  calculateButterflyData,
  calculateTab2GroupedMatrix,
  calculateTab2Decomposition,
  calculateTab3PriceMatrix,
  calculateTab3MarginRanking,
  calculateTab3ScatterData,
  calculateTab3RegionPrices,
  calculateHistoricalTrends,
  calculateTab4RegionalDeltas,
  calculateTab4CommodityEvolution,
  calculateQualityMetrics,
  calculateQualityByRegion,
  calculateQualityByCommodity,
  // AUDIT FIX: Unified matchers — single source of truth
  matchKomoditasUnified,
  matchWilayahUnified,
  matchKlasterUnified,
} from '../calculations/index.js';

export function useCalculations() {
  const {
    data,
    selectedPeriode,
    selectedKomoditas,
    selectedWilayah,
    selectedKlaster,
    // Tab-local filters (kept in store for backwards compat but global slicers take priority)
    tab2Responden,
  } = useDashboardStore();

  const calculations = useMemo(() => {
    const rawRingkasan     = data?.laporan_ringkasan || [];
    const rawArusMasuk     = data?.arus_masuk || [];
    const rawArusKeluar    = data?.arus_keluar || [];
    const rawRespondents   = data?.respondents || [];
    const rawQualityIssues = data?.quality_issues || [];
    const cleaningReport   = data?.cleaning_report || null;

    // ─────────────────────────────────────────────────────────────────
    // 1. Periode Context
    //    selectedPeriode bisa string tunggal atau string[] (multi-select)
    // ─────────────────────────────────────────────────────────────────
    const sortedKalender = [...REF_KALENDER].sort((a, b) => new Date(a.tgl_mulai) - new Date(b.tgl_mulai));

    // Normalisasi selectedPeriode ke array
    const periodeArray = Array.isArray(selectedPeriode)
      ? selectedPeriode
      : (selectedPeriode && selectedPeriode !== 'Semua' && selectedPeriode !== 'All')
        ? [selectedPeriode]
        : [];

    const isMultiPeriode = periodeArray.length > 1;
    const jumlahPeriode  = periodeArray.length || 1;

    // Periode sebelumnya (untuk delta WoW) — menggunakan periode terakhir yang dipilih
    const lastSelectedPeriode = periodeArray[periodeArray.length - 1] || selectedPeriode;
    const currPeriodIndex = sortedKalender.findIndex(k => k.id_periode === lastSelectedPeriode);
    const prevPeriodObj = currPeriodIndex > 0 ? sortedKalender[currPeriodIndex - 1] : null;

    // ─────────────────────────────────────────────────────────────────
    // 2. Helper matching functions — GUNAKAN UNIFIED MATCHERS (BUG-4 FIX)
    //    matchKomoditasUnified / matchWilayahUnified / matchKlasterUnified
    //    di-import dari coreCalculations.js (single source of truth).
    //    Local copies dihapus untuk mencegah divergensi regex antar tab.
    // ─────────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────────
    // 3. Filter function untuk laporan_ringkasan
    //    Support multi-periode: jika periodeArray kosong → semua periode
    // ─────────────────────────────────────────────────────────────────
    const filterRingkasan = (rows, override = {}) => {
      const targetPeriodeArr = override.periode !== undefined
        ? (Array.isArray(override.periode) ? override.periode : override.periode ? [override.periode] : [])
        : periodeArray;

      const targetKomoditas = override.komoditas !== undefined ? override.komoditas : selectedKomoditas;
      const targetWilayah   = override.wilayah   !== undefined ? override.wilayah   : selectedWilayah;
      const targetKlaster   = override.klaster   !== undefined ? override.klaster   : selectedKlaster;

      return rows.filter(r => {
        if (r.is_deleted) return false;
        // Multi-periode filter: jika array kosong → semua periode
        if (targetPeriodeArr.length > 0 && !targetPeriodeArr.includes(r.id_periode)) return false;
        if (!matchKomoditasUnified(r.komoditas || r.id_komoditas, targetKomoditas)) return false;
        if (!matchWilayahUnified(r.kab_kota || r.id_kab_kota, targetWilayah)) return false;
        if (!matchKlasterUnified(r.tipe_responden, targetKlaster)) return false;
        return true;
      });
    };

    // ─────────────────────────────────────────────────────────────────
    // 4. KPI Metrik Periode Aktif & Sebelumnya
    //    Saat multi-periode: tampilkan rata-rata per minggu (bukan total)
    // ─────────────────────────────────────────────────────────────────
    const currRows = filterRingkasan(rawRingkasan);
    const prevRows = prevPeriodObj
      ? filterRingkasan(rawRingkasan, { periode: prevPeriodObj.id_periode })
      : [];

    // Detect dominant unit for current filter (Ton, Liter, or Mixed)
    const dominantUnit = detectDominantUnit(currRows);

    const getMetricsObject = (rows, numPeriode = 1) => {
      // Jika multi-periode, gunakan rata-rata per minggu
      const volMasuk  = numPeriode > 1
        ? calculateVolumePerMinggu(rows, numPeriode, 'vol_masuk_ton')
        : calculateVolumeMasuk(rows);
      const volKeluar = numPeriode > 1
        ? calculateVolumePerMinggu(rows, numPeriode, 'vol_keluar_ton')
        : calculateVolumeKeluar(rows);

      const neracaBersih  = calculateNeracaBersih(volMasuk, volKeluar);
      const statusNeraca  = calculateStatusNeraca(neracaBersih);
      const avgHargaBeli  = calculateAvgHargaBeli(rows);
      const avgHargaJual  = calculateAvgHargaJual(rows);
      const marginRp      = calculateMarginRp(avgHargaJual, avgHargaBeli);
      const marginPct     = calculateMarginPct(marginRp, avgHargaBeli);
      const marginLabel   = getMarginClassification(marginPct);

      return {
        volMasuk,
        volKeluar,
        neracaBersih,
        statusNeraca,
        avgHargaBeli,
        avgHargaJual,
        marginRp,
        marginPct,
        marginLabel,
        countRecords: rows.length,
        isMultiPeriode: numPeriode > 1,
        dominantUnit: detectDominantUnit(rows),
      };
    };

    const currentMetrics = getMetricsObject(currRows, jumlahPeriode);
    const prevMetrics    = getMetricsObject(prevRows, 1);

    // AUDIT NOTE (W-2): Saat multi-periode, currentMetrics = rata-rata per minggu,
    // sementara prevMetrics = nilai periode tunggal sebelum periode terakhir yang dipilih.
    // Delta ini TIDAK apple-to-apple dalam mode multi-periode.
    // Field `isMultiPeriodeDelta` ditambahkan agar UI dapat menampilkan disclaimer.
    const deltas = {
      volMasukDelta:       calculateDeltaPct(currentMetrics.volMasuk, prevMetrics.volMasuk),
      volKeluarDelta:      calculateDeltaPct(currentMetrics.volKeluar, prevMetrics.volKeluar),
      neracaDelta:         Number((currentMetrics.neracaBersih - prevMetrics.neracaBersih).toFixed(2)),
      hargaJualDelta:      calculateDeltaPct(currentMetrics.avgHargaJual, prevMetrics.avgHargaJual),
      hargaBeliDelta:      calculateDeltaPct(currentMetrics.avgHargaBeli, prevMetrics.avgHargaBeli),
      marginDelta:         Number((currentMetrics.marginPct - prevMetrics.marginPct).toFixed(1)),
      isMultiPeriodeDelta: isMultiPeriode, // true = delta harus dibaca sebagai 'avg vs single'
    };

    // ─────────────────────────────────────────────────────────────────
    // 5. Arus Masuk & Keluar (filtered)
    // ─────────────────────────────────────────────────────────────────
    const filterFlows = (rows) => {
      return rows.filter(r => {
        if (periodeArray.length > 0 && !periodeArray.includes(r.id_periode)) return false;
        if (!matchKomoditasUnified(r.komoditas || r.id_komoditas, selectedKomoditas)) return false;
        if (!matchWilayahUnified(r.kab_kota || r.id_kab_kota, selectedWilayah)) return false;
        return true;
      });
    };

    const filteredArusMasuk  = filterFlows(rawArusMasuk);
    const filteredArusKeluar = filterFlows(rawArusKeluar);

    // Ketergantungan Eksternal
    const pasokanStats = calculatePctLuarDiy(filteredArusMasuk);

    // Saluran Keluar (Lokal vs Re-ekspor)
    const totalKeluarFlow    = filteredArusKeluar.reduce((a, b) => a + (Number(b.volume_ton) || 0), 0) || 1;
    const volReeksporKeluar  = filteredArusKeluar.filter(r => r.keluar_diy).reduce((a, b) => a + (Number(b.volume_ton) || 0), 0);
    const volLokalKeluar     = totalKeluarFlow - volReeksporKeluar;
    const pctReekspor        = Number(((volReeksporKeluar / totalKeluarFlow) * 100).toFixed(1));
    const pctLokalKeluar     = Number(((volLokalKeluar / totalKeluarFlow) * 100).toFixed(1));

    // Top 5 Sumber Pasokan
    const originMap = {};
    filteredArusMasuk.forEach(item => {
      const k = item.daerah_asal || 'Lainnya';
      if (!originMap[k]) originMap[k] = { name: k, volume: 0, luar_diy: item.luar_diy };
      originMap[k].volume += Number(item.volume_ton) || 0;
    });
    const top5Origins = Object.values(originMap)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)
      .map(item => ({ ...item, volume: Number(item.volume.toFixed(2)) }));

    // Top 5 Tujuan Distribusi
    const destMap = {};
    filteredArusKeluar.forEach(item => {
      const k = item.daerah_tujuan || 'Lainnya';
      if (!destMap[k]) destMap[k] = { name: k, volume: 0, keluar_diy: item.keluar_diy };
      destMap[k].volume += Number(item.volume_ton) || 0;
    });
    const top5Destinations = Object.values(destMap)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)
      .map(item => ({ ...item, volume: Number(item.volume.toFixed(2)) }));

    // ─────────────────────────────────────────────────────────────────
    // 6. Dynamic Available Options (Slicer mengikuti referensi data)
    //    Komoditas: semua yang ada di REF_KOMODITAS selalu aktif
    //    Periode/Wilayah: berdasarkan data aktif (is_deleted = false)
    // ─────────────────────────────────────────────────────────────────
    const activeRows = rawRingkasan.filter(r => !r.is_deleted);
    // Periode & Wilayah: hanya yang ada di data non-deleted
    const availablePeriodeIds = new Set(activeRows.map(r => r.id_periode));
    const availableKabKota    = new Set(activeRows.map(r => r.kab_kota));
    // Komoditas: semua komoditas yang pernah muncul di dataset (termasuk yang mungkin is_deleted)
    // supaya user tetap bisa pilih komoditas meskipun ada rows yang dihapus
    const availableKomoditasNames = new Set(rawRingkasan.map(r => r.komoditas).filter(Boolean));

    // ─────────────────────────────────────────────────────────────────
    // 7. Visualisasi per Tab
    // ─────────────────────────────────────────────────────────────────

    // Tab 1: pakai selectedPeriode global (bisa multi)
    const matrixNeraca  = calculateMatrixNeracaTab1(rawRingkasan, lastSelectedPeriode, selectedKlaster);
    const butterflyData = calculateButterflyData(rawRingkasan, lastSelectedPeriode, selectedWilayah, selectedKlaster);

    // Historical trends: selalu semua periode (chart multi-line)
    const historicalTrends = calculateHistoricalTrends(rawRingkasan, selectedKomoditas, selectedWilayah, selectedKlaster);

    // Tab 2: Matriks Arus & Dekomposisi Rantai Pasok (mengikuti global slicers)
    const tab2PeriodeArr = periodeArray;
    const tab2RowsForMatrix = rawRingkasan.filter(r => {
      if (r.is_deleted) return false;
      if (tab2PeriodeArr.length > 0 && !tab2PeriodeArr.includes(r.id_periode)) return false;
      return true;
    });
    const respondentFilterLabel = selectedKlaster === 'pedagang_besar' ? 'Pedagang Besar' : selectedKlaster === 'produsen' ? 'Produsen' : 'Semua';
    const tab2GroupedMatrix  = calculateTab2GroupedMatrix(tab2RowsForMatrix, lastSelectedPeriode, respondentFilterLabel);
    const tab2Decomposition  = calculateTab2Decomposition(tab2RowsForMatrix, lastSelectedPeriode, selectedKomoditas);

    // Tab 3: Harga & Marjin (mengikuti global slicers)
    const tab3PriceMatrix = calculateTab3PriceMatrix(rawRingkasan, lastSelectedPeriode, selectedWilayah, selectedKlaster);
    const tab3MarginRanking = calculateTab3MarginRanking(tab3PriceMatrix);
    const tab3ScatterData   = calculateTab3ScatterData(tab3PriceMatrix, butterflyData);
    const tab3RegionPrices  = calculateTab3RegionPrices(rawRingkasan, lastSelectedPeriode, selectedKomoditas, selectedKlaster);

    const pricesList     = tab3RegionPrices.map(r => r.hargaJual).filter(p => p > 0);
    const maxRegionPrice = Math.max(...(pricesList.length ? pricesList : [0]));
    const minRegionPrice = Math.min(...(pricesList.length ? pricesList : [0]));

    // Tab 4: Tren Antarwaktu (mengikuti global slicers)
    const tab4RegionalDeltas      = calculateTab4RegionalDeltas(rawRingkasan, lastSelectedPeriode, prevPeriodObj, selectedKomoditas);
    const tab4CommodityEvolution  = calculateTab4CommodityEvolution(rawRingkasan);

    // Tab 5: Quality & Cleaning — now passes rawRingkasan for real-time computation
    const { qualityCounts, summaryTable: qualitySummaryTable } = calculateQualityMetrics(rawRingkasan, rawQualityIssues);
    const qualityByRegion    = calculateQualityByRegion(rawRingkasan);
    const qualityByCommodity = calculateQualityByCommodity(rawRingkasan);


    return {
      // KPI
      currentMetrics,
      prevMetrics,
      deltas,
      dominantUnit,
      isMultiPeriode,
      jumlahPeriode,

      // Arus
      filteredArusMasuk,
      filteredArusKeluar,
      pctLuarDiy:     pasokanStats.pctLuarDiy,
      pctLokalMasuk:  pasokanStats.pctLokal,
      volLuarDiyMasuk: pasokanStats.volLuarDiy,
      volLokalMasuk:  pasokanStats.volLokal,
      pctReekspor,
      pctLokalKeluar,
      volReeksporKeluar,
      volLokalKeluar,
      top5Origins,
      top5Destinations,

      // Tab 1
      matrixNeraca,
      butterflyData,
      historicalTrends,

      // Tab 2
      tab2GroupedMatrix,
      tab2Decomposition,

      // Tab 3
      tab3PriceMatrix,
      tab3MarginRanking,
      tab3ScatterData,
      tab3RegionPrices,
      maxRegionPrice,
      minRegionPrice,

      // Tab 4
      tab4RegionalDeltas,
      tab4CommodityEvolution,

      // Tab 5
      qualityMetrics:   qualityCounts,
      qualitySummaryTable,
      qualityByRegion,
      qualityByCommodity,
      cleaningReport,

      // Metadata
      respondents:      rawRespondents,
      qualityIssues:    rawQualityIssues,

      // Dynamic slicer options (hanya nilai yang ada di data aktif)
      availablePeriodeIds,
      availableKomoditasNames,
      availableKabKota,
    };
  }, [
    data,
    selectedPeriode, selectedKomoditas, selectedWilayah, selectedKlaster,
    tab2Responden, // keep as it's used for respondent filter in Tab2 matrix
  ]);

  return calculations;
}
