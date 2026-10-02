// ═══════════════════════════════════════════════════════════════════════════════
// exportUtils.js — xlsx-js-style Executive Export Engine (Browser-Native)
// Tim Pengendalian Inflasi Daerah DIY · Bank Indonesia KPw DIY · PSEKUIN UPN
// ═══════════════════════════════════════════════════════════════════════════════

import XLSXStyle from 'xlsx-js-style';
import { saveAs } from 'file-saver';

// ─── Brand Colors (ARGB hex without the FF prefix) ───────────────────────────
const C = {
  navyDark:   '0D1F3C',
  navyMid:    '0A2E5C',
  navyLight:  '1E74C7',
  teal:       '0E9488',
  gold:       'C89B3C',
  green:      '12B76A',
  greenLight: 'DCFAE6',
  red:        'F04438',
  redLight:   'FEE4E2',
  yellow:     'FEF0C7',
  white:      'FFFFFF',
  gray50:     'F9FAFB',
  gray100:    'F2F4F7',
  gray300:    'D0D5DD',
  gray500:    '98A2B3',
  gray700:    '344054',
  gray900:    '101828',
};

// ─── Helpers: cell styles ─────────────────────────────────────────────────────
const border = (color = C.gray300) => ({
  top:    { style: 'thin', color: { rgb: color } },
  bottom: { style: 'thin', color: { rgb: color } },
  left:   { style: 'thin', color: { rgb: color } },
  right:  { style: 'thin', color: { rgb: color } },
});

const fill = (bgHex) => ({ type: 'pattern', patternType: 'solid', fgColor: { rgb: bgHex } });

const font = ({ hex = C.gray900, bold = false, sz = 9, italic = false } = {}) => ({
  name: 'Calibri', bold, sz, italic, color: { rgb: hex },
});

const align = (horizontal = 'left', vertical = 'center', wrapText = false) => ({
  horizontal, vertical, wrapText,
});

// ─── Cell factory ─────────────────────────────────────────────────────────────
function cell(value, { bg = null, fg = C.gray900, bold = false, sz = 9, italic = false,
  halign = 'left', numFmt = null, border: withBorder = true } = {}) {
  const s = {
    font: font({ hex: fg, bold, sz, italic }),
    alignment: align(halign, 'center'),
  };
  if (bg) s.fill = fill(bg);
  if (withBorder) s.border = border(C.gray100);
  if (numFmt) s.numFmt = numFmt;
  return { v: value, s, t: typeof value === 'number' ? 'n' : 's' };
}

const H = (v, bg = C.navyMid, fg = C.white, sz = 9, halign = 'center') =>
  cell(v, { bg, fg, bold: true, sz, halign, border: true });

const D = (v, opt = {}) => cell(v, { halign: 'left', ...opt });

const numCell = (v, numFmt = '#,##0.00', extraStyle = {}) =>
  cell(v, { halign: 'right', numFmt, ...extraStyle });

const surplusCell = (v) => numCell(v, '#,##0.00', {
  fg: v >= 0 ? C.green : C.red,
  bg: v >= 0 ? C.greenLight : C.redLight,
  bold: true,
});

// ─── Helper: write workbook and trigger download ───────────────────────────────
async function triggerDownload(wb, fileName) {
  const wbout = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'Excel Workbook', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  saveAs(blob, fileName);
}

// ─── Helper: set column widths ────────────────────────────────────────────────
function colWidths(widths) {
  return widths.map(w => ({ wch: w }));
}

// ─── Helper: encode sheet array-of-arrays (aoa) ──────────────────────────────
function aoaToSheet(aoa, opts = {}) {
  return XLSXStyle.utils.aoa_to_sheet(aoa, opts);
}

// ════════════════════════════════════════════════════════════════════════════
// ═══════ SHEET BUILDERS ════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════

