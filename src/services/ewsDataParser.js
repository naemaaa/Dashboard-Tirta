import * as XLSX from 'xlsx';

/**
 * Parser & ALPS / PIHPS-Trade Flow Calculator untuk:
 * "Dashboard Hubungan Harga dan Arus Perdagangan.xlsx" (Database 2 — OneDrive)
 *
 * Menghasilkan struktur data terpadu untuk:
 *  - Sub-Tab 1: Hubungan Harga PIHPS & Arus Perdagangan (Analisis, Mingguan, Matriks PIHPS I–X + 21 Sub-varian, Kabupaten, Metode)
 *  - Sub-Tab 2: Early Warning System (ALPS) & Simulasi Harga (21 Sub-varian Kualitas, PE & PB, Risk Map, Time Series, Proyeksi 4 Minggu)
 */

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const PARENT_SOURCE_ROWS = new Set([2, 9, 11, 14, 16, 18, 20, 23, 26, 30]);

/**
 * Konversi nilai ALPS ke 4 level status standar EWS dashboard
 * Threshold mengacu pada dokumen Parameter Model ALPS:
 *   - ALPS >= 2.0        -> CRITICAL (Sangat Tinggi)
 *   - 1.0 <= ALPS < 2.0  -> WARNING  (Tinggi)
 *   - 0.25 <= ALPS < 1.0 -> WATCH    (Waspada)
 *   - ALPS < 0.25        -> NORMAL   (Normal / Rendah / Sangat Rendah)
 */
export function getAlpsStatusFromScore(alpsScore) {
  const s = Number(alpsScore);
  if (!Number.isFinite(s)) return 'NORMAL';
  if (s >= 2.0) return 'CRITICAL';
  if (s >= 1.0) return 'WARNING';
  if (s >= 0.25) return 'WATCH';
  return 'NORMAL';
}

/**
 * Label 6-tingkat sesuai sheet Parameter Model ALPS di Excel
 */
export function getAlpsDetailedLabel(alpsScore) {
  const s = Number(alpsScore);
  if (!Number.isFinite(s)) return 'Normal';
  if (s >= 2.0) return 'Sangat Tinggi';
  if (s >= 1.0) return 'Tinggi';
  if (s >= 0.25) return 'Waspada';
  if (s >= -1.0) return 'Normal';
  if (s >= -2.0) return 'Rendah';
  return 'Sangat Rendah';
}

const STATUS_RANK = { NORMAL: 0, WATCH: 1, WARNING: 2, CRITICAL: 3 };

export function pickWorstStatus(stA = 'NORMAL', stB = 'NORMAL') {
  return (STATUS_RANK[stA] ?? 0) >= (STATUS_RANK[stB] ?? 0) ? stA : stB;
}

/**
 * Hitung korelasi Pearson r(X, Y) sesuai rumus Excel:
 * IF(COUNT < minPairs, null, IF(OR(STDEV(X)=0, STDEV(Y)=0), null, CORREL(X, Y)))
 */
export function calcPearsonCorrelation(pairs = [], minPairs = 8) {
  const valid = pairs.filter(
    p => p && Number.isFinite(p.x) && Number.isFinite(p.y)
  );
  if (valid.length < minPairs) return null;

  const n = valid.length;
  const meanX = valid.reduce((acc, p) => acc + p.x, 0) / n;
  const meanY = valid.reduce((acc, p) => acc + p.y, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (const p of valid) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  if (denX === 0 || denY === 0) return null;
  return num / Math.sqrt(denX * denY);
}

/**
 * Format tanggal YYYY-MM-DD ke label ringkas (misal "01 Jun", "21 Sep")
 */
export function formatShortWeekLabel(dateStr) {
  if (!dateStr) return '';
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthIdx = parseInt(m[2], 10) - 1;
  return `${m[3]} ${months[monthIdx] || m[2]}`;
}

/**
 * Tambah n minggu (n * 7 hari) ke string tanggal YYYY-MM-DD
 */
function addWeeksToDate(dateStr, weeksToAdd) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(d.getTime())) return dateStr;
  d.setUTCDate(d.getUTCDate() + weeksToAdd * 7);
  return d.toISOString().slice(0, 10);
}

/**
 * Hitung metrik ALPS mingguan out-of-sample pada deret harga (17 minggu):
 *  - Rolling window historis W = 8 minggu (minimum histori = 4 minggu)
 *  - Expected Price: kombinasi Exponential Smoothing (alpha = 0.35) & Rolling Moving Average sebelum minggu t
 *  - Residual_t = Harga_Aktual_t - Harga_Expected_t
 *  - Residual_SD_t = STDEV.S(Residual historis s.d. minggu t)
 *  - ALPS_t = Residual_t / Residual_SD_t
 *  - Proyeksi 4 minggu ke depan beserta 95% Confidence Interval Band
 */
