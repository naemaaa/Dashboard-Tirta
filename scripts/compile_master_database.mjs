import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import XLSX from 'xlsx';

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

function excelDateToJS(serial) {
  if (typeof serial === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(serial)) return serial;
    const num = Number(serial);
    if (!isNaN(num) && num > 30000 && num < 60000) {
      serial = num;
    } else {
      return serial;
    }
  }
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000).toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalisasi & klasifikasi
// ─────────────────────────────────────────────────────────────────────────────
const squash = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const letters = (s) => squash(s).replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

function normKomoditasKey(raw) {
  return squash(raw).replace(/\bcabe\b/g, 'cabai');
}

function normKabKey(raw) {
  return letters(raw).replace(/\b(kab|kabupaten|kota)\b/g, '').replace(/\s+/g, '');
}

// Tempat di DIY (toleran typo: "gunungidul", "gunugkidul", ...)
const DIY_TOKENS = /sleman|bantul|gunung ?k?i?dul|gunug ?kidul|gunungidul|kulon ?progo|yogya|jogja|d ?i ?y\b|wonosari|wates|giwangan|beringharjo|argosari|segoroyoso|pleret|sewon|kretek|playen|semanu|ponjong|panggang|nglipar|karangrejek|jetis/;
// Tempat di luar DIY (menang atas token DIY: "Prambanan, Kab. Klaten" → luar)
const LUAR_TOKENS = /klaten|sukoharjo|magelang|muntilan|munthilan|temanggung|wonosobo|jawa tengah|jateng|jawa timur|jatim|jawa barat|jabar|ntb|sumatera|lampung|padang|jakarta|bekasi|surabaya|sidoarjo|siduarjo|solo|surakarta|semarang|boyolali|sragen|purworejo|wonogiri|ngawi|ponorogo|madiun|kediri|bima|garut|china|delanggu|cepogo|ketep|ndeles|trucuk|weru|karanganyar|banyuwangi|demak|brebes|tegal|cilacap|kebumen|banjarnegara/;

/**
 * 'diy' | 'luar' | 'unknown'
 * @param {string} raw
 * @param {Set<string>} kecamatan  nama kecamatan DIY (huruf kecil) dari REF_Kecamatan
 */
function classifyPlace(raw, kecamatan) {
  const s = letters(raw);
  if (!s) return 'unknown';
  if (LUAR_TOKENS.test(s)) return 'luar';
  if (DIY_TOKENS.test(s)) return 'diy';
  if (s.split(' ').some(w => w.length >= 5 && kecamatan.has(w)) || kecamatan.has(s)) return 'diy';
  return 'unknown';
}

function unitMultiplier(rawSatuan, isLiquid) {
  const s = squash(rawSatuan).replace(/[^a-z0-9. ]/g, '');
  if (isLiquid) return 1;                    // minyak goreng disimpan dalam liter
  if (s === '' || s === 'undefined') return { m: 0.001, assumed: true }; // kosong → diasumsikan kg
  if (/^\d/.test(s)) return null;            // isi kolom satuan salah (angka harga) → tidak bisa dipakai
  if (s.includes('ton')) return { m: 1 };
  if (s.includes('kuintal') || s === 'kw' || s === 'ku') return { m: 0.1 };
  if (s === 'kg' || s === 'kilogram' || s === 'kgs') return { m: 0.001 };
  return null;                               // ekor / drigen / lainnya → tidak bisa dikonversi ke ton
}