// ─── 1. Cover / Executive Summary ────────────────────────────────────────────
function buildCoverSheet(wb, { periodeLabel, komoditas, metrics, topOrigins, topDests, topSurplus, topDefisit }) {
  const now = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const aoa = [];

  // === HEADER ===
  aoa.push([H('LAPORAN KAJIAN ALIRAN KOMODITAS STRATEGIS DIY', C.navyDark, C.white, 14)]);
  aoa.push([H('Tim Pengendalian Inflasi Daerah DIY · Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta', C.navyLight, C.white, 9, 'center')]);
  aoa.push([]);

  // === METADATA ===
  aoa.push([H('METADATA LAPORAN', C.navyMid, C.white, 9), cell(''), cell('')]);
  aoa.push([D('Periode Laporan', { bold: true, bg: C.gray50 }), D(periodeLabel, { fg: C.navyLight, bold: true }), cell('')]);
  aoa.push([D('Komoditas Aktif', { bold: true, bg: C.gray50 }), D(komoditas || 'Semua Komoditas', { fg: C.navyLight, bold: true }), cell('')]);
  aoa.push([D('Tanggal Cetak',   { bold: true, bg: C.gray50 }), D(now, { fg: C.navyMid, bold: true }), cell('')]);
  aoa.push([]);

  // === KPI ===
  aoa.push([H('📊 RINGKASAN METRIK UTAMA', C.navyMid, C.white, 10)]);
  const kpis = [
    ['Volume Masuk Total (Ton)',    metrics.volMasuk ?? 0,    '#,##0.00', C.navyLight],
    ['Volume Keluar Total (Ton)',   metrics.volKeluar ?? 0,   '#,##0.00', C.teal],
    ['Selisih Net / Neraca (Ton)',  metrics.neracaBersih ?? 0,'#,##0.00', (metrics.neracaBersih ?? 0) >= 0 ? C.green : C.red],
    ['Rata-rata Harga Jual (Rp/kg)',metrics.hargaJual ?? 0,   '"Rp "#,##0', C.gold],
    ['Rata-rata Harga Beli (Rp/kg)',metrics.hargaBeli ?? 0,   '"Rp "#,##0', C.gold],
    ['Marjin Tataniaga (%)',        metrics.marginPct ?? 0,   '0.00"%"',  C.navyMid],
    ['Jumlah Responden',           metrics.countRespondents ?? 0, '0',    C.gray700],
  ];
  kpis.forEach(([lbl, val, fmt, col]) => {
    aoa.push([
      D(lbl, { bold: true, bg: C.gray50 }),
      numCell(val, fmt, { fg: col, bold: true, bg: C.gray50 }),
      cell(''),
    ]);
  });
  aoa.push([]);

  // === TOP 5 ORIGINS ===
  aoa.push([H('📍 TOP 5 ASAL PASOKAN', C.navyLight, C.white, 10), H('Daerah Asal', C.navyLight, C.white), H('Volume (Ton)', C.navyLight, C.white)]);
  (topOrigins || []).slice(0, 5).forEach((o, i) => {
    aoa.push([D(`#${i + 1}`, { bg: C.gray50 }), D(o.name, { bg: C.gray50 }), numCell(o.volume || 0, '#,##0.00', { bg: C.gray50 })]);
  });
  aoa.push([]);

  // === TOP 5 DEST ===
  aoa.push([H('🚚 TOP 5 TUJUAN DISTRIBUSI', C.teal, C.white, 10), H('Daerah Tujuan', C.teal, C.white), H('Volume (Ton)', C.teal, C.white)]);
  (topDests || []).slice(0, 5).forEach((d, i) => {
    aoa.push([D(`#${i + 1}`, { bg: C.gray50 }), D(d.name, { bg: C.gray50 }), numCell(d.volume || 0, '#,##0.00', { bg: C.gray50 })]);
  });
  aoa.push([]);

  // === INSIGHT ===
  aoa.push([H('🔑 INSIGHT KOMODITAS UTAMA', C.gold, C.white, 10)]);
  aoa.push([D('✅ Surplus Terbesar (Aman):', { bold: true, fg: C.green })]);
  aoa.push([D((topSurplus || []).map(s => `• ${s.komoditas}: +${(s.selisih || 0).toFixed(2)} Ton`).join('   ') || 'Tidak ada data')]);
  aoa.push([D('⚠️ Defisit / Perlu Atensi:', { bold: true, fg: C.red })]);
  aoa.push([D((topDefisit || []).map(d => `• ${d.komoditas}: ${(d.selisih || 0).toFixed(2)} Ton`).join('   ') || 'Tidak ada defisit')]);
  aoa.push([]);
  aoa.push([D('Dicetak oleh: Sistem BI Intelligence v1.0 — TIRTA Dashboard 2026', { italic: true, fg: C.gray500 })]);

  const ws = aoaToSheet(aoa);
  // Merge A1 across 3 columns
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Subtitle
  ];
  ws['!cols'] = colWidths([32, 30, 18]);
  ws['!rows'] = [{ hpt: 30 }, { hpt: 16 }];
  XLSXStyle.utils.book_append_sheet(wb, ws, '📋 Executive Summary');
}