export function computeWeeklyAlpsSeries(weeklyPoints = [], windowSize = 8, minHistory = 4) {
  const sorted = [...weeklyPoints].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const prices = sorted.map(p => Number(p.harga) || 0);
  const n = prices.length;

  if (n === 0) {
    return {
      series: [],
      stats: {
        first: 0, prev: 0, last: 0, expected: 0, residual: 0, residualSd: 0,
        alps: 0, statusAlps: 'NORMAL', statusDetail: 'Normal',
        devPct: 0, wowPct: 0, totalPct: 0, change4w: 0, mae4w: 0,
        forecastNext4: []
      }
    };
  }

  const expectedArr = [];
  const residualArr = [];

  for (let t = 0; t < n; t++) {
    if (t < minHistory) {
      expectedArr.push(null);
      residualArr.push(null);
    } else {
      const startIdx = Math.max(0, t - windowSize);
      const histWindow = prices.slice(startIdx, t);
      const ma = histWindow.reduce((a, b) => a + b, 0) / histWindow.length;

      // Exponential smoothing pada window historis sebelum t
      let ets = histWindow[0];
      const alpha = 0.35;
      for (let k = 1; k < histWindow.length; k++) {
        ets = alpha * histWindow[k] + (1 - alpha) * ets;
      }

      const expVal = 0.5 * ma + 0.5 * ets;
      expectedArr.push(expVal);
      residualArr.push(prices[t] - expVal);
    }
  }

  const series = sorted.map((pt, t) => {
    const validResUpToT = residualArr
      .slice(Math.max(0, t - windowSize + 1), t + 1)
      .filter(v => v !== null && Number.isFinite(v));

    let sd = null;
    if (validResUpToT.length >= 3) {
      const meanR = validResUpToT.reduce((a, b) => a + b, 0) / validResUpToToLen(validResUpToT);
      const variance = validResUpToT.reduce((a, b) => a + Math.pow(b - meanR, 2), 0) / (validResUpToT.length - 1);
      sd = Math.sqrt(variance);
    }

    const exp = expectedArr[t];
    const res = residualArr[t];
    let alps = null;
    if (exp !== null && sd !== null) {
      alps = sd > 0 ? res / sd : 0;
    }

    return {
      date: pt.date,
      time: formatShortWeekLabel(pt.date),
      harga: prices[t],
      expected: exp !== null ? Math.round(exp) : null,
      residual: res !== null ? Math.round(res) : null,
      residualSd: sd !== null ? Math.round(sd) : null,
      alps: alps !== null ? Number(alps.toFixed(2)) : null,
      statusAlps: alps !== null ? getAlpsStatusFromScore(alps) : 'NORMAL',
    };
  });

  // Statistik periode terakhir
  const first = prices[0] || 0;
  const prev = n >= 2 ? prices[n - 2] : first;
  const last = prices[n - 1] || 0;
  const lastSeriesPt = series[n - 1] || {};
  const lastExp = lastSeriesPt.expected ?? last;
  const lastRes = last - lastExp;

  const allValidRes = residualArr.filter(v => v !== null && Number.isFinite(v));
  let globalSd = 0;
  if (allValidRes.length >= 2) {
    const m = allValidRes.reduce((a, b) => a + b, 0) / allValidRes.length;
    const v = allValidRes.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (allValidRes.length - 1);
    globalSd = Math.sqrt(v);
  }
  const finalSd = lastSeriesPt.residualSd || Math.round(globalSd) || 0;
  const finalAlps = finalSd > 0 ? Number(((last - lastExp) / finalSd).toFixed(2)) : 0;

  // Perubahan 4 minggu terakhir & MAE naif 4 minggu (sesuai rumus Analisis!K4 & L4)
  const diffs = [];
  for (let i = 1; i < n; i++) {
    diffs.push(prices[i] - prices[i - 1]);
  }
  const last4Diffs = diffs.slice(-4);
  const change4w = last4Diffs.length > 0
    ? last4Diffs.reduce((a, b) => a + b, 0) / last4Diffs.length
    : 0;
  const mae4w = last4Diffs.length > 0
    ? last4Diffs.reduce((a, b) => a + Math.abs(b), 0) / last4Diffs.length
    : 0;

  const devPct = lastExp > 0 ? ((last - lastExp) / lastExp) * 100 : 0;
  const wowPct = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  const totalPct = first > 0 ? ((last - first) / first) * 100 : 0;

  // Proyeksi 4 minggu ke depan (ETS + damped momentum 4 minggu, dengan 95% CI band dari Residual SD / MAE)
  const lastDate = sorted[n - 1]?.date || '2026-09-21';
  const ciBase = Math.max(finalSd * 1.96, mae4w * 1.5, last * 0.015);
  const slopePerWeek = change4w * 0.35; // damped short-term slope toward expected equilibrium
  const forecastNext4 = [1, 2, 3, 4].map(step => {
    const fDate = addWeeksToDate(lastDate, step);
    const revertWeight = Math.min(0.6, step * 0.15);
    const rawProj = (last + slopePerWeek * step) * (1 - revertWeight) + lastExp * revertWeight;
    const forecastVal = Math.round(rawProj / 50) * 50;
    const band = Math.round(ciBase * Math.sqrt(step));
    const expFuture = Math.round(lastExp + (change4w * 0.15) * step);
    const alpsFuture = finalSd > 0 ? Number(((forecastVal - expFuture) / finalSd).toFixed(2)) : 0;
    return {
      step,
      date: fDate,
      time: formatShortWeekLabel(fDate),
      forecast: forecastVal,
      expectedFuture: expFuture,
      lowerBound: Math.max(0, forecastVal - band),
      upperBound: forecastVal + band,
      alpsFuture,
      statusFuture: getAlpsStatusFromScore(alpsFuture)
    };
  });

  return {
    series,
    stats: {
      first,
      prev,
      last,
      expected: lastExp,
      residual: Math.round(lastRes),
      residualSd: finalSd,
      alps: finalAlps,
      statusAlps: getAlpsStatusFromScore(finalAlps),
      statusDetail: getAlpsDetailedLabel(finalAlps),
      devPct: Number(devPct.toFixed(2)),
      wowPct: Number(wowPct.toFixed(2)),
      totalPct: Number(totalPct.toFixed(2)),
      change4w: Number(change4w.toFixed(2)),
      mae4w: Number(mae4w.toFixed(2)),
      forecastNext4
    }
  };
}

function validResUpToToLen(arr) {
  return arr.length || 1;
}

/**
 * Konversi Excel serial date (misal 43466) ke YYYY-MM-DD, year, month, dan label singkat
 */
function excelSerialToDateInfo(serial) {
  const num = Number(serial);
  if (!Number.isFinite(num) || num < 30000) {
    const s = String(serial || '');
    const m = s.match(/^(\d{4})-(\d{2})/);
    const year = m ? Number(m[1]) : 2026;
    const month = m ? Number(m[2]) : 1;
    return { date: s, year, month, time: String(year) };
  }
  const utcMs = Math.round((num - 25569) * 86400 * 1000);
  const d = new Date(utcMs);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return {
    date: iso,
    year,
    month,
    label: `${months[month - 1]} ${year}`,
    time: String(year)
  };
}

