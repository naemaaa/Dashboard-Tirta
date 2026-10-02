/**
 * MODUL KALKULASI EARLY WARNING SYSTEM (EWS) & RISK ANALYTICS


import { REF_KOMODITAS } from '../data/seedData.js';

/**
 * Generates EWS Seed Dataset if not present in Excel upload
 */
export function generateDefaultEwsData() {
  const ewsCommodities = [
    { id: 'EWS_01', komoditas: 'Daging Sapi Kualitas 1', heatmap_pb: 82.50, heatmap_pe: 79.00, heatmap_prod: 60.00, alps: 'CRITICAL', current_pressure: 0.38, forecast_pressure: 0.39 },
    { id: 'EWS_02', komoditas: 'Cabai Rawit Merah', heatmap_pb: 75.00, heatmap_pe: 68.00, heatmap_prod: 52.00, alps: 'CRITICAL', current_pressure: 0.32, forecast_pressure: 0.28 },
    { id: 'EWS_03', komoditas: 'Cabai Rawit Hijau', heatmap_pb: 48.21, heatmap_pe: 46.00, heatmap_prod: -25.00, alps: 'WARNING', current_pressure: 0.18, forecast_pressure: 0.19 },
    { id: 'EWS_04', komoditas: 'Bawang Merah Ukuran Sedang', heatmap_pb: -19.64, heatmap_pe: -21.00, heatmap_prod: -25.00, alps: 'WATCH', current_pressure: -0.12, forecast_pressure: 0.05 },
    { id: 'EWS_05', komoditas: 'Cabai Merah Keriting', heatmap_pb: -19.64, heatmap_pe: -24.00, heatmap_prod: -40.00, alps: 'WATCH', current_pressure: -0.05, forecast_pressure: 0.12 },
    { id: 'EWS_06', komoditas: 'Beras Kualitas Medium I', heatmap_pb: -18.23, heatmap_pe: -12.00, heatmap_prod: -16.00, alps: 'NORMAL', current_pressure: 0.01, forecast_pressure: 0.01 },
    { id: 'EWS_07', komoditas: 'Beras Kualitas Super I', heatmap_pb: -15.09, heatmap_pe: -12.00, heatmap_prod: -19.00, alps: 'NORMAL', current_pressure: -0.02, forecast_pressure: 0.08 },
    { id: 'EWS_08', komoditas: 'Beras Kualitas Bawah I', heatmap_pb: -15.30, heatmap_pe: -13.00, heatmap_prod: -20.00, alps: 'NORMAL', current_pressure: -0.03, forecast_pressure: 0.00 },
    { id: 'EWS_09', komoditas: 'Cabai Merah Besar', heatmap_pb: -14.82, heatmap_pe: -3.00, heatmap_prod: -20.00, alps: 'NORMAL', current_pressure: 0.00, forecast_pressure: -0.01 },
    { id: 'EWS_10', komoditas: 'Bawang Putih Honan', heatmap_pb: 4.20, heatmap_pe: 3.80, heatmap_prod: 2.10, alps: 'NORMAL', current_pressure: 0.04, forecast_pressure: 0.02 },
    { id: 'EWS_11', komoditas: 'Daging Ayam Ras', heatmap_pb: 6.50, heatmap_pe: 5.90, heatmap_prod: 4.20, alps: 'NORMAL', current_pressure: -0.04, forecast_pressure: -0.05 },
    { id: 'EWS_12', komoditas: 'Telur Ayam Ras', heatmap_pb: 2.10, heatmap_pe: 1.80, heatmap_prod: 1.20, alps: 'NORMAL', current_pressure: -0.08, forecast_pressure: -0.15 },
  ];

  // ─── Pseudorandom seeded noise (consistent but realistic-looking) ──────────
  // Menggunakan LCG (Linear Congruential Generator) supaya deterministik
  let seed = 20191;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF; return (seed >>> 0) / 0xFFFFFFFF; };
  const noise = (amp) => (rand() - 0.5) * 2 * amp;

  // ─── 2019-2026 Historical Prices (monthly, ~8 points/year) ────────────────
  const timeSeriesPrices = [];
  const baseByYear = {
    2019: 22000, 2020: 25000, 2021: 27000,
    2022: 34000, 2023: 35000, 2024: 36000,
    2025: 38000, 2026: 40000,
  };

  [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].forEach(year => {
    const pointsInYear = 6; // ~bimonthly points for each year
    const base = baseByYear[year];
    for (let p = 0; p < pointsInYear; p++) {
      // seasonal spikes: peak around mid-year (p=2,3) for food prices in DIY
      const seasonal = Math.sin((p / pointsInYear) * Math.PI) * 6500;
      // random short-term shock (market volatility)
      const shock = noise(5500);
      // structural upward trend within year
      const trend = p * 400;

      const prBase = Math.round(base + seasonal + shock + trend);
      const prPB   = Math.max(16000, prBase + Math.round(noise(2200)));
      const prPE   = Math.max(17000, Math.round(prBase * 1.08 + noise(2500)));
      const prPROD = Math.max(14000, Math.round(prBase * 0.82 + noise(2000)));

      timeSeriesPrices.push({
        time: year.toString(),   // tahun saja → X-axis bersih
        year,
        PB:   prPB,
        PE:   prPE,
        PROD: prPROD,
      });
    }
  });

  // ─── Forecasting Data (2019-2027) with 95% Confidence Interval Band ───────
  const forecastSeries = [];
  timeSeriesPrices.forEach(pt => {
    forecastSeries.push({
      time:       pt.time,
      year:       pt.year,
      actual:     pt.PE,
      forecast:   null,
      lowerBound: null,
      upperBound: null,
    });
  });

  const lastActual = timeSeriesPrices[timeSeriesPrices.length - 1].PE;

  // Future forecast points: gradually widening CI band
  const futurePoints = [
    { time: '2026', forecast: lastActual - 1500, margin: 3000 },
    { time: '2027', forecast: lastActual - 3500, margin: 6500 },
    { time: '2027', forecast: lastActual - 1000, margin: 9500 },
    { time: '2027', forecast: lastActual + 2500, margin: 12500 },
    { time: '2027', forecast: lastActual + 1200, margin: 15000 },
  ];

  // Bridge: last real point → start of forecast
  forecastSeries[forecastSeries.length - 1].forecast   = lastActual;
  forecastSeries[forecastSeries.length - 1].lowerBound = lastActual - 1000;
  forecastSeries[forecastSeries.length - 1].upperBound = lastActual + 1000;

  futurePoints.forEach(fp => {
    forecastSeries.push({
      time:       fp.time,
      year:       2027,
      actual:     null,
      forecast:   fp.forecast,
      lowerBound: fp.forecast - fp.margin,
      upperBound: fp.forecast + fp.margin,
    });
  });

  return {
    heatmap: ewsCommodities,
    timeSeries: timeSeriesPrices,
    forecast: forecastSeries,
  };
}