// ─── 2. Neraca per Wilayah ────────────────────────────────────────────────────
function buildNeracaSheet(wb, { matrixNeraca, REF_WILAYAH }) {
  const headers1 = [H('NERACA ARUS PER KOMODITAS × KAB/KOTA | Nilai = Selisih Net (Ton)', C.navyDark, C.white, 11)];
  const headers2 = [
    H('Komoditas', C.navyMid),
    ...REF_WILAYAH.map(w => H(w.nama_kab_kota.replace('Kab. ', ''), C.navyMid)),
    H('Total DIY', C.gold, C.white),
  ];

  const rows = (matrixNeraca || []).map((row, ri) => [
    D((row.komoditas || '').replace(/ \((Ton|Liter)\)/g, ''), { bold: true, bg: ri % 2 === 0 ? C.white : C.gray50 }),
    ...REF_WILAYAH.map(w => surplusCell(row.wilayahNeraca?.[w.nama_kab_kota] ?? 0)),
    surplusCell(row.totalDIY ?? 0),
  ]);

  const aoa = [headers1, headers2, ...rows];
  const ws = aoaToSheet(aoa);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: REF_WILAYAH.length + 1 } }];
  ws['!cols'] = [{ wch: 26 }, ...REF_WILAYAH.map(() => ({ wch: 14 })), { wch: 14 }];
  ws['!rows'] = [{ hpt: 22 }, { hpt: 18 }];
  XLSXStyle.utils.book_append_sheet(wb, ws, '1. Neraca Wilayah');
}

// ─── Helper: Sparkline bar visual generator ─────────────────────────────
function getSparklineBar(value, maxVal, length = 12) {
  if (!maxVal || maxVal <= 0) return '░'.repeat(length);
  const ratio = Math.min(1, Math.max(0, Math.abs(value) / maxVal));
  const filled = Math.round(ratio * length);
  const empty = length - filled;
  const barChar = value >= 0 ? '█' : '▓';
  return barChar.repeat(filled) + '░'.repeat(empty);
}

// ─── 3. Arus & Selisih Komoditas ─────────────────────────────────────────────
function buildButterflySheet(wb, { butterflyData }) {
  const headers = [
    H('Komoditas', C.navyMid),
    H('Vol. Masuk (Ton)', C.navyMid),
    H('Vol. Keluar (Ton)', C.navyMid),
    H('Selisih Net (Ton)', C.navyMid),
    H('Status', C.navyMid),
    H('Grafik Visual (Sparkline Bar)', C.navyMid),
  ];

  const maxVal = Math.max(...(butterflyData || []).map(b => Math.abs((b.volMasuk || 0) - (b.volKeluar || 0))), 1);

  const rows = (butterflyData || []).map((b, ri) => {
    const selisih = (b.volMasuk || 0) - (b.volKeluar || 0);
    const bg = ri % 2 === 0 ? C.white : C.gray50;
    const bar = getSparklineBar(selisih, maxVal, 14);
    return [
      D((b.komoditas || '').replace(/ \((Ton|Liter)\)/g, ''), { bold: true, bg }),
      numCell(b.volMasuk || 0, '#,##0.00', { bg }),
      numCell(b.volKeluar || 0, '#,##0.00', { bg }),
      surplusCell(selisih),
      D(selisih >= 0 ? '✅ Surplus' : '⚠️ Defisit', { fg: selisih >= 0 ? C.green : C.red, bold: true, bg }),
      D(bar, { fg: selisih >= 0 ? C.green : C.red, bold: true, bg, halign: 'center' }),
    ];
  });

  const titleRow = [H('RINGKASAN ARUS MASUK vs KELUAR & SELISIH NET PER KOMODITAS', C.navyDark, C.white, 11)];
  const aoa = [titleRow, headers, ...rows];
  const ws = aoaToSheet(aoa);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
  ws['!cols'] = colWidths([28, 18, 18, 18, 16, 26]);
  ws['!rows'] = [{ hpt: 22 }, { hpt: 18 }];
  XLSXStyle.utils.book_append_sheet(wb, ws, '2. Arus & Selisih Komoditas');
}