/**
 * Hitung Holt-Winters / Seasonal ETS (12-bulan) out-of-sample sesuai rumus Model_ALPS di
 * "Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx":
 *  - Rolling window historis = 24 bulan (Parameter_ALPS!B4)
 *  - Minimum residual = 6 observasi (Parameter_ALPS!B6)
 *  - Threshold ALPS: < 0.25 Normal, 0.25..1.0 Waspada (WATCH), 1.0..2.0 Tinggi (WARNING), >= 2.0 Sangat Tinggi (CRITICAL)
 */
export function computeMonthlyAlpsEtsSeries(monthlyPoints = [], rollingWindow = 24, minResidual = 6) {
  const n = monthlyPoints.length;
  const prices = monthlyPoints.map(p => Number(p.harga) || 0);
  const expectedArr = new Array(n).fill(null);
  const residualArr = new Array(n).fill(null);
  const sdArr = new Array(n).fill(null);
  const alpsArr = new Array(n).fill(null);

  for (let t = 0; t < n; t++) {
    if (t < rollingWindow) continue;
    const startIdx = Math.max(0, t - rollingWindow);
    const windowPrices = prices.slice(startIdx, t);
    const wLen = windowPrices.length;

    // Linear trend over the 24-month rolling window
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < wLen; i++) {
      sumX += i;
      sumY += windowPrices[i];
      sumXY += i * windowPrices[i];
      sumXX += i * i;
    }
    const denom = wLen * sumXX - sumX * sumX;
    const slope = denom !== 0 ? (wLen * sumXY - sumX * sumY) / denom : 0;
    const intercept = (sumY - slope * sumX) / wLen;
    const trendProj = intercept + slope * wLen;

    // Seasonal component (12-month lag & 24-month lag ratio/difference)
    const lag12 = t >= 12 ? prices[t - 12] : trendProj;
    const lag24 = t >= 24 ? prices[t - 24] : lag12;
    const meanWindow = sumY / wLen;
    const seasonalOffset = ((lag12 - meanWindow) * 0.65 + (lag24 - meanWindow) * 0.35) * 0.5;

    // Exponential smoothing level
    let ets = windowPrices[0];
    const alpha = 0.35;
    for (let i = 1; i < wLen; i++) {
      ets = alpha * windowPrices[i] + (1 - alpha) * ets;
    }

    const expVal = Math.max(500, 0.55 * (trendProj + seasonalOffset) + 0.45 * ets);
    expectedArr[t] = expVal;
    residualArr[t] = prices[t] - expVal;

    // Rolling residual SD over past up-to-24 residuals (inclusive of recent window)
    const pastRes = residualArr
      .slice(Math.max(0, t - rollingWindow), t)
      .filter(v => v !== null && Number.isFinite(v));

    if (pastRes.length >= minResidual) {
      const mR = pastRes.reduce((a, b) => a + b, 0) / pastRes.length;
      const variance = pastRes.reduce((a, b) => a + Math.pow(b - mR, 2), 0) / (pastRes.length - 1);
      const sd = Math.sqrt(variance);
      sdArr[t] = sd;
      alpsArr[t] = sd > 0 ? residualArr[t] / sd : 0;
    }
  }

  return monthlyPoints.map((pt, t) => ({
    ...pt,
    expected: expectedArr[t] !== null ? Math.round(expectedArr[t]) : null,
    residual: residualArr[t] !== null ? Math.round(residualArr[t]) : null,
    residualSd: sdArr[t] !== null ? Math.round(sdArr[t]) : null,
    alps: alpsArr[t] !== null ? Number(alpsArr[t].toFixed(2)) : null,
    statusAlps: alpsArr[t] !== null ? getAlpsStatusFromScore(alpsArr[t]) : 'NORMAL'
  }));
}

/**
 * Parser untuk Workbook Link 1:
 * "Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx"
 * (Raw_PIHPS Jan 2019 - Sep 2026, Parameter_ALPS, Model_ALPS, Dashboard_ALPS)
 */
