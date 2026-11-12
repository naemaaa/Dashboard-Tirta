import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { parseEwsWorkbook, parseAlpsEwsWorkbook } from '../src/services/ewsDataParser.js';

async function compileEws() {
  const outDir = path.resolve('public/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Compile Link 1: Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx -> public/data/ewsAlpsDatabase.json
  const alpsPath = path.resolve('scratch/Dashboard ALPS EWS DIY PIHPS AB29092026.xlsx');
  if (fs.existsSync(alpsPath)) {
    console.log('[Compile EWS] Membaca workbook Link 1 (ALPS 2019-2026):', alpsPath);
    const bufAlps = fs.readFileSync(alpsPath);
    const wbAlps = XLSX.read(bufAlps, { type: 'buffer' });
    const parsedAlps = parseAlpsEwsWorkbook(wbAlps);
    const outAlpsPath = path.join(outDir, 'ewsAlpsDatabase.json');
    fs.writeFileSync(outAlpsPath, JSON.stringify(parsedAlps, null, 2), 'utf-8');
    console.log('[Compile EWS] Berhasil menulis Link 1:', outAlpsPath, {
      periodeData: parsedAlps.meta?.periodeData,
      totalMonths: parsedAlps.meta?.totalMonths,
      heatmapRows: parsedAlps.heatmap?.length,
      defaultKomoditas: parsedAlps.defaultKomoditas
    });
  } else {
    console.warn('[Compile EWS] Workbook Link 1 belum ada di:', alpsPath);
  }

  // 2. Compile Link 2: Dashboard Hubungan Harga dan Arus Perdagangan.xlsx -> public/data/ewsDatabase.json
  const hubunganPath = path.resolve('scratch/Dashboard Hubungan Harga dan Arus Perdagangan.xlsx');
  if (fs.existsSync(hubunganPath)) {
    console.log('[Compile EWS] Membaca workbook Link 2 (Hubungan Harga & Arus):', hubunganPath);
    const buffer = fs.readFileSync(hubunganPath);
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const parsed = parseEwsWorkbook(wb);
    const outPath = path.join(outDir, 'ewsDatabase.json');
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf-8');
    console.log('[Compile EWS] Berhasil menulis Link 2:', outPath, {
      lastPeriod: parsed.meta?.lastPeriod,
      weeks: parsed.meta?.totalWeeks,
      analisisKomoditas: parsed.analisis?.length,
      mingguanRows: parsed.mingguan?.length,
      pihpsHierarchyRows: parsed.pihpsHierarchy?.length,
      heatmapSubVarian: parsed.heatmap?.length
    });
  } else {
    console.warn('[Compile EWS] Workbook Link 2 belum ada di:', hubunganPath);
  }
}

compileEws().catch(err => {
  console.error('[Compile EWS] Gagal:', err);
  process.exitCode = 1;
});
