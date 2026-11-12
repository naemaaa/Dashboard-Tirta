import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import XLSX from 'xlsx';
import { compileWorkbook } from '../src/services/masterCompiler.js';

export { compileWorkbook };

/**
 * Kompilasi Master Database.xlsx → public/data/masterDatabase.json
 *
 * AUDIT FIX (31 Okt 2026):
 *  - Tidak ada lagi fallback diam-diam ke "Beras Medium I" / wilayah pertama bila nama tidak cocok.
 *    Baris yang tidak bisa dipetakan DIBUANG dan dilaporkan di akhir proses.
 *  - Normalisasi nama komoditas (Cabe→Cabai, huruf besar/kecil, spasi) & kab/kota (Kulonprogo, Gunung Kidul, dst).
 *  - Referensi komoditas/wilayah dibaca dari src/data/seedData.js (satu sumber kebenaran, 20 komoditas).
 *  - luar_diy / keluar_diy ditentukan secara geografis (DIY / luar DIY / tidak dikenal), bukan sekadar
 *    pencarian kata. Kolom keluar_diy di Excel dipakai hanya bila nama tempat tidak bisa dipastikan.
 *  - Daerah asal/tujuan kosong tidak lagi diisi 'Bantul'/'Sleman' (data karangan) → baris dibuang.
 *  - Konversi satuan: ton=1, kuintal=0,1, kg=0,001; satuan tak dikenal (mis. ekor/drigen) dibuang & dilaporkan.
 *  - Periode yang tidak cocok dengan REF_Kalender dibuang (bukan dilempar ke minggu terakhir).
 */

async function compile() {
  const excelPath = path.resolve('scratch/Master Database.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('File not found:', excelPath);
    process.exitCode = 1;
    return;
  }

  console.log('Reading Excel:', excelPath);
  const wb = XLSX.read(fs.readFileSync(excelPath), { type: 'buffer' });

  const seed = await import(pathToFileURL(path.resolve('src/data/seedData.js')).href + `?t=${Date.now()}`);
  const existingMaster = fs.existsSync('public/data/masterDatabase.json')
    ? JSON.parse(fs.readFileSync('public/data/masterDatabase.json', 'utf8'))
    : {};

  const { dataset: finalDataset, report, REF_KALENDER, counts } = compileWorkbook(wb, {
    REF_KOMODITAS: seed.REF_KOMODITAS,
    REF_WILAYAH: seed.REF_WILAYAH,
    REF_SATUAN: existingMaster.REF_SATUAN || seed.REF_SATUAN,
    REF_KLASTER_RESPONDEN: existingMaster.REF_KLASTER_RESPONDEN || seed.REF_KLASTER_RESPONDEN,
    respondents: existingMaster.respondents || [],
  });
  const { REF_KOMODITAS, laporan_ringkasan, arus_masuk, arus_keluar } = finalDataset;

  const targetJsonPath = path.resolve('public/data/masterDatabase.json');
  console.log('Writing updated dataset to:', targetJsonPath);
  fs.writeFileSync(targetJsonPath, JSON.stringify(finalDataset, null, 2));

  // Sinkronkan REF_KALENDER di src/data/seedData.js
  const seedDataPath = path.resolve('src/data/seedData.js');
  let seedContent = fs.readFileSync(seedDataPath, 'utf8');
  const kalenderCode = `export const REF_KALENDER = [\n` +
    REF_KALENDER.map(k => `  { id_periode: '${k.id_periode}', label_periode: '${k.label_periode}', label_singkat: '${k.label_singkat}', tgl_mulai: '${k.tgl_mulai}', nama_bulan: '${k.nama_bulan}', minggu_ke: ${k.minggu_ke} },`).join('\n') +
    `\n];`;
  seedContent = seedContent.replace(/export const REF_KALENDER = \[[\s\S]*?\];/m, kalenderCode);
  fs.writeFileSync(seedDataPath, seedContent);
  console.log(`Updated src/data/seedData.js REF_KALENDER (${REF_KALENDER.length} minggu)`);

  console.log('\nCompilation SUCCESS!');
  console.log(`- Komoditas: ${REF_KOMODITAS.length}`);
  console.log(`- Laporan Ringkasan: ${laporan_ringkasan.length} rows (dari ${counts.rawLR} baris Excel)`);
  console.log(`- Arus Masuk: ${arus_masuk.length} rows (dari ${counts.rawIn})`);
  console.log(`- Arus Keluar: ${arus_keluar.length} rows (dari ${counts.rawOut})`);
  const uniquePids = [...new Set(laporan_ringkasan.map(r => r.id_periode))];
  console.log(`- Periods present in data: ${uniquePids.join(', ')}`);

  console.log('\n=== LAPORAN BARIS DIBUANG / DIASUMSIKAN ===');
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  console.log('Komoditas tak dikenal :', sum(report.skipped.komoditas), JSON.stringify(report.skipped.komoditas));
  console.log('Kab/kota tak dikenal  :', sum(report.skipped.kab), JSON.stringify(report.skipped.kab));
  console.log('Periode tak cocok     :', report.skipped.periode);
  console.log('Satuan tak bisa dikonversi:', sum(report.skipped.satuan), JSON.stringify(report.skipped.satuan));
  console.log('Daerah asal kosong    :', report.skipped.asalKosong, '| tujuan kosong:', report.skipped.tujuanKosong);
  console.log('Satuan kosong diasumsikan kg:', report.assumedKg);
  const unk = Object.entries(report.unknownPlaces).sort((a, b) => b[1] - a[1]);
  console.log(`Nama tempat tidak dapat dipastikan DIY/luar (${unk.length} nama; asal→luar DIY, tujuan→ikut flag Excel):`);
  console.log('  ' + unk.slice(0, 40).map(([k, v]) => `${k}:${v}`).join(' | '));
}

// Dijalankan langsung (npm run sync) → tulis file; di-import (API) → hanya pakai compileWorkbook
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  compile().catch(err => { console.error(err); process.exitCode = 1; });
}