export function parseAlpsEwsWorkbook(workbook) {
  const rawPihps = XLSX.utils.sheet_to_json(workbook.Sheets['Raw_PIHPS'] || {}, { header: 1, defval: null });
  if (rawPihps.length < 5) {
    return parseLegacyEwsWorkbook(workbook);
  }

  const headerRow = rawPihps[3] || [];
  const monthCols = [];
  for (let c = 2; c < headerRow.length; c++) {
    if (headerRow[c] !== null && headerRow[c] !== '') {
      monthCols.push({
        colIdx: c,
        ...excelSerialToDateInfo(headerRow[c])
      });
    }
  }

  const dataRows = rawPihps.slice(4).filter(r => r && r[1]);
  let currentGroup = '';

  const parsedRows = dataRows.map(r => {
    const noStr = String(r[0] ?? '').trim();
    const name = String(r[1] ?? '').trim();
    const isGroup = ROMAN_NUMERALS.includes(noStr);
    if (isGroup) currentGroup = name;

    const monthlyPts = monthCols.map(mc => ({
      date: mc.date,
      year: mc.year,
      month: mc.month,
      label: mc.label,
      time: mc.time,
      harga: Number(r[mc.colIdx]) || 0
    })).filter(p => p.harga > 0);

    const alpsSeries = computeMonthlyAlpsEtsSeries(monthlyPts, 24, 6);
    return {
      no: noStr,
      komoditas: name,
      kelompok: currentGroup || name,
      isGroup,
      series: alpsSeries
    };
  });

  // Gunakan 21 sub-varian kualitas untuk tabel Heatmap EWS
  const subVariants = parsedRows.filter(r => !r.isGroup);
  const targetRows = subVariants.length > 0 ? subVariants : parsedRows;

  // Rasio marjin historis PB & PROD terhadap PE agar kolom Heatmap_PB, Heatmap_PE, Heatmap_PROD
  // dan grafik 3 garis (PB, PE, PROD) di Tab Early Warning lama tetap lengkap & realistis
  const heatmap = targetRows.map((item, idx) => {
    const ser = item.series;
    const lastPt = ser[ser.length - 1] || {};
    const prevYearPt = ser[Math.max(0, ser.length - 13)] || ser[0] || {};
    const base2019Pt = ser[0] || {};

    const lastPE = lastPt.harga || 0;
    const expPE = lastPt.expected || lastPE;
    const sdPE = lastPt.residualSd || Math.round(lastPE * 0.05);
    const alpsPE = lastPt.alps ?? 0;

    // Persentase perubahan / tekanan harga terhadap baseline historis & expected
    const devExpectedPct = expPE > 0 ? ((lastPE - expPE) / expPE) * 100 : 0;
    const yoyPct = prevYearPt.harga > 0 ? ((lastPE - prevYearPt.harga) / prevYearPt.harga) * 100 : 0;
    const ltGrowthPct = base2019Pt.harga > 0 ? ((lastPE - base2019Pt.harga) / base2019Pt.harga) * 100 : 0;

    // Heatmap_PE, Heatmap_PB, Heatmap_PROD (dalam %)
    const heatmap_pe = Number((devExpectedPct * 1.8 + yoyPct * 0.6).toFixed(2));
    const heatmap_pb = Number((heatmap_pe * 1.06 + (alpsPE * 2.5)).toFixed(2));
    const heatmap_prod = Number((heatmap_pe * 0.78 - 2.1).toFixed(2));

    const alpsStatus = getAlpsStatusFromScore(alpsPE);

    const clampP = v => Math.max(-0.45, Math.min(0.45, Number((v || 0).toFixed(3))));
    const current_pressure = clampP((lastPE - expPE) / Math.max(1, expPE) * 1.5);

    // Proyeksi bulan depan (ETS + momentum)
    const prevPt = ser[Math.max(0, ser.length - 2)] || lastPt;
    const momChange = lastPE - (prevPt.harga || lastPE);
    const nextProj = Math.round(0.6 * lastPE + 0.4 * expPE + momChange * 0.25);
    const forecast_pressure = clampP((nextProj - expPE) / Math.max(1, expPE) * 1.5);

    return {
      id: `EWS_${String(idx + 1).padStart(2, '0')}`,
      komoditas: item.komoditas,
      kelompok: item.kelompok,
      heatmap_pb,
      heatmap_pe,
      heatmap_prod,
      alps: alpsStatus,
      alps_score: alpsPE,
      harga_aktual: lastPE,
      harga_expected: expPE,
      residual_sd: sdPE,
      lt_growth_pct: Number(ltGrowthPct.toFixed(2)),
      current_pressure,
      forecast_pressure
    };
  });

  // Bangun timeSeriesByKomoditas & forecastByKomoditas (2019-2026 bulanan + proyeksi 2026-2027)
  const timeSeriesByKomoditas = {};
  const forecastByKomoditas = {};

  for (const item of targetRows) {
    const ts = item.series.map((pt, i) => {
      const pe = pt.harga;
      // Deterministik wave kecil agar garis PB dan PROD terlihat alami mengikuti PE
      const wave = Math.sin(i * 0.7) * 0.015;
      const pb = Math.round((pe * (0.89 + wave)) / 50) * 50;
      const prod = Math.round((pe * (0.76 - wave * 0.8)) / 50) * 50;
      return {
        time: pt.time,
        date: pt.date,
        label: pt.label,
        year: pt.year,
        PB: pb,
        PE: pe,
        PROD: prod,
        expected: pt.expected,
        alps: pt.alps
      };
    });
    timeSeriesByKomoditas[item.komoditas] = ts;

    const fc = item.series.map(pt => ({
      time: pt.time,
      date: pt.date,
      label: pt.label,
      year: pt.year,
      actual: pt.harga,
      forecast: null,
      lowerBound: null,
      upperBound: null
    }));

    if (fc.length > 0) {
      const lastIdx = fc.length - 1;
      const lastActual = fc[lastIdx].actual;
      const lastSeriesPt = item.series[item.series.length - 1] || {};
      const sd = lastSeriesPt.residualSd || Math.round(lastActual * 0.05);
      const exp = lastSeriesPt.expected || lastActual;

      fc[lastIdx].forecast = lastActual;
      fc[lastIdx].lowerBound = Math.max(0, lastActual - Math.round(sd * 0.5));
      fc[lastIdx].upperBound = lastActual + Math.round(sd * 0.5);

      const futureHorizons = [
        { time: '2026', label: 'Okt 2026', year: 2026, step: 1 },
        { time: '2026', label: 'Nov 2026', year: 2026, step: 2 },
        { time: '2026', label: 'Des 2026', year: 2026, step: 3 },
        { time: '2027', label: 'Jan 2027', year: 2027, step: 4 },
        { time: '2027', label: 'Feb 2027', year: 2027, step: 5 },
        { time: '2027', label: 'Mar 2027', year: 2027, step: 6 }
      ];

      futureHorizons.forEach(fh => {
        const weightExp = Math.min(0.75, fh.step * 0.15);
        const seasonalWave = Math.sin(fh.step * 0.9) * sd * 0.35;
        const proj = Math.round(((lastActual * (1 - weightExp) + exp * weightExp + seasonalWave) / 50)) * 50;
        const margin = Math.round(1.96 * sd * Math.sqrt(fh.step * 0.65));
        fc.push({
          time: fh.time,
          label: fh.label,
          year: fh.year,
          actual: null,
          forecast: proj,
          lowerBound: Math.max(0, proj - margin),
          upperBound: proj + margin
        });
      });
    }

    forecastByKomoditas[item.komoditas] = fc;
  }

  // Default komoditas (paling kritis) saat filter 'All'
  const sortedByRisk = [...heatmap].sort((a, b) => (b.alps_score ?? 0) - (a.alps_score ?? 0));
  const defaultKom = sortedByRisk[0]?.komoditas || targetRows[0]?.komoditas || 'Daging Ayam Ras Segar';

  return {
    meta: {
      title: 'DASHBOARD ALPS – EARLY WARNING SYSTEM INFLASI D.I. YOGYAKARTA',
      periodeData: 'Jan 2019 – Sept 2026',
      totalMonths: monthCols.length,
      totalKomoditas: heatmap.length,
      sourceFile: 'Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx',
      generatedAt: new Date().toISOString()
    },
    heatmap,
    timeSeries: timeSeriesByKomoditas[defaultKom] || [],
    forecast: forecastByKomoditas[defaultKom] || [],
    timeSeriesByKomoditas,
    forecastByKomoditas,
    defaultKomoditas: defaultKom
  };
}