// ─── 4. Matriks Arus Masuk-Keluar per Wilayah ────────────────────────────────
function buildArusMatrixSheet(wb, { tab2GroupedMatrix, REF_WILAYAH }) {
  const titleRow = [H('MATRIKS ARUS MASUK, KELUAR & SELISIH PER KOMODITAS × KAB/KOTA (TON)', C.navyDark, C.white, 11)];

  // Header: group by wilayah
  const groupHeader = [H('Komoditas', C.navyMid, C.white)];
  REF_WILAYAH.forEach((w, wi) => {
    groupHeader.push(H(w.nama_kab_kota.replace('Kab. ', ''), wi % 2 === 0 ? C.navyMid : C.navyLight, C.white));
    groupHeader.push(H('', wi % 2 === 0 ? C.navyMid : C.navyLight, C.white));
    groupHeader.push(H('', wi % 2 === 0 ? C.navyMid : C.navyLight, C.white));
  });

  const subHeader = [H('', C.navyMid)];
  REF_WILAYAH.forEach(() => {
    subHeader.push(H('Masuk', C.navyLight));
    subHeader.push(H('Keluar', C.navyLight));
    subHeader.push(H('Selisih', C.navyLight));
  });

  const rows = (tab2GroupedMatrix || []).map((row, ri) => {
    const bg = ri % 2 === 0 ? C.white : C.gray50;
    const r = [D((row.komoditas || '').replace(/ \((Ton|Liter)\)/g, ''), { bold: true, bg })];
    REF_WILAYAH.forEach(w => {
      const c = row.wilayahData?.[w.nama_kab_kota] || { masuk: 0, keluar: 0, selisih: 0 };
      r.push(numCell(c.masuk, '#,##0.00', { bg }));
      r.push(numCell(c.keluar, '#,##0.00', { bg }));
      r.push(surplusCell(c.selisih));
    });
    return r;
  });

  const aoa = [titleRow, groupHeader, subHeader, ...rows];
  const ws = aoaToSheet(aoa);

  // Merges for title and group headers
  const totalCols = 1 + REF_WILAYAH.length * 3;
  const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }];
  REF_WILAYAH.forEach((_, wi) => {
    const col = 1 + wi * 3;
    merges.push({ s: { r: 1, c: col }, e: { r: 1, c: col + 2 } });
  });
  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 26 }, ...REF_WILAYAH.flatMap(() => [{ wch: 11 }, { wch: 11 }, { wch: 11 }])];
  ws['!rows'] = [{ hpt: 22 }, { hpt: 18 }, { hpt: 16 }];
  XLSXStyle.utils.book_append_sheet(wb, ws, '3. Matriks Arus x Wilayah');
}