/**
 * Main EWS Calculations Hook Helper
 */
export function calculateEwsMetrics(ewsData = null, selectedKomoditas = 'Semua', selectedPelaku = 'All') {
  const defaultData = generateDefaultEwsData();
  const dataset = (ewsData && Array.isArray(ewsData.heatmap) && ewsData.heatmap.length > 0)
    ? ewsData
    : defaultData;
  const rawHeatmap = (dataset.heatmap && dataset.heatmap.length > 0) ? dataset.heatmap : defaultData.heatmap;

  // Normalize raw Excel heatmap rows
  const normalizedHeatmap = rawHeatmap.map((item, idx) => {
    // Helper to find key case-insensitively
    const findVal = (keys) => {
      for (const k of keys) {
        for (const objKey of Object.keys(item)) {
          if (objKey.toLowerCase().trim() === k.toLowerCase().trim()) {
            return item[objKey];
          }
        }
      }
      return null;
    };

    const komoditas = findVal(['komoditas', 'komoditi', 'nama_komoditas', 'commodity']) || item.komoditas || `Komoditas ${idx + 1}`;
    const heatmap_pb = Number(findVal(['heatmap_pb', 'pb', 'pedagang besar', 'harga pb', 'heatmap pb'])) || Number(item.heatmap_pb) || 0;
    const heatmap_pe = Number(findVal(['heatmap_pe', 'pe', 'pedagang eceran', 'harga pe', 'heatmap pe'])) || Number(item.heatmap_pe) || 0;
    const heatmap_prod = Number(findVal(['heatmap_prod', 'prod', 'produsen', 'harga prod', 'heatmap prod'])) || Number(item.heatmap_prod) || 0;
    
    let alps = findVal(['alps komoditas', 'alps status', 'status alps', 'alps', 'status']) || item.alps || 'NORMAL';
    alps = String(alps).toUpperCase().trim();
    if (!['NORMAL', 'WATCH', 'WARNING', 'CRITICAL'].includes(alps)) {
      if (heatmap_pb > 50 || heatmap_pe > 50) alps = 'CRITICAL';
      else if (heatmap_pb > 20 || heatmap_pe > 20) alps = 'WARNING';
      else if (heatmap_pb > 10 || heatmap_pe > 10) alps = 'WATCH';
      else alps = 'NORMAL';
    }

    const current_pressure = Number(findVal(['current_pressure', 'current pressure', 'current price pressure'])) || Number(item.current_pressure) || (heatmap_pb / 200);
    const forecast_pressure = Number(findVal(['forecast_pressure', 'forecast pressure'])) || Number(item.forecast_pressure) || (heatmap_pe / 200);

    return {
      id: item.id || `EWS_${idx + 1}`,
      komoditas,
      heatmap_pb,
      heatmap_pe,
      heatmap_prod,
      alps,
      current_pressure,
      forecast_pressure
    };
  });

  // Filter heatmap by selected commodity if specified
  const filteredHeatmap = normalizedHeatmap.filter(item => {
    if (!selectedKomoditas || selectedKomoditas === 'Semua' || selectedKomoditas === 'All') return true;
    return item.komoditas.toLowerCase().includes(selectedKomoditas.toLowerCase());
  });

  // Counts by ALPS status
  const normalCount   = filteredHeatmap.filter(r => r.alps === 'NORMAL').length;
  const watchCount    = filteredHeatmap.filter(r => r.alps === 'WATCH').length;
  const warningCount  = filteredHeatmap.filter(r => r.alps === 'WARNING').length;
  const criticalCount = filteredHeatmap.filter(r => r.alps === 'CRITICAL').length;

  // Overall EWS DIY Status
  let overallStatus = 'NORMAL';
  if (criticalCount > 0) overallStatus = 'CRITICAL';
  else if (warningCount > 0) overallStatus = 'WARNING';
  else if (watchCount > 0) overallStatus = 'WATCH';

  // Most Critical Commodity
  const criticalItem = filteredHeatmap
    .slice()
    .sort((a, b) => (b.heatmap_pb || 0) - (a.heatmap_pb || 0))[0];
  const mostCriticalName = criticalItem ? criticalItem.komoditas : 'Daging Sapi Kualitas 1';

  return {
    normalCount,
    watchCount,
    warningCount,
    criticalCount,
    overallStatus,
    mostCriticalName,
    heatmapData: filteredHeatmap,
    timeSeriesData: (dataset.timeSeries && dataset.timeSeries.length > 0) ? dataset.timeSeries : defaultData.timeSeries,
    forecastData: (dataset.forecast && dataset.forecast.length > 0) ? dataset.forecast : defaultData.forecast,
  };
}