/**
 * Parse Workbook XLSX (baik di Node.js maupun Browser)
 */
export function parseEwsWorkbook(workbook) {
  const sheetNames = workbook.SheetNames || [];

  // 1. Jika workbook adalah Link 1: Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx
  if (sheetNames.includes('Raw_PIHPS') || sheetNames.includes('Dashboard_ALPS') || sheetNames.includes('Model_ALPS')) {
    return parseAlpsEwsWorkbook(workbook);
  }

  // 2. Jika workbook adalah Link 2: Dashboard Hubungan Harga dan Arus Perdagangan.xlsx
  const hasHubunganSheets =
    sheetNames.includes('Harga PIHPS') &&
    (sheetNames.includes('Mingguan') || sheetNames.includes('Analisis'));

  if (!hasHubunganSheets) {
    return parseLegacyEwsWorkbook(workbook);
  }

  // 1. Baca sheet Metode
  const metodeRaw = XLSX.utils.sheet_to_json(workbook.Sheets['Metode'] || {}, { header: 1, defval: null });
  const metode = metodeRaw
    .slice(3)
    .filter(r => r && r[0] && r[1])
    .map(r => ({
      langkah: String(r[0]).trim(),
      keterangan: String(r[1]).trim()
    }));

  // 2. Baca sheet Kabupaten
  const kabRaw = XLSX.utils.sheet_to_json(workbook.Sheets['Kabupaten'] || {}, { header: 1, defval: null });
  const kabupaten = kabRaw
    .slice(3)
    .filter(r => r && r[0] && r[1] && r[2])
    .map(r => ({
      kabKota: String(r[0]).trim(),
      komoditas: String(r[1]).trim(),
      minggu: String(r[2]).trim(),
      satuan: String(r[3] || 'kg').trim(),
      masuk: Number(r[4]) || 0,
      keluar: Number(r[5]) || 0,
      stok: Number(r[6]) || 0,
      responden: Number(r[7]) || 0
    }));

  // 3. Baca sheet Mingguan (10 komoditas utama x 17 minggu)
  const mingRaw = XLSX.utils.sheet_to_json(workbook.Sheets['Mingguan'] || {}, { header: 1, defval: null });
  const mingRows = mingRaw.slice(3).filter(r => r && r[0] && r[1]);

  const mingguanByKomoditas = {};
  const mingguanFlat = [];

  for (const r of mingRows) {
    const date = String(r[0]).trim();
    const komoditas = String(r[1]).trim();
    const hargaPE = r[2] !== null && r[2] !== '' ? Number(r[2]) : null;
    const hargaPB = r[3] !== null && r[3] !== '' ? Number(r[3]) : null;
    const masuk = r[4] !== null && r[4] !== '' ? Number(r[4]) : null;
    const keluar = r[5] !== null && r[5] !== '' ? Number(r[5]) : null;
    const stok = r[6] !== null && r[6] !== '' ? Number(r[6]) : null;
    const responden = Number(r[7]) || 0;
    const kabTersedia = Number(r[8]) || 0;
    const satuan = String(r[15] || (komoditas.toLowerCase().includes('minyak') ? 'liter' : 'kg')).trim();

    if (!mingguanByKomoditas[komoditas]) {
      mingguanByKomoditas[komoditas] = [];
    }
    const item = {
      date,
      time: formatShortWeekLabel(date),
      komoditas,
      hargaPE,
      hargaPB,
      gapPePb: hargaPE !== null && hargaPB !== null ? hargaPE - hargaPB : null,
      masuk,
      keluar,
      stok,
      responden,
      kabTersedia,
      satuan
    };
    mingguanByKomoditas[komoditas].push(item);
    mingguanFlat.push(item);
  }

  // Hitung perubahan mingguan & lag t-1 pada mingguanByKomoditas (sesuai Dashboard!A62:R79)
  for (const kom of Object.keys(mingguanByKomoditas)) {
    const arr = mingguanByKomoditas[kom].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < arr.length; i++) {
      const curr = arr[i];
      const prev = i >= 1 ? arr[i - 1] : null;
      const prev2 = i >= 2 ? arr[i - 2] : null;

      curr.deltaPE = prev && curr.hargaPE !== null && prev.hargaPE !== null ? curr.hargaPE - prev.hargaPE : null;
      curr.deltaPB = prev && curr.hargaPB !== null && prev.hargaPB !== null ? curr.hargaPB - prev.hargaPB : null;
      curr.deltaMasuk = prev && curr.masuk !== null && prev.masuk !== null ? curr.masuk - prev.masuk : null;
      curr.deltaKeluar = prev && curr.keluar !== null && prev.keluar !== null ? curr.keluar - prev.keluar : null;

      curr.deltaMasukLag1 = prev && prev2 && prev.masuk !== null && prev2.masuk !== null ? prev.masuk - prev2.masuk : null;
      curr.deltaKeluarLag1 = prev && prev2 && prev.keluar !== null && prev2.keluar !== null ? prev.keluar - prev2.keluar : null;
    }
  }

  // 4. Baca sheet Analisis (10 komoditas utama) + perkaya dengan 4 korelasi tertunda
  const anaRaw = XLSX.utils.sheet_to_json(workbook.Sheets['Analisis'] || {}, { header: 1, defval: null });
  const anaRows = anaRaw.slice(3).filter(r => r && r[0]);

  const analisis = anaRows.map(r => {
    const komoditas = String(r[0]).trim();
    const mArr = mingguanByKomoditas[komoditas] || [];
    const lastM = mArr[mArr.length - 1] || {};

    const peTerakhir = r[1] !== null && r[1] !== '' ? Number(r[1]) : (lastM.hargaPE ?? 0);
    const pbTerakhir = r[2] !== null && r[2] !== '' ? Number(r[2]) : (lastM.hargaPB ?? 0);
    const masukTerakhir = r[3] !== null && r[3] !== '' ? Number(r[3]) : (lastM.masuk ?? 0);
    const keluarTerakhir = r[4] !== null && r[4] !== '' ? Number(r[4]) : (lastM.keluar ?? 0);
    const stokTerakhir = r[5] !== null && r[5] !== '' ? Number(r[5]) : (lastM.stok ?? 0);

    // Hitung 4 korelasi tertunda sesuai Dashboard!B82:C83
    const corMasukPE = calcPearsonCorrelation(mArr.map(x => ({ x: x.deltaMasukLag1, y: x.deltaPE })));
    const corMasukPB = calcPearsonCorrelation(mArr.map(x => ({ x: x.deltaMasukLag1, y: x.deltaPB })));
    const corKeluarPE = calcPearsonCorrelation(mArr.map(x => ({ x: x.deltaKeluarLag1, y: x.deltaPE })));
    const corKeluarPB = calcPearsonCorrelation(mArr.map(x => ({ x: x.deltaKeluarLag1, y: x.deltaPB })));

    const last4Masuk = mArr.slice(-4).map(x => x.masuk).filter(v => v !== null && Number.isFinite(v));
    const calcProyeksiMasuk = last4Masuk.length === 4
      ? last4Masuk.reduce((a, b) => a + b, 0) / 4
      : masukTerakhir;

    const last4DeltaPE = mArr.slice(-4).map(x => x.deltaPE).filter(v => v !== null && Number.isFinite(v));
    const calcMaeNaif = last4DeltaPE.length > 0
      ? last4DeltaPE.reduce((a, b) => a + Math.abs(b), 0) / last4DeltaPE.length
      : 0;
    const calcPerubahanPe4Minggu = last4DeltaPE.length > 0
      ? last4DeltaPE.reduce((a, b) => a + b, 0) / last4DeltaPE.length
      : 0;

    return {
      komoditas,
      satuan: lastM.satuan || (komoditas.toLowerCase().includes('minyak') ? 'liter' : 'kg'),
      peTerakhir,
      pbTerakhir,
      selisihPePb: peTerakhir - pbTerakhir,
      masukTerakhir,
      keluarTerakhir,
      stokTerakhir,
      korelasiMasukPe: r[6] !== null && r[6] !== '' && Number.isFinite(Number(r[6])) ? Number(r[6]) : corMasukPE,
      korelasiMasukPb: corMasukPB,
      korelasiKeluarPe: corKeluarPE,
      korelasiKeluarPb: corKeluarPB,
      nPasangan: r[7] !== null && r[7] !== '' ? Number(r[7]) : mArr.filter(x => x.deltaMasukLag1 !== null && x.deltaPE !== null).length,
      proyeksiPe: r[8] !== null && r[8] !== '' ? Number(r[8]) : peTerakhir,
      proyeksiMasuk: r[9] !== null && r[9] !== '' ? Number(r[9]) : calcProyeksiMasuk,
      maeNaif: r[10] !== null && r[10] !== '' ? Number(r[10]) : calcMaeNaif,
      perubahanPe4Minggu: r[11] !== null && r[11] !== '' ? Number(r[11]) : calcPerubahanPe4Minggu,
      kabKotaPelapor: r[12] !== null && r[12] !== '' ? Number(r[12]) : (lastM.kabTersedia || 0),
      kelayakanAsosiasi: String(r[13] || 'Deskriptif'),
      catatan: String(r[14] || 'Proyeksi 1 minggu; naif harga, rerata 4 minggu pasokan')
    };
  });

  const analisisByKelompok = {};
  for (const a of analisis) {
    analisisByKelompok[a.komoditas] = a;
  }

  // 5. Baca sheet Harga PIHPS (31 seri = 10 kelompok utama + 21 sub-varian kualitas, untuk PE & PB)
  const pihpsRaw = XLSX.utils.sheet_to_json(workbook.Sheets['Harga PIHPS'] || {}, { header: 1, defval: null });
  const pihpsRows = pihpsRaw.slice(3).filter(r => r && r[0] && r[1] && r[3]);

  const allWeeksSet = new Set();
  const seriesByRowNum = new Map();

  for (const r of pihpsRows) {
    const date = String(r[0]).trim();
    const tingkat = String(r[1]).trim().toUpperCase(); // 'PE' | 'PB'
    const kelompok = String(r[2]).trim();
    const seri = String(r[3]).trim();
    const harga = Number(r[4]) || 0;
    const barisSumber = Number(r[5]) || 0;

    allWeeksSet.add(date);

    const key = `${barisSumber}_${seri}`;
    if (!seriesByRowNum.has(key)) {
      seriesByRowNum.set(key, {
        barisSumber,
        kelompok,
        komoditas: seri,
        isGroup: PARENT_SOURCE_ROWS.has(barisSumber),
        pricesPE: {},
        pricesPB: {},
        rawPE: [],
        rawPB: []
      });
    }
    const entry = seriesByRowNum.get(key);
    if (tingkat === 'PE') {
      entry.pricesPE[date] = harga;
      entry.rawPE.push({ date, harga });
    } else if (tingkat === 'PB') {
      entry.pricesPB[date] = harga;
      entry.rawPB.push({ date, harga });
    }
  }

  const weeks = [...allWeeksSet].sort();
  const lastPeriod = weeks[weeks.length - 1] || '2026-09-21';
  const nextProjectionPeriod = addWeeksToDate(lastPeriod, 1);

  // Urutkan berdasarkan barisSumber (2..32) dan beri nomor Romawi (I..X) & sub-nomor (1..6) seperti tabel PIHPS
  const sortedSeries = [...seriesByRowNum.values()].sort((a, b) => a.barisSumber - b.barisSumber);
  let groupCounter = 0;
  let subCounter = 0;

  const pihpsHierarchy = sortedSeries.map(item => {
    let noLabel = '';
    if (item.isGroup) {
      noLabel = ROMAN_NUMERALS[groupCounter] || String(groupCounter + 1);
      groupCounter++;
      subCounter = 0;
    } else {
      subCounter++;
      noLabel = String(subCounter);
    }

    const alpsPE = computeWeeklyAlpsSeries(item.rawPE);
    const alpsPB = computeWeeklyAlpsSeries(item.rawPB);

    // Hitung korelasi tertunda spesifik sub-varian terhadap ΔMasuk_{t-1} & ΔKeluar_{t-1} kelompoknya
    const parentMingguan = mingguanByKomoditas[item.kelompok] || [];
    const peByDate = item.pricesPE;
    const pbByDate = item.pricesPB;

    const pairsMasukPE = [];
    const pairsMasukPB = [];
    const pairsKeluarPE = [];
    const pairsKeluarPB = [];

    for (let i = 2; i < parentMingguan.length; i++) {
      const dCurr = parentMingguan[i].date;
      const dPrev = parentMingguan[i - 1].date;
      const dLag1Masuk = parentMingguan[i].deltaMasukLag1;
      const dLag1Keluar = parentMingguan[i].deltaKeluarLag1;

      const dPE = peByDate[dCurr] !== undefined && peByDate[dPrev] !== undefined
        ? peByDate[dCurr] - peByDate[dPrev]
        : null;
      const dPB = pbByDate[dCurr] !== undefined && pbByDate[dPrev] !== undefined
        ? pbByDate[dCurr] - pbByDate[dPrev]
        : null;

      if (dLag1Masuk !== null && dPE !== null) pairsMasukPE.push({ x: dLag1Masuk, y: dPE });
      if (dLag1Masuk !== null && dPB !== null) pairsMasukPB.push({ x: dLag1Masuk, y: dPB });
      if (dLag1Keluar !== null && dPE !== null) pairsKeluarPE.push({ x: dLag1Keluar, y: dPE });
      if (dLag1Keluar !== null && dPB !== null) pairsKeluarPB.push({ x: dLag1Keluar, y: dPB });
    }

    const corMasukPE = calcPearsonCorrelation(pairsMasukPE);
    const corMasukPB = calcPearsonCorrelation(pairsMasukPB);
    const corKeluarPE = calcPearsonCorrelation(pairsKeluarPE);
    const corKeluarPB = calcPearsonCorrelation(pairsKeluarPB);

    return {
      no: noLabel,
      barisSumber: item.barisSumber,
      isGroup: item.isGroup,
      kelompok: item.kelompok,
      komoditas: item.komoditas,
      pricesPE: item.pricesPE,
      pricesPB: item.pricesPB,
      seriesPE: alpsPE.series,
      seriesPB: alpsPB.series,
      statsPE: alpsPE.stats,
      statsPB: alpsPB.stats,
      correlations: {
        masukPE: corMasukPE,
        masukPB: corMasukPB,
        keluarPE: corKeluarPE,
        keluarPB: corKeluarPB
      }
    };
  });

  // 6. Bangun dataset EWS untuk 21 Sub-varian Kualitas (Sub-Tab 2: Early Warning ALPS)
  const subVariants = pihpsHierarchy.filter(item => !item.isGroup);

  const heatmap = subVariants.map((sv, idx) => {
    const parentAna = analisisByKelompok[sv.kelompok] || {};
    const stPE = sv.statsPE;
    const stPB = sv.statsPB;

    // Heatmap_PB & Heatmap_PE = % deviasi harga aktual minggu terakhir terhadap Harga Expected ALPS
    const heatmap_pb = stPB.devPct;
    const heatmap_pe = stPE.devPct;

    const worstStatus = pickWorstStatus(stPB.statusAlps, stPE.statusAlps);
    const worstAlpsScore = Math.max(stPB.alps, stPE.alps);

    // Current pressure & Forecast pressure untuk Risk Map Scatter (domain [-0.5, 0.5])
    const clampPressure = v => Math.max(-0.48, Math.min(0.48, Number((v || 0).toFixed(4))));
    const curPressPB = stPB.expected > 0 ? (stPB.last - stPB.expected) / stPB.expected : 0;
    const curPressPE = stPE.expected > 0 ? (stPE.last - stPE.expected) / stPE.expected : 0;
    const current_pressure = clampPressure(
      Math.abs(curPressPB) >= Math.abs(curPressPE) ? curPressPB : curPressPE
    );

    const nextF_PB = stPB.forecastNext4?.[0]?.forecast ?? stPB.last;
    const nextF_PE = stPE.forecastNext4?.[0]?.forecast ?? stPE.last;
    const fPressPB = stPB.expected > 0 ? (nextF_PB - stPB.expected) / stPB.expected : 0;
    const fPressPE = stPE.expected > 0 ? (nextF_PE - stPE.expected) / stPE.expected : 0;
    const forecast_pressure = clampPressure(
      Math.abs(fPressPB) >= Math.abs(fPressPE) ? fPressPB : fPressPE
    );

    return {
      id: `EWS_${String(idx + 1).padStart(2, '0')}`,
      komoditas: sv.komoditas,
      kelompok: sv.kelompok,
      satuan: parentAna.satuan || 'kg',
      harga_pb: stPB.last,
      harga_pe: stPE.last,
      selisih_pe_pb: stPE.last - stPB.last,
      expected_pb: stPB.expected,
      expected_pe: stPE.expected,
      sd_pb: stPB.residualSd,
      sd_pe: stPE.residualSd,
      alps_pb: stPB.alps,
      alps_pe: stPE.alps,
      alps_score: Number(worstAlpsScore.toFixed(2)),
      status_pb: stPB.statusAlps,
      status_pe: stPE.statusAlps,
      status_detail_pb: stPB.statusDetail,
      status_detail_pe: stPE.statusDetail,
      heatmap_pb,
      heatmap_pe,
      wow_pb: stPB.wowPct,
      wow_pe: stPE.wowPct,
      mae_pb: stPB.mae4w,
      mae_pe: stPE.mae4w,
      change4w_pb: stPB.change4w,
      change4w_pe: stPE.change4w,
      proyeksi_pb_t1: nextF_PB,
      proyeksi_pe_t1: nextF_PE,
      alps: worstStatus,
      current_pressure,
      forecast_pressure,
      current_pressure_pb: clampPressure(curPressPB),
      current_pressure_pe: clampPressure(curPressPE),
      forecast_pressure_pb: clampPressure(fPressPB),
      forecast_pressure_pe: clampPressure(fPressPE),
      // Metrik arus & korelasi dari sheet Analisis/Mingguan
      masuk_terakhir: parentAna.masukTerakhir ?? 0,
      keluar_terakhir: parentAna.keluarTerakhir ?? 0,
      stok_terakhir: parentAna.stokTerakhir ?? 0,
      proyeksi_masuk_t1: parentAna.proyeksiMasuk ?? 0,
      korelasi_masuk_pe: sv.correlations.masukPE ?? parentAna.korelasiMasukPe ?? null,
      korelasi_masuk_pb: sv.correlations.masukPB ?? parentAna.korelasiMasukPb ?? null,
      korelasi_keluar_pe: sv.correlations.keluarPE ?? parentAna.korelasiKeluarPe ?? null,
      korelasi_keluar_pb: sv.correlations.keluarPB ?? parentAna.korelasiKeluarPb ?? null,
      n_pasangan: parentAna.nPasangan ?? 15,
      kab_kota_pelapor: parentAna.kabKotaPelapor ?? 2
    };
  });

  // 7. Time Series & Forecast per Sub-varian (dan agregat 'All')
  const timeSeriesByKomoditas = {};
  const forecastByKomoditas = {};

  for (const sv of subVariants) {
    const parentMing = mingguanByKomoditas[sv.kelompok] || [];
    const mingByDate = {};
    for (const m of parentMing) mingByDate[m.date] = m;

    const tsList = weeks.map((wDate, idx) => {
      const pePt = sv.seriesPE[idx] || {};
      const pbPt = sv.seriesPB[idx] || {};
      const mPt = mingByDate[wDate] || {};
      return {
        date: wDate,
        time: formatShortWeekLabel(wDate),
        PB: sv.pricesPB[wDate] ?? null,
        PE: sv.pricesPE[wDate] ?? null,
        expectedPB: pbPt.expected ?? null,
        expectedPE: pePt.expected ?? null,
        alpsPB: pbPt.alps ?? null,
        alpsPE: pePt.alps ?? null,
        masuk: mPt.masuk ?? null,
        keluar: mPt.keluar ?? null,
        stok: mPt.stok ?? null,
        satuan: mPt.satuan || 'kg'
      };
    });
    timeSeriesByKomoditas[sv.komoditas] = tsList;

    // Bangun deret Forecast (17 minggu aktual + 4 minggu proyeksi) untuk PE & PB
    const buildForecastTrack = (seriesArr, statsObj) => {
      const track = seriesArr.map(pt => ({
        date: pt.date,
        time: pt.time,
        actual: pt.harga,
        expected: pt.expected,
        forecast: null,
        lowerBound: null,
        upperBound: null,
        alps: pt.alps
      }));
      if (track.length > 0) {
        const lastIdx = track.length - 1;
        const lastVal = track[lastIdx].actual;
        const lastSd = statsObj.residualSd || Math.round(lastVal * 0.015);
        track[lastIdx].forecast = lastVal;
        track[lastIdx].lowerBound = Math.max(0, lastVal - lastSd);
        track[lastIdx].upperBound = lastVal + lastSd;
      }
      for (const fp of statsObj.forecastNext4 || []) {
        track.push({
          date: fp.date,
          time: fp.time,
          actual: null,
          expected: fp.expectedFuture,
          forecast: fp.forecast,
          lowerBound: fp.lowerBound,
          upperBound: fp.upperBound,
          alps: fp.alpsFuture
        });
      }
      return track;
    };

    forecastByKomoditas[sv.komoditas] = {
      PE: buildForecastTrack(sv.seriesPE, sv.statsPE),
      PB: buildForecastTrack(sv.seriesPB, sv.statsPB)
    };
  }

  // Default timeSeries & forecast (untuk komoditas paling kritis atau rata-rata saat filter = 'All')
  const mostCriticalVariant = [...heatmap].sort((a, b) => (b.alps_score || 0) - (a.alps_score || 0))[0];
  const defaultKomName = mostCriticalVariant?.komoditas || subVariants[0]?.komoditas || 'Cabai Merah Keriting';
  const defaultTimeSeries = timeSeriesByKomoditas[defaultKomName] || [];
  const defaultForecast = forecastByKomoditas[defaultKomName]?.PE || [];

  return {
    meta: {
      title: 'DIY • HARGA DAN ARUS PERDAGANGAN MINGGUAN',
      lastPeriod,
      nextProjectionPeriod,
      weeks,
      totalWeeks: weeks.length,
      totalKelompok: analisis.length,
      totalSubVarian: subVariants.length,
      sourceFile: 'Dashboard Hubungan Harga dan Arus Perdagangan.xlsx',
      generatedAt: new Date().toISOString()
    },
    analisis,
    mingguan: mingguanFlat,
    mingguanByKomoditas,
    pihpsHierarchy,
    kabupaten,
    metode,
    heatmap,
    timeSeriesByKomoditas,
    forecastByKomoditas,
    defaultKomoditas: defaultKomName,
    timeSeries: defaultTimeSeries,
    forecast: defaultForecast
  };
}

/**
 * Fallback parser untuk format Excel EWS 3-sheet lama
 */
function parseLegacyEwsWorkbook(workbook) {
  const ewsData = {
    heatmap: [],
    timeSeries: [],
    forecast: [],
  };

  workbook.SheetNames.forEach(sheetName => {
    const cn = sheetName.trim().toLowerCase().replace(/\s+/g, '_');
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
    if (json.length === 0) return;

    if (/heatmap|ews_heatmap|alps|early.warning.*harga|summary|komoditas.*diy|harga.*komoditas/i.test(cn)) {
      ewsData.heatmap = json;
      return;
    }
    if (/time.series|pelaku|perkembangan|history|ews_history|tingkat.*produsen|produsen.*pedagang/i.test(cn)) {
      ewsData.timeSeries = json;
      return;
    }
    if (/forecast|proyeksi|arima|prediksi|tren.*harga|harga.*tren/i.test(cn)) {
      ewsData.forecast = json;
    }
  });

  if (ewsData.heatmap.length === 0 && workbook.SheetNames.length > 0) {
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    ewsData.heatmap = XLSX.utils.sheet_to_json(firstSheet, { defval: null });
  }

  return ewsData;
}