// ─── 5. Harga & Marjin ───────────────────────────────────────────────────────
function buildHargaSheet(wb, { tab3PriceMatrix, tab3MarginRanking, REF_WILAYAH }) {
  const titleRow = [H('MATRIKS HARGA BELI, HARGA JUAL & MARJIN TATANIAGA (Rp/kg & %)', C.navyDark, C.white, 11)];

  const groupHeader = [H('Komoditas', C.navyMid, C.white)];
  REF_WILAYAH.forEach((w, wi) => {
    groupHeader.push(H(w.nama_kab_kota.replace('Kab. ', ''), wi % 2 === 0 ? C.navyMid : C.navyLight, C.white));
    groupHeader.push(H('', wi % 2 === 0 ? C.navyMid : C.navyLight, C.white));
    groupHeader.push(H('', wi % 2 === 0 ? C.navyMid : C.navyLight, C.white));
  });
  groupHeader.push(H('Rata-rata DIY', C.gold, C.white));
  groupHeader.push(H('', C.gold, C.white));
  groupHeader.push(H('', C.gold, C.white));

  const subHeader = [H('', C.navyMid)];
  [...REF_WILAYAH, { nama_kab_kota: 'DIY' }].forEach((_, wi) => {
    const bg = wi < REF_WILAYAH.length ? C.navyLight : C.gold;
    subHeader.push(H('Beli', bg));
    subHeader.push(H('Jual', bg));
    subHeader.push(H('Marjin%', bg));
  });

  const rows = (tab3PriceMatrix || []).map((row, ri) => {
    const bg = ri % 2 === 0 ? C.white : C.gray50;
    const r = [D((row.komoditas || '').replace(/ \((Ton|Liter)\)/g, ''), { bold: true, bg })];
    REF_WILAYAH.forEach(w => {
      const p = row.wilayahPrices?.[w.nama_kab_kota] || { hargaBeli: 0, hargaJual: 0, marginPct: 0 };
      r.push(numCell(p.hargaBeli, '"Rp "#,##0', { bg }));
      r.push(numCell(p.hargaJual, '"Rp "#,##0', { bg }));
      r.push(numCell(p.marginPct, '0.00"%"', { bg }));
    });
    r.push(numCell(row.avgBeliAll ?? 0,  '"Rp "#,##0', { bg: C.yellow, bold: true }));
    r.push(numCell(row.avgJualAll ?? 0,  '"Rp "#,##0', { bg: C.yellow, bold: true }));
    r.push(numCell(row.avgMarginPct ?? 0,'0.00"%"',    { bg: C.yellow, bold: true, fg: C.gold }));
    return r;
  });

  const aoa = [titleRow, groupHeader, subHeader, ...rows];
  const ws = aoaToSheet(aoa);

  const totalCols = 1 + (REF_WILAYAH.length + 1) * 3;
  const merges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }];
  REF_WILAYAH.forEach((_, wi) => {
    merges.push({ s: { r: 1, c: 1 + wi * 3 }, e: { r: 1, c: 3 + wi * 3 } });
  });
  merges.push({ s: { r: 1, c: 1 + REF_WILAYAH.length * 3 }, e: { r: 1, c: (REF_WILAYAH.length + 1) * 3 } });
  ws['!merges'] = merges;
  ws['!cols'] = [{ wch: 26 }, ...[...REF_WILAYAH, {}].flatMap(() => [{ wch: 13 }, { wch: 13 }, { wch: 10 }])];
  ws['!rows'] = [{ hpt: 22 }, { hpt: 18 }, { hpt: 16 }];
  XLSXStyle.utils.book_append_sheet(wb, ws, '4. Harga & Marjin');

  // Peringkat Marjin sheet
  const rankTitle = [H('PERINGKAT MARJIN TATANIAGA PER KOMODITAS (%)', C.navyDark, C.white, 11)];
  const rankHeader = [
    H('Peringkat', C.gold, C.white),
    H('Komoditas', C.gold, C.white),
    H('Marjin (%)', C.gold, C.white),
    H('Kategori', C.gold, C.white),
    H('Grafik Visual Marjin (%)', C.gold, C.white),
  ];

  const maxMargin = Math.max(...(tab3MarginRanking || []).map(m => m.marginPct || 0), 1);

  const rankRows = (tab3MarginRanking || [])
    .sort((a, b) => (b.marginPct || 0) - (a.marginPct || 0))
    .map((m, ri) => {
      const pct = m.marginPct || 0;
      const bg = pct >= 8 ? C.greenLight : pct >= 5 ? C.yellow : C.redLight;
      const fg = pct >= 8 ? C.green : pct >= 5 ? C.gold : C.red;
      const bar = getSparklineBar(pct, maxMargin, 12);
      return [
        D(`#${ri + 1}`, { bg, bold: true, halign: 'center' }),
        D((m.komoditas || m.shortName || '').replace(/ \((Ton|Liter)\)/g, ''), { bg }),
        numCell(pct, '0.00"%"', { bg, fg, bold: true }),
        D(m.kategori || (pct >= 8 ? 'Tinggi' : pct >= 5 ? 'Sedang' : 'Rendah'), { bg, fg, bold: true }),
        D(bar, { bg, fg, bold: true, halign: 'center' }),
      ];
    });

  const rankAoa = [rankTitle, rankHeader, ...rankRows];
  const rankWs = aoaToSheet(rankAoa);
  rankWs['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  rankWs['!cols'] = colWidths([12, 30, 14, 18, 24]);
  rankWs['!rows'] = [{ hpt: 22 }, { hpt: 18 }];
  XLSXStyle.utils.book_append_sheet(wb, rankWs, '5. Peringkat Marjin');
}