async function compile() {
  const excelPath = path.resolve('scratch/Master Database.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('File not found:', excelPath);
    process.exitCode = 1;
    return;
  }

  const report = {
    skipped: { komoditas: {}, kab: {}, periode: 0, satuan: {}, asalKosong: 0, tujuanKosong: 0 },
    assumedKg: 0,
    unknownPlaces: {}
  };
  const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };

  console.log('Reading Excel:', excelPath);
  const buffer = fs.readFileSync(excelPath);
  const wb = XLSX.read(buffer, { type: 'buffer' });

  // 1. REF_Kalender
  const rawKal = XLSX.utils.sheet_to_json(wb.Sheets['REF_Kalender'] || []);
  const REF_KALENDER = rawKal.map(k => {
    const tglMulai = excelDateToJS(k.tgl_mulai);
    const tglAkhir = excelDateToJS(k.tgl_akhir);
    const pid = k.id_periode.startsWith('PER_') ? k.id_periode : 'PER_' + k.id_periode.replace('-', '_');
    const dMulai = tglMulai.slice(8, 10);
    const dAkhir = tglAkhir.slice(8, 10);
    const blnSingkat = (k.nama_bulan || 'Bulan').slice(0, 3);
    const weekNum = parseInt(k.id_periode.split('-W')[1] || k.id_periode.split('_W')[1] || '0', 10);
    return {
      id_periode: pid,
      label_periode: `${k.id_periode} (${dMulai}-${dAkhir} ${blnSingkat})`,
      label_singkat: k.id_periode,
      tgl_mulai: tglMulai,
      tgl_akhir: tglAkhir,
      nama_bulan: k.nama_bulan,
      minggu_ke: weekNum,
      raw_mulai: k.tgl_mulai,
      raw_akhir: k.tgl_akhir
    };
  });

  console.log(`Loaded ${REF_KALENDER.length} calendar periods (W${REF_KALENDER[0]?.minggu_ke} - W${REF_KALENDER[REF_KALENDER.length - 1]?.minggu_ke})`);

  // Periode dari tanggal. Tidak ada fallback ke minggu terakhir: tidak cocok → null.
  function findPeriodeForDate(serialOrDate) {
    if (serialOrDate === undefined || serialOrDate === null || serialOrDate === '') return null;
    if (typeof serialOrDate === 'number' || (!isNaN(Number(serialOrDate)) && Number(serialOrDate) > 30000)) {
      const num = Number(serialOrDate);
      const match = REF_KALENDER.find(k => k.raw_mulai <= num && num <= k.raw_akhir);
      if (match) return match.id_periode;
    }
    const iso = excelDateToJS(serialOrDate);
    const matchIso = REF_KALENDER.find(k => k.tgl_mulai <= iso && iso <= (k.tgl_akhir || k.tgl_mulai));
    return matchIso ? matchIso.id_periode : null;
  }

  // 2. Referensi: komoditas & wilayah dari seedData.js (single source of truth)
  const seed = await import(pathToFileURL(path.resolve('src/data/seedData.js')).href + `?t=${Date.now()}`);
  const REF_KOMODITAS = seed.REF_KOMODITAS;
  const REF_WILAYAH = seed.REF_WILAYAH;
  const existingMaster = fs.existsSync('public/data/masterDatabase.json')
    ? JSON.parse(fs.readFileSync('public/data/masterDatabase.json', 'utf8'))
    : {};
  const REF_SATUAN = existingMaster.REF_SATUAN || seed.REF_SATUAN;
  const REF_KLASTER_RESPONDEN = existingMaster.REF_KLASTER_RESPONDEN || seed.REF_KLASTER_RESPONDEN;

  const komoditasMap = new Map();
  REF_KOMODITAS.forEach(k => {
    komoditasMap.set(normKomoditasKey(k.nama_komoditas), k);
    if (k.nama_singkat) komoditasMap.set(normKomoditasKey(k.nama_singkat), k);
  });
  const wilayahMap = new Map();
  REF_WILAYAH.forEach(w => {
    wilayahMap.set(normKabKey(w.nama_kab_kota), w);
    wilayahMap.set(normKabKey(w.label), w);
  });
  const lookupKomoditas = (raw) => komoditasMap.get(normKomoditasKey(raw)) || null;
  const lookupWilayah = (row) => wilayahMap.get(normKabKey(row.kab_kota_responden || row.kab_kota || '')) || null;

  // Kecamatan DIY (untuk deteksi nama tempat tanpa nama kabupaten)
  const kecamatan = new Set(
    XLSX.utils.sheet_to_json(wb.Sheets['REF_Kecamatan'] || [])
      .map(r => letters(r.nama_kecamatan))
      .filter(n => n.length >= 5)
  );

  // 3. laporan_ringkasan
  const rawLR = XLSX.utils.sheet_to_json(wb.Sheets['laporan_ringkasan'] || []);
  console.log(`Processing ${rawLR.length} rows from laporan_ringkasan...`);

  const laporan_ringkasan = [];
  rawLR.forEach((row, idx) => {
    const pid = row.id_periode || findPeriodeForDate(row.periode_mulai || row.tanggal_periode);
    if (!pid || !REF_KALENDER.some(k => k.id_periode === pid)) { report.skipped.periode++; return; }
    const kal = REF_KALENDER.find(k => k.id_periode === pid);

    const komRef = lookupKomoditas(row.komoditas);
    if (!komRef) { bump(report.skipped.komoditas, String(row.komoditas || '(kosong)').trim()); return; }
    const wilRef = lookupWilayah(row);
    if (!wilRef) { bump(report.skipped.kab, String(row.kab_kota_responden || row.kab_kota || '(kosong)').trim()); return; }
    const isLiquid = komRef.satuan_dasar === 'Liter';

    // Sheet laporan_ringkasan tidak punya kolom satuan → diasumsikan kg (ton = kg × 0,001)
    const multiplier = isLiquid ? 1 : 0.001;

    const volMasuk = Number(row.vol_masuk) || 0;
    const volKeluar = Number(row.vol_keluar) || 0;
    const stokAkhir = Number(row.stok_akhir) || 0;
    const hargaBeli = Number(row.harga_beli) || 0;
    const hargaJual = Number(row.harga_jual) || 0;

    const normMasuk = volMasuk * multiplier;
    const normKeluar = volKeluar * multiplier;
    const normStok = stokAkhir * multiplier;

    const tipeResponden = (row.tipe_responden || 'PB').toLowerCase().includes('produsen') ? 'produsen' : 'pedagang_besar';

    const base = {
      id_periode: pid,
      periode_mulai: kal.tgl_mulai,
      label_periode: kal.label_periode,
      id_komoditas: komRef.id_komoditas,
      komoditas: komRef.nama_komoditas,
      id_kab_kota: wilRef.id_kab_kota,
      kab_kota: wilRef.nama_kab_kota,
      tipe_responden: tipeResponden,
      id_responden: row.id_responden || `R_${idx + 1}`,
      nama_responden: row.nama_responden || row.id_responden || `Responden ${row.id_responden}`,
      stok_akhir_ton: isLiquid ? 0 : Number(normStok.toFixed(2)),
      stok_akhir_liter: isLiquid ? Number(normStok.toFixed(2)) : 0,
      susut_ton: 0,
      susut_liter: 0,
      harga_beli: hargaBeli,
      harga_jual: hargaJual,
      is_deleted: false,
      satuan: komRef.satuan_dasar,
      satuan_dasar: komRef.satuan_dasar
    };

    laporan_ringkasan.push({
      id_laporan: `LAP-${idx + 1}_in`,
      ...base,
      jenis_aliran: 'vol_masuk_ton', // kunci aliran tetap _ton; satuan asli ada di satuan_dasar
      volume_ton: isLiquid ? 0 : Number(normMasuk.toFixed(2)),
      volume_liter: isLiquid ? Number(normMasuk.toFixed(2)) : 0
    });
    laporan_ringkasan.push({
      id_laporan: `LAP-${idx + 1}_out`,
      ...base,
      jenis_aliran: 'vol_keluar_ton',
      volume_ton: isLiquid ? 0 : Number(normKeluar.toFixed(2)),
      volume_liter: isLiquid ? Number(normKeluar.toFixed(2)) : 0
    });
  });

  console.log(`Generated ${laporan_ringkasan.length} normalized laporan_ringkasan rows`);

  // Helper volume + satuan untuk arus
  function arusVolume(row, isLiquid) {
    const vol = Number(row.volume) || 0;
    const u = unitMultiplier(row.satuan, isLiquid);
    if (u === null) { bump(report.skipped.satuan, JSON.stringify(row.satuan ?? '(kosong)')); return null; }
    if (typeof u === 'number') return vol * u;
    if (u.assumed) report.assumedKg++;
    return vol * u.m;
  }

  // 4. arus_masuk
  const rawIn = XLSX.utils.sheet_to_json(wb.Sheets['arus_masuk'] || []);
  console.log(`Processing ${rawIn.length} rows from arus_masuk...`);
  const arus_masuk = [];
  rawIn.forEach((row, idx) => {
    const pid = row.id_periode || findPeriodeForDate(row.periode_mulai);
    if (!pid || !REF_KALENDER.some(k => k.id_periode === pid)) { report.skipped.periode++; return; }
    const komRef = lookupKomoditas(row.komoditas);
    if (!komRef) { bump(report.skipped.komoditas, String(row.komoditas || '(kosong)').trim()); return; }
    const wilRef = lookupWilayah(row);
    if (!wilRef) { bump(report.skipped.kab, String(row.kab_kota_responden || row.kab_kota || '(kosong)').trim()); return; }
    const isLiquid = komRef.satuan_dasar === 'Liter';

    const asal = String(row.daerah_asal ?? '').trim();
    if (!asal) { report.skipped.asalKosong++; return; }

    const normVol = arusVolume(row, isLiquid);
    if (normVol === null) return;

    const cls = classifyPlace(asal, kecamatan);
    if (cls === 'unknown') bump(report.unknownPlaces, `masuk: ${asal}`);
    const isLuarDiy = cls !== 'diy'; // tak dikenal diperlakukan sebagai luar DIY (dilaporkan di bawah)

    arus_masuk.push({
      id_arus_masuk: `IN-${idx + 1}`,
      id_laporan: `LAP-${idx + 1}`,
      id_periode: pid,
      id_komoditas: komRef.id_komoditas,
      komoditas: komRef.nama_komoditas,
      id_kab_kota: wilRef.id_kab_kota,
      kab_kota: wilRef.nama_kab_kota,
      daerah_asal: asal,
      volume_ton: isLiquid ? 0 : Number(normVol.toFixed(2)),
      volume_liter: isLiquid ? Number(normVol.toFixed(2)) : 0,
      satuan_dasar: komRef.satuan_dasar,
      jenis_pemasok: String(row.jenis_pemasok || '').trim() || (isLuarDiy ? 'Pemasok Luar DIY' : 'Produsen Lokal DIY'),
      luar_diy: isLuarDiy
    });
  });

  // 5. arus_keluar
  const rawOut = XLSX.utils.sheet_to_json(wb.Sheets['arus_keluar'] || []);
  console.log(`Processing ${rawOut.length} rows from arus_keluar...`);
  const arus_keluar = [];
  rawOut.forEach((row, idx) => {
    const pid = row.id_periode || findPeriodeForDate(row.periode_mulai);
    if (!pid || !REF_KALENDER.some(k => k.id_periode === pid)) { report.skipped.periode++; return; }
    const komRef = lookupKomoditas(row.komoditas);
    if (!komRef) { bump(report.skipped.komoditas, String(row.komoditas || '(kosong)').trim()); return; }
    const wilRef = lookupWilayah(row);
    if (!wilRef) { bump(report.skipped.kab, String(row.kab_kota_responden || row.kab_kota || '(kosong)').trim()); return; }
    const isLiquid = komRef.satuan_dasar === 'Liter';

    const tujuan = String(row.daerah_tujuan ?? '').trim();
    if (!tujuan) { report.skipped.tujuanKosong++; return; }

    const normVol = arusVolume(row, isLiquid);
    if (normVol === null) return;

    // Geografi menang atas flag Excel bila nama tempat jelas; flag Excel dipakai bila tak bisa dipastikan.
    const cls = classifyPlace(tujuan, kecamatan);
    const flag = squash(row.keluar_diy);
    let isKeluarDiy;
    if (cls === 'luar') isKeluarDiy = true;
    else if (cls === 'diy') isKeluarDiy = false;
    else {
      bump(report.unknownPlaces, `keluar: ${tujuan}`);
      isKeluarDiy = flag.startsWith('y') ? true : flag.startsWith('t') ? false : true;
    }

    arus_keluar.push({
      id_arus_keluar: `OUT-${idx + 1}`,
      id_laporan: `LAP-${idx + 1}`,
      id_periode: pid,
      id_komoditas: komRef.id_komoditas,
      komoditas: komRef.nama_komoditas,
      id_kab_kota: wilRef.id_kab_kota,
      kab_kota: wilRef.nama_kab_kota,
      daerah_tujuan: tujuan,
      volume_ton: isLiquid ? 0 : Number(normVol.toFixed(2)),
      volume_liter: isLiquid ? Number(normVol.toFixed(2)) : 0,
      jenis_pembeli: String(row.jenis_pembeli || '').trim() || (isKeluarDiy ? 'Pedagang Luar DIY' : 'Konsumen / Retailer DIY'),
      keluar_diy: isKeluarDiy
    });
  });

  // 6. Respondents (tidak diubah)
  const respondents = existingMaster.respondents || [];

  const finalDataset = {
    REF_WILAYAH,
    REF_KOMODITAS,
    REF_KALENDER: REF_KALENDER.map(k => ({
      id_periode: k.id_periode,
      label_periode: k.label_periode,
      label_singkat: k.label_singkat,
      tgl_mulai: k.tgl_mulai,
      nama_bulan: k.nama_bulan,
      minggu_ke: k.minggu_ke
    })),
    REF_SATUAN,
    REF_KLASTER_RESPONDEN,
    laporan_ringkasan,
    arus_masuk,
    arus_keluar,
    respondents,
    quality_issues: []
  };

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
  console.log(`- Laporan Ringkasan: ${laporan_ringkasan.length} rows (dari ${rawLR.length} baris Excel)`);
  console.log(`- Arus Masuk: ${arus_masuk.length} rows (dari ${rawIn.length})`);
  console.log(`- Arus Keluar: ${arus_keluar.length} rows (dari ${rawOut.length})`);
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

compile().catch(err => { console.error(err); process.exitCode = 1; });
