// Custom Hook: useCalculations
// Menghubungkan Zustand state dengan modul kalkulasi murni (src/calculations)
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import { useMemo } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { REF_KALENDER } from '../data/seedData';
import {
  calculateVolumeMasuk,
  calculateVolumeKeluar,
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
} from '../calculations';

export function useCalculations() {
  const {
    data,
    selectedPeriode,
    selectedKomoditas,
    selectedWilayah,
    selectedKlaster,
    tab2Komoditas,
    tab2Kabupaten,
    tab2Responden,
  } = useDashboardStore();

  const calculations = useMemo(() => {
    const rawRingkasan = data?.laporan_ringkasan || [];
    const rawArusMasuk = data?.arus_masuk || [];
    const rawArusKeluar = data?.arus_keluar || [];
    const rawRespondents = data?.respondents || [];
    const rawQualityIssues = data?.quality_issues || [];

    // 1. Identifikasi Periode Aktif & Periode Sebelumnya
    const sortedKalender = [...REF_KALENDER].sort((a, b) => new Date(a.tgl_mulai) - new Date(b.tgl_mulai));
    const currPeriodIndex = sortedKalender.findIndex(k => k.id_periode === selectedPeriode);
    const prevPeriodObj = currPeriodIndex > 0 ? sortedKalender[currPeriodIndex - 1] : null;

    // Helper matching functions
    const matchKomoditas = (rowKom, targetKom) => {
      if (!targetKom || targetKom === 'Semua' || targetKom === 'All') return true;
      if (!rowKom) return false;
      const n1 = rowKom.toString().toLowerCase().replace(/\s*\(ton\)|\s*\(kg\)/g, '').trim();
      const n2 = targetKom.toString().toLowerCase().replace(/\s*\(ton\)|\s*\(kg\)/g, '').trim();
      return n1 === n2 || rowKom === targetKom;
    };

    const matchWilayah = (rowWil, targetWil) => {
      if (!targetWil || targetWil === 'Semua Wilayah DIY' || targetWil === 'All' || targetWil === 'Semua') return true;
      if (!rowWil) return false;
      const n1 = rowWil.toString().toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim();
      const n2 = targetWil.toString().toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim();
      return n1 === n2 || rowWil === targetWil;
    };

    // Helper filter function untuk laporan_ringkasan
    const filterRingkasan = (rows, override = {}) => {
      const targetPeriode = override.periode !== undefined ? override.periode : selectedPeriode;
      const targetKomoditas = override.komoditas !== undefined ? override.komoditas : selectedKomoditas;
      const targetWilayah = override.wilayah !== undefined ? override.wilayah : selectedWilayah;
      const targetKlaster = override.klaster !== undefined ? override.klaster : selectedKlaster;

      return rows.filter(r => {
        if (r.is_deleted) return false;
        if (targetPeriode && targetPeriode !== 'Semua' && targetPeriode !== 'All' && r.id_periode !== targetPeriode) return false;
        if (!matchKomoditas(r.komoditas || r.id_komoditas, targetKomoditas)) return false;
        if (!matchWilayah(r.kab_kota || r.id_kab_kota, targetWilayah)) return false;
        if (targetKlaster && targetKlaster !== 'semua' && targetKlaster !== 'All' && r.tipe_responden !== targetKlaster) return false;
        return true;
      });
    };

    // 2. Kalkulasi KPI Metrik Periode Aktif & Sebelumnya
    const currRows = filterRingkasan(rawRingkasan);
    const prevRows = prevPeriodObj ? filterRingkasan(rawRingkasan, { periode: prevPeriodObj.id_periode }) : [];

    const getMetricsObject = (rows) => {
      const volMasuk = calculateVolumeMasuk(rows);
      const volKeluar = calculateVolumeKeluar(rows);
      const neracaBersih = calculateNeracaBersih(volMasuk, volKeluar);
      const statusNeraca = calculateStatusNeraca(neracaBersih);
      const avgHargaBeli = calculateAvgHargaBeli(rows);
      const avgHargaJual = calculateAvgHargaJual(rows);
      const marginRp = calculateMarginRp(avgHargaJual, avgHargaBeli);
      const marginPct = calculateMarginPct(marginRp, avgHargaBeli);
      const marginLabel = getMarginClassification(marginPct);

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
        countRecords: rows.length
      };
    };

    const currentMetrics = getMetricsObject(currRows);
    const prevMetrics = getMetricsObject(prevRows);

    const deltas = {
      volMasukDelta: calculateDeltaPct(currentMetrics.volMasuk, prevMetrics.volMasuk),
      volKeluarDelta: calculateDeltaPct(currentMetrics.volKeluar, prevMetrics.volKeluar),
      neracaDelta: Number((currentMetrics.neracaBersih - prevMetrics.neracaBersih).toFixed(2)),
      hargaJualDelta: calculateDeltaPct(currentMetrics.avgHargaJual, prevMetrics.avgHargaJual),
      hargaBeliDelta: calculateDeltaPct(currentMetrics.avgHargaBeli, prevMetrics.avgHargaBeli),
      marginDelta: Number((currentMetrics.marginPct - prevMetrics.marginPct).toFixed(1)),
    };

    // 3. Arus Masuk (Asal) & Arus Keluar (Tujuan) Breakdown
    const filterFlows = (rows) => {
      return rows.filter(r => {
        if (selectedPeriode && selectedPeriode !== 'Semua' && selectedPeriode !== 'All' && r.id_periode !== selectedPeriode) return false;
        if (!matchKomoditas(r.komoditas || r.id_komoditas, selectedKomoditas)) return false;
        if (!matchWilayah(r.kab_kota || r.id_kab_kota, selectedWilayah)) return false;
        return true;
      });
    };

    const filteredArusMasuk = filterFlows(rawArusMasuk);
    const filteredArusKeluar = filterFlows(rawArusKeluar);

    // Ketergantungan Eksternal Pasokan
    const pasokanStats = calculatePctLuarDiy(filteredArusMasuk);

    // Saluran Keluar (Lokal vs Re-ekspor)
    const totalKeluarFlow = filteredArusKeluar.reduce((a, b) => a + (Number(b.volume_ton) || 0), 0) || 1;
    const volReeksporKeluar = filteredArusKeluar.filter(r => r.keluar_diy).reduce((a, b) => a + (Number(b.volume_ton) || 0), 0);
    const volLokalKeluar = totalKeluarFlow - volReeksporKeluar;
    const pctReekspor = Number(((volReeksporKeluar / totalKeluarFlow) * 100).toFixed(1));
    const pctLokalKeluar = Number(((volLokalKeluar / totalKeluarFlow) * 100).toFixed(1));

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

    // 4. Visualisasi Spesifik Tab 1, 2, 3, 4, 5
    const matrixNeraca = calculateMatrixNeracaTab1(rawRingkasan, selectedPeriode, selectedKlaster);
    const butterflyData = calculateButterflyData(rawRingkasan, selectedPeriode, selectedWilayah, selectedKlaster);
    const historicalTrends = calculateHistoricalTrends(rawRingkasan, selectedKomoditas, selectedWilayah, selectedKlaster);
    const tab2GroupedMatrix = calculateTab2GroupedMatrix(rawRingkasan, selectedPeriode, tab2Responden);
    const tab2Decomposition = calculateTab2Decomposition(rawRingkasan, selectedPeriode, tab2Komoditas);
    const tab3PriceMatrix = calculateTab3PriceMatrix(rawRingkasan, selectedPeriode);
    const tab3MarginRanking = calculateTab3MarginRanking(tab3PriceMatrix);
    const tab3ScatterData = calculateTab3ScatterData(tab3PriceMatrix, butterflyData);
    const tab3RegionPrices = calculateTab3RegionPrices(rawRingkasan, selectedPeriode, selectedKomoditas);

    const pricesList = tab3RegionPrices.map(r => r.hargaJual).filter(p => p > 0);
    const maxRegionPrice = Math.max(...(pricesList.length ? pricesList : [0]));
    const minRegionPrice = Math.min(...(pricesList.length ? pricesList : [0]));

    const tab4RegionalDeltas = calculateTab4RegionalDeltas(rawRingkasan, selectedPeriode, prevPeriodObj, selectedKomoditas);
    const tab4CommodityEvolution = calculateTab4CommodityEvolution(rawRingkasan);

    const { qualityCounts, summaryTable: qualitySummaryTable } = calculateQualityMetrics(rawRingkasan, rawQualityIssues);
    const qualityByRegion = calculateQualityByRegion(qualityCounts.activeRecords);
    const qualityByCommodity = calculateQualityByCommodity(qualityCounts.activeRecords);

    return {
      currentMetrics,
      prevMetrics,
      deltas,
      filteredArusMasuk,
      filteredArusKeluar,
      pctLuarDiy: pasokanStats.pctLuarDiy,
      pctLokalMasuk: pasokanStats.pctLokal,
      volLuarDiyMasuk: pasokanStats.volLuarDiy,
      volLokalMasuk: pasokanStats.volLokal,
      pctReekspor,
      pctLokalKeluar,
      volReeksporKeluar,
      volLokalKeluar,
      top5Origins,
      top5Destinations,
      matrixNeraca,
      butterflyData,
      historicalTrends,
      tab2GroupedMatrix,
      tab2Decomposition,
      tab3PriceMatrix,
      tab3MarginRanking,
      tab3ScatterData,
      tab3RegionPrices,
      maxRegionPrice,
      minRegionPrice,
      tab4RegionalDeltas,
      tab4CommodityEvolution,
      qualityMetrics: qualityCounts,
      qualitySummaryTable,
      qualityByRegion,
      qualityByCommodity,
      respondents: rawRespondents,
      qualityIssues: rawQualityIssues
    };
  }, [data, selectedPeriode, selectedKomoditas, selectedWilayah, selectedKlaster, tab2Komoditas, tab2Kabupaten, tab2Responden]);

  return calculations;
}