// ─── 6. Tren Historis ───────────────────────────────────────────────────────
function buildTrenSheet(wb, { historicalTrends }) {
  const titleRow = [H('TREN HISTORIS VOLUME PASOKAN & HARGA MINGGUAN', C.navyDark, C.white, 11)];
  const headers = [
    H('Periode', C.navyMid),
    H('Vol. Masuk (Ton)', C.navyMid),
    H('Vol. Keluar (Ton)', C.navyMid),
    H('Selisih Net (Ton)', C.navyMid),
    H('Harga Jual (Rp/kg)', C.navyMid),
    H('Harga Beli (Rp/kg)', C.navyMid),
    H('Marjin (Rp/kg)', C.navyMid),
  ];

  const rows = (historicalTrends || []).map((t, ri) => {
    const bg = ri % 2 === 0 ? C.white : C.gray50;
    const selisih = (t.volMasuk || 0) - (t.volKeluar || 0);
    const marjinRp = (t.hargaJual || 0) - (t.hargaBeli || 0);
    return [
      D(t.label || '', { bg, bold: true }),
      numCell(t.volMasuk || 0, '#,##0.00', { bg }),
      numCell(t.volKeluar || 0, '#,##0.00', { bg }),
      surplusCell(selisih),
      numCell(t.hargaJual || 0, '"Rp "#,##0', { bg }),
      numCell(t.hargaBeli || 0, '"Rp "#,##0', { bg }),
      numCell(marjinRp, '"Rp "#,##0', { bg, fg: marjinRp >= 0 ? C.green : C.red }),
    ];
  });

  const aoa = [titleRow, headers, ...rows];
  const ws = aoaToSheet(aoa);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
  ws['!cols'] = colWidths([14, 18, 18, 18, 20, 20, 18]);
  ws['!rows'] = [{ hpt: 22 }, { hpt: 18 }];
  XLSXStyle.utils.book_append_sheet(wb, ws, '6. Tren Historis');
}

// ─── 7. Detail Responden ─────────────────────────────────────────────────────
function buildRespondentSheet(wb, { respondents, isRespondentUnlocked }) {
  const label = isRespondentUnlocked ? 'DATA TERBUKA — AUTHORIZED' : 'DATA TERSANDI — AKSES TERBATAS';
  const titleRow = [H(`DAFTAR RESPONDEN — ${label}`, isRespondentUnlocked ? C.navyMid : C.gray700, C.white, 11)];
  const headers = [H('No.', C.navyMid), H('ID Responden', C.navyMid), H('Nama Responden / Usaha', C.navyMid), H('Tipe Responden', C.navyMid), H('Kabupaten/Kota', C.navyMid)];
  const rows = (respondents || []).map((r, ri) => {
    const bg = ri % 2 === 0 ? C.white : C.gray50;
    return [
      numCell(ri + 1, '0', { bg }),
      D(isRespondentUnlocked ? r.id_responden : '••••••••', { bg }),
      D(isRespondentUnlocked ? r.nama_responden : `Responden #${ri + 1}`, { bg }),
      D(r.tipe_responden, { bg }),
      D(r.kabupaten, { bg }),
    ];
  });

  const aoa = [titleRow, headers, ...rows];
  const ws = aoaToSheet(aoa);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  ws['!cols'] = colWidths([6, 18, 36, 20, 22]);
  ws['!rows'] = [{ hpt: 22 }, { hpt: 18 }];
  XLSXStyle.utils.book_append_sheet(wb, ws, '7. Detail Responden');
}

// ════════════════════════════════════════════════════════════════════════════
// ═══════ MAIN PUBLIC EXPORT ══════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════

export async function exportInsightfulExcel({
  periodeLabel,
  komoditas,
  metrics,
  matrixNeraca,
  butterflyData,
  tab2GroupedMatrix,
  tab3PriceMatrix,
  tab3MarginRanking,
  historicalTrends,
  respondents,
  top5Origins,
  top5Destinations,
  isRespondentUnlocked,
  REF_WILAYAH,
  fileName = 'Laporan_TIRTA_Insightful.xlsx',
}) {
  const wb = XLSXStyle.utils.book_new();

  // Derive top surplus/defisit
  const sorted = (butterflyData || [])
    .map(b => ({ komoditas: (b.komoditas || '').replace(/ \((Ton|Liter)\)/g, ''), selisih: (b.volMasuk || 0) - (b.volKeluar || 0) }))
    .sort((a, x) => x.selisih - a.selisih);
  const topSurplus = sorted.filter(s => s.selisih >= 0).slice(0, 3);
  const topDefisit = sorted.filter(s => s.selisih < 0).slice(-3).reverse();

  buildCoverSheet(wb, { periodeLabel, komoditas, metrics, topOrigins: top5Origins, topDests: top5Destinations, topSurplus, topDefisit });
  buildNeracaSheet(wb, { matrixNeraca, REF_WILAYAH });
  buildButterflySheet(wb, { butterflyData });
  buildArusMatrixSheet(wb, { tab2GroupedMatrix, REF_WILAYAH });
  buildHargaSheet(wb, { tab3PriceMatrix, tab3MarginRanking, REF_WILAYAH });
  buildTrenSheet(wb, { historicalTrends });
  buildRespondentSheet(wb, { respondents, isRespondentUnlocked });

  await triggerDownload(wb, fileName);
}

// ─── Legacy simple export (kept for compatibility) ───────────────────────────
export function exportToExcel(data, fileName = 'export_data.xlsx', sheetName = 'Data') {
  if (!data || data.length === 0) return;
  const wb = XLSXStyle.utils.book_new();
  const ws = XLSXStyle.utils.json_to_sheet(data);
  XLSXStyle.utils.book_append_sheet(wb, ws, sheetName);
  const wbout = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  saveAs(new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
}

export function exportMultiSheetExcel(sheetsMap, fileName = 'Laporan.xlsx') {
  if (!sheetsMap || sheetsMap.length === 0) return;
  const wb = XLSXStyle.utils.book_new();
  sheetsMap.forEach(({ sheetName, data }) => {
    if (!data || data.length === 0) return;
    const ws = XLSXStyle.utils.json_to_sheet(data);
    XLSXStyle.utils.book_append_sheet(wb, ws, (sheetName || 'Data').substring(0, 31));
  });
  const wbout = XLSXStyle.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  saveAs(new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
}

export function exportChartToPNG(containerId, fileName = 'chart.png') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return;
  try {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const scale = 2;
      canvas.width = (svg.clientWidth || 600) * scale;
      canvas.height = (svg.clientHeight || 350) * scale;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = fileName;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  } catch (err) {
    console.error('Error exporting chart to PNG', err);
  }
}
