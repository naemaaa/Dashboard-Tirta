// Master Reference & Seed Data for Dashboard Komoditas DIY v1.0
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

export const REF_WILAYAH = [
  { id_kab_kota: '3471', nama_kab_kota: 'Kota Yogyakarta', label: 'Kota Yogyakarta', latitude: -7.797068, longitude: 110.370529 },
  { id_kab_kota: '3404', nama_kab_kota: 'Kab. Sleman', label: 'Sleman', latitude: -7.716389, longitude: 110.355556 },
  { id_kab_kota: '3402', nama_kab_kota: 'Kab. Bantul', label: 'Bantul', latitude: -7.893889, longitude: 110.334167 },
  { id_kab_kota: '3401', nama_kab_kota: 'Kab. Kulon Progo', label: 'Kulon Progo', latitude: -7.828889, longitude: 110.158056 },
  { id_kab_kota: '3403', nama_kab_kota: 'Kab. Gunungkidul', label: 'Gunungkidul', latitude: -7.962222, longitude: 110.603333 },
];

// Complete Geospatial Reference Coordinates (DIY + Sentra Luar DIY)
export const GEO_NODES = {
  // Wilayah Internal DIY
  'Kota Yogyakarta': { id: '3471', name: 'Kota Yogyakarta', lat: -7.797068, lng: 110.370529, type: 'diy_hub', label: 'Kota Yogyakarta' },
  'Kab. Sleman': { id: '3404', name: 'Kab. Sleman', lat: -7.716389, lng: 110.355556, type: 'diy_regency', label: 'Sleman' },
  'Kab. Bantul': { id: '3402', name: 'Kab. Bantul', lat: -7.893889, lng: 110.334167, type: 'diy_regency', label: 'Bantul' },
  'Kab. Kulon Progo': { id: '3401', name: 'Kab. Kulon Progo', lat: -7.828889, lng: 110.158056, type: 'diy_regency', label: 'Kulon Progo' },
  'Kab. Gunungkidul': { id: '3403', name: 'Kab. Gunungkidul', lat: -7.962222, lng: 110.603333, type: 'diy_regency', label: 'Gunungkidul' },
  'Lainnya (DIY)': { id: 'DIY_OTHER', name: 'Lainnya (DIY)', lat: -7.840000, lng: 110.420000, type: 'diy_internal', label: 'Lainnya DIY' },
  'Lokal DIY (Internal)': { id: 'DIY_LOCAL', name: 'Lokal DIY (Internal)', lat: -7.760000, lng: 110.260000, type: 'diy_internal', label: 'Lokal DIY' },

  // Sentra Produksi & Pemasok Luar DIY
  'Kab. Brebes (Jateng)': { id: 'EXT_BREBES', name: 'Kab. Brebes (Jateng)', lat: -6.9700, lng: 109.0400, type: 'external_sentra', sentra: 'Bawang Merah', label: 'Brebes' },
  'Kab. Blitar (Jatim)': { id: 'EXT_BLITAR', name: 'Kab. Blitar (Jatim)', lat: -8.0983, lng: 112.1681, type: 'external_sentra', sentra: 'Telur & Unggas', label: 'Blitar' },
  'Klaten (Jateng)': { id: 'EXT_KLATEN', name: 'Klaten (Jateng)', lat: -7.7058, lng: 110.6067, type: 'external_sentra', sentra: 'Beras & Pangan', label: 'Klaten' },
  'Solo/Sukoharjo (Jateng)': { id: 'EXT_SOLO', name: 'Solo/Sukoharjo (Jateng)', lat: -7.5755, lng: 110.8243, type: 'external_sentra', sentra: 'Grosir & Pedagang Besar', label: 'Solo' },
  'Magelang (Jateng)': { id: 'EXT_MAGELANG', name: 'Magelang (Jateng)', lat: -7.4705, lng: 110.2178, type: 'external_sentra', sentra: 'Hortikultura & Cabai', label: 'Magelang' },
  'Purworejo (Jateng)': { id: 'EXT_PURWOREJO', name: 'Purworejo (Jateng)', lat: -7.7126, lng: 110.0089, type: 'external_sentra', sentra: 'Beras Sentra Kulon', label: 'Purworejo' },
  'Luar DIY Lainnya': { id: 'EXT_OTHER', name: 'Luar DIY Lainnya', lat: -7.1500, lng: 110.4000, type: 'external_hub', sentra: 'Distributor Nasional', label: 'Hub Nasional' }
};

export const REF_KOMODITAS = [
  { id_komoditas: 'KOM_01', nama_komoditas: 'Beras Medium I (Ton)', nama_singkat: 'Beras Medium I', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 13500 },
  { id_komoditas: 'KOM_02', nama_komoditas: 'Beras Medium II (Ton)', nama_singkat: 'Beras Medium II', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 13000 },
  { id_komoditas: 'KOM_03', nama_komoditas: 'Beras Super I (Ton)', nama_singkat: 'Beras Super I', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 15500 },
  { id_komoditas: 'KOM_04', nama_komoditas: 'Beras Super II (Ton)', nama_singkat: 'Beras Super II', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 15000 },
  { id_komoditas: 'KOM_05', nama_komoditas: 'Beras Bawah I (Ton)', nama_singkat: 'Beras Bawah I', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 12200 },
  { id_komoditas: 'KOM_06', nama_komoditas: 'Beras Bawah II (Ton)', nama_singkat: 'Beras Bawah II', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 11800 },
  { id_komoditas: 'KOM_07', nama_komoditas: 'Bawang Merah (Ton)', nama_singkat: 'Bawang Merah', kelompok: 'Hortikultura & Sayuran', satuan_dasar: 'Ton', target_harga: 28000 },
  { id_komoditas: 'KOM_08', nama_komoditas: 'Bawang Putih (Ton)', nama_singkat: 'Bawang Putih', kelompok: 'Hortikultura & Sayuran', satuan_dasar: 'Ton', target_harga: 35000 },
  { id_komoditas: 'KOM_09', nama_komoditas: 'Cabai Merah Keriting (Ton)', nama_singkat: 'Cabai Merah Keriting', kelompok: 'Hortikultura & Sayuran', satuan_dasar: 'Ton', target_harga: 32000 },
  { id_komoditas: 'KOM_10', nama_komoditas: 'Cabai Rawit Merah (Ton)', nama_singkat: 'Cabai Rawit Merah', kelompok: 'Hortikultura & Sayuran', satuan_dasar: 'Ton', target_harga: 42000 },
  { id_komoditas: 'KOM_11', nama_komoditas: 'Daging Ayam Ras (Ton)', nama_singkat: 'Daging Ayam Ras', kelompok: 'Peternakan & Daging', satuan_dasar: 'Ton', target_harga: 35000 },
  { id_komoditas: 'KOM_12', nama_komoditas: 'Telur Ayam Ras (Ton)', nama_singkat: 'Telur Ayam Ras', kelompok: 'Peternakan & Daging', satuan_dasar: 'Ton', target_harga: 27500 },
  { id_komoditas: 'KOM_13', nama_komoditas: 'Daging Sapi (Ton)', nama_singkat: 'Daging Sapi', kelompok: 'Peternakan & Daging', satuan_dasar: 'Ton', target_harga: 130000 },
  { id_komoditas: 'KOM_14', nama_komoditas: 'Minyak Goreng Curah (Ton)', nama_singkat: 'Minyak Goreng Curah', kelompok: 'Minyak & Olahan', satuan_dasar: 'Ton', target_harga: 15800 },
  { id_komoditas: 'KOM_15', nama_komoditas: 'Minyak Goreng Kemasan (Ton)', nama_singkat: 'Minyak Goreng Kemasan', kelompok: 'Minyak & Olahan', satuan_dasar: 'Ton', target_harga: 17500 },
  { id_komoditas: 'KOM_16', nama_komoditas: 'Gula Pasir (Ton)', nama_singkat: 'Gula Pasir', kelompok: 'Bahan Pokok Lain', satuan_dasar: 'Ton', target_harga: 17200 },
];

export const REF_KALENDER = [
  { id_periode: 'PER_2026_W23', label_periode: '2026-W23 (02-08 Jun)', label_singkat: '2026-W23', tgl_mulai: '2026-06-02', nama_bulan: 'Juni', minggu_ke: 23 },
  { id_periode: 'PER_2026_W24', label_periode: '2026-W24 (09-15 Jun)', label_singkat: '2026-W24', tgl_mulai: '2026-06-09', nama_bulan: 'Juni', minggu_ke: 24 },
  { id_periode: 'PER_2026_W25', label_periode: '2026-W25 (16-22 Jun)', label_singkat: '2026-W25', tgl_mulai: '2026-06-16', nama_bulan: 'Juni', minggu_ke: 25 },
  { id_periode: 'PER_2026_W26', label_periode: '2026-W26 (23-29 Jun)', label_singkat: '2026-W26', tgl_mulai: '2026-06-23', nama_bulan: 'Juni', minggu_ke: 26 },
  { id_periode: 'PER_2026_W27', label_periode: '2026-W27 (30 Jun-06 Jul)', label_singkat: '2026-W27', tgl_mulai: '2026-06-30', nama_bulan: 'Juli', minggu_ke: 27 },
  { id_periode: 'PER_2026_W28', label_periode: '2026-W28 (07-13 Jul)', label_singkat: '2026-W28', tgl_mulai: '2026-07-07', nama_bulan: 'Juli', minggu_ke: 28 },
  { id_periode: 'PER_2026_W29', label_periode: '2026-W29 (14-20 Jul)', label_singkat: '2026-W29', tgl_mulai: '2026-07-14', nama_bulan: 'Juli', minggu_ke: 29 },
  { id_periode: 'PER_2026_W30', label_periode: '2026-W30 (21-27 Jul)', label_singkat: '2026-W30', tgl_mulai: '2026-07-21', nama_bulan: 'Juli', minggu_ke: 30 },
  { id_periode: 'PER_2026_W31', label_periode: '2026-W31 (28 Jul-03 Agu)', label_singkat: '2026-W31', tgl_mulai: '2026-07-28', nama_bulan: 'Agustus', minggu_ke: 31 },
  { id_periode: 'PER_2026_W32', label_periode: '2026-W32 (04-10 Agu)', label_singkat: '2026-W32', tgl_mulai: '2026-08-04', nama_bulan: 'Agustus', minggu_ke: 32 },
  { id_periode: 'PER_2026_W33', label_periode: '2026-W33 (11-17 Agu)', label_singkat: '2026-W33', tgl_mulai: '2026-08-11', nama_bulan: 'Agustus', minggu_ke: 33 },
  { id_periode: 'PER_2026_W34', label_periode: '2026-W34 (18-24 Agu)', label_singkat: '2026-W34', tgl_mulai: '2026-08-18', nama_bulan: 'Agustus', minggu_ke: 34 },
  { id_periode: 'PER_2026_W35', label_periode: '2026-W35 (25-31 Agu)', label_singkat: '2026-W35', tgl_mulai: '2026-08-25', nama_bulan: 'Agustus', minggu_ke: 35 },
  { id_periode: 'PER_2026_W36', label_periode: '2026-W36 (01-07 Sep)', label_singkat: '2026-W36', tgl_mulai: '2026-09-01', nama_bulan: 'September', minggu_ke: 36 },
  { id_periode: 'PER_2026_W37', label_periode: '2026-W37 (08-14 Sep)', label_singkat: '2026-W37', tgl_mulai: '2026-09-08', nama_bulan: 'September', minggu_ke: 37 },
  { id_periode: 'PER_2026_W38', label_periode: '2026-W38 (15-21 Sep)', label_singkat: '2026-W38', tgl_mulai: '2026-09-15', nama_bulan: 'September', minggu_ke: 38 },
];

export const REF_SATUAN = [
  { id_satuan: 'SAT_01', nama_satuan: 'Ton', faktor_konversi_ton: 1.0 },
  { id_satuan: 'SAT_02', nama_satuan: 'Kg', faktor_konversi_ton: 0.001 },
  { id_satuan: 'SAT_03', nama_satuan: 'Kuintal', faktor_konversi_ton: 0.1 },
  { id_satuan: 'SAT_04', nama_satuan: 'Karung 50kg', faktor_konversi_ton: 0.05 },
];

export const REF_KLASTER_RESPONDEN = [
  { id: 'semua', label: 'All' },
  { id: 'pedagang_besar', label: 'Pedagang Besar' },
  { id: 'produsen', label: 'Produsen' },
];

// Helper to generate comprehensive master dataset
export function generateMasterDataset() {
  const respondents = [
    { id: '5c95bc16-b38e-4012-9703-18ed0f7aca76', nama: 'Bolodewo Parming', kab: 'Kab. Bantul', tipe: 'pedagang_besar', lat: -7.8850, lng: 110.3400, alamat: 'Jl. Bantul Km 7, Sewon, Bantul', kapasitas_gudang: '120 Ton' },
    { id: 'f19eeab3-daac-410f-991b-d66df10b44f0', nama: 'Grosir Beras Umi', kab: 'Kota Yogyakarta', tipe: 'pedagang_besar', lat: -7.7980, lng: 110.3650, alamat: 'Pasar Beringharjo Lt. 1, Yogyakarta', kapasitas_gudang: '80 Ton' },
    { id: '14b7b964-fa32-4eee-a42c-c67bbcdcc9cb', nama: 'Larasati Pangan', kab: 'Kab. Sleman', tipe: 'pedagang_besar', lat: -7.7120, lng: 110.3600, alamat: 'Jl. Magelang Km 10, Mlati, Sleman', kapasitas_gudang: '150 Ton' },
    { id: '6e1a51a3-3aae-493a-94cc-490fcad42317', nama: 'PB Beras Gajah Mungkur', kab: 'Kab. Sleman', tipe: 'pedagang_besar', lat: -7.6950, lng: 110.3800, alamat: 'Jl. Kaliurang Km 12, Ngaglik, Sleman', kapasitas_gudang: '200 Ton' },
    { id: 'e4679dc7-f11d-4973-8255-399b6e9ecc90', nama: 'Sumber Waras 3', kab: 'Kab. Kulon Progo', tipe: 'pedagang_besar', lat: -7.8500, lng: 110.1600, alamat: 'Wates Kota, Kulon Progo', kapasitas_gudang: '90 Ton' },
    { id: '78a509c9-c006-483e-b477-9c955810a196', nama: 'Toko Menik Beras', kab: 'Kab. Gunungkidul', tipe: 'pedagang_besar', lat: -7.9600, lng: 110.6100, alamat: 'Pasar Argosari, Wonosari, Gunungkidul', kapasitas_gudang: '70 Ton' },
    { id: '1a087af6-3745-4462-a894-bc0f759de753', nama: 'Tukino Mandiri', kab: 'Kab. Bantul', tipe: 'produsen', lat: -7.9200, lng: 110.3100, alamat: 'Sentra Penggilingan Pandak, Bantul', kapasitas_gudang: '60 Ton' },
    { id: '5f1d4366-568f-4f80-bd6c-e367a9b0c164', nama: 'UD Sri Rahayu', kab: 'Kota Yogyakarta', tipe: 'pedagang_besar', lat: -7.8050, lng: 110.3800, alamat: 'Jl. Kusumanegara, Umbulharjo, Yogyakarta', kapasitas_gudang: '110 Ton' },
    { id: '543b5b22-23b8-4ad2-87e8-8997042826dd', nama: 'UD Suryanta Pangan', kab: 'Kab. Sleman', tipe: 'pedagang_besar', lat: -7.7350, lng: 110.3400, alamat: 'Pasar Gamping, Ambarketawang, Sleman', kapasitas_gudang: '180 Ton' },
    { id: 'ac973e76-f05e-47fd-9b28-0da53f4bfd69', nama: 'Wulan Wijayatri', kab: 'Kab. Kulon Progo', tipe: 'produsen', lat: -7.8100, lng: 110.1800, alamat: 'Sentra Pertanian Nanggulan, Kulon Progo', kapasitas_gudang: '50 Ton' },
    { id: 'b497a490-ac5f-4192-8e67-1a37961e19f1', nama: 'Gapoktan Sedyo Rukun', kab: 'Kab. Gunungkidul', tipe: 'produsen', lat: -7.9800, lng: 110.5800, alamat: 'Semanu, Gunungkidul', kapasitas_gudang: '75 Ton' },
  ];

  const daerahAsalList = [
    { nama: 'Luar DIY Lainnya', luarDiy: true, jenis: 'Distributor Luar DIY' },
    { nama: 'Klaten (Jateng)', luarDiy: true, jenis: 'Penggilingan / Pemasok' },
    { nama: 'Solo/Sukoharjo (Jateng)', luarDiy: true, jenis: 'Grosir Jawa Tengah' },
    { nama: 'Purworejo (Jateng)', luarDiy: true, jenis: 'Sentra Pangan' },
    { nama: 'Magelang (Jateng)', luarDiy: true, jenis: 'Produsen Hortikultura' },
    { nama: 'Kab. Brebes (Jateng)', luarDiy: true, jenis: 'Sentra Bawang Merah' },
    { nama: 'Kab. Blitar (Jatim)', luarDiy: true, jenis: 'Sentra Telur & Unggas' },
    { nama: 'Lokal DIY (Internal)', luarDiy: false, jenis: 'Pemasok Lokal DIY' },
  ];

  const daerahTujuanList = [
    { nama: 'Kab. Sleman', luarDiy: false, jenis: 'Pedagang Pasar & Horeka' },
    { nama: 'Lainnya (DIY)', luarDiy: false, jenis: 'Konsumen & Industri' },
    { nama: 'Kab. Bantul', luarDiy: false, jenis: 'Pedagang Eceran' },
    { nama: 'Kota Yogyakarta', luarDiy: false, jenis: 'Pasar Beringharjo & Giwangan' },
    { nama: 'Purworejo (Jateng)', luarDiy: true, jenis: 'Re-ekspor Luar DIY' },
    { nama: 'Kab. Gunungkidul', luarDiy: false, jenis: 'Pedagang Pasar Lokal' },
    { nama: 'Kab. Kulon Progo', luarDiy: false, jenis: 'Distribusi Lokal' },
    { nama: 'Klaten (Jateng)', luarDiy: true, jenis: 'Re-ekspor Luar DIY' },
  ];

  const laporan_ringkasan = [];
  const arus_masuk = [];
  const arus_keluar = [];
  const raw_respondents = [];
  const data_quality_issues = [];

  let reportCounter = 1000;
  let flowInCounter = 5000;
  let flowOutCounter = 8000;

  // Commodity baseline volume & price profiles matching exact power BI numbers
  const commodityProfile = {
    'KOM_01': { baseIn: 234, baseOut: 203, priceBeli: 13600, marginPct: 4.2, extDep: 96 }, // Beras Medium I
    'KOM_02': { baseIn: 384, baseOut: 268, priceBeli: 13200, marginPct: 4.5, extDep: 94 }, // Beras Medium II
    'KOM_03': { baseIn: 161, baseOut: 123, priceBeli: 15200, marginPct: 5.1, extDep: 92 }, // Beras Super I
    'KOM_04': { baseIn: 145, baseOut: 118, priceBeli: 14800, marginPct: 4.9, extDep: 90 }, // Beras Super II
    'KOM_05': { baseIn: 98,  baseOut: 72,  priceBeli: 12000, marginPct: 4.0, extDep: 88 }, // Beras Bawah I
    'KOM_06': { baseIn: 82,  baseOut: 58,  priceBeli: 11600, marginPct: 3.8, extDep: 85 }, // Beras Bawah II
    'KOM_07': { baseIn: 1197, baseOut: 940, priceBeli: 26500, marginPct: 8.5, extDep: 97 }, // Bawang Merah
    'KOM_08': { baseIn: 628, baseOut: 545, priceBeli: 33500, marginPct: 7.8, extDep: 98 }, // Bawang Putih
    'KOM_09': { baseIn: 124, baseOut: 138, priceBeli: 30000, marginPct: 8.2, extDep: 85 }, // Cabai Merah Keriting
    'KOM_10': { baseIn: 105, baseOut: 122, priceBeli: 39500, marginPct: 8.9, extDep: 90 }, // Cabai Rawit Merah
    'KOM_11': { baseIn: 215, baseOut: 198, priceBeli: 31500, marginPct: 7.5, extDep: 45 }, // Daging Ayam Ras
    'KOM_12': { baseIn: 152, baseOut: 134, priceBeli: 26000, marginPct: 6.8, extDep: 68 }, // Telur Ayam Ras
    'KOM_13': { baseIn: 72,  baseOut: 65,  priceBeli: 124000, marginPct: 5.5, extDep: 58 }, // Daging Sapi
    'KOM_14': { baseIn: 185, baseOut: 172, priceBeli: 15200, marginPct: 6.2, extDep: 92 }, // Minyak Goreng Curah
    'KOM_15': { baseIn: 160, baseOut: 148, priceBeli: 17000, marginPct: 7.0, extDep: 90 }, // Minyak Goreng Kemasan
    'KOM_16': { baseIn: 140, baseOut: 132, priceBeli: 16800, marginPct: 5.8, extDep: 88 }, // Gula Pasir
  };

  // Generate data per period and commodity and regency
  REF_KALENDER.forEach((kal, pIdx) => {
    const weekFactor = 1 + (pIdx - 10) * 0.025; // slight trend curve

    REF_KOMODITAS.forEach((kom) => {
      const prof = commodityProfile[kom.id_komoditas] || { baseIn: 100, baseOut: 90, priceBeli: 20000, marginPct: 6, extDep: 75 };

      REF_WILAYAH.forEach((wil, wIdx) => {
        // Regency weights
        const regScale = wil.id_kab_kota === '3404' ? 0.38 : // Sleman (highest)
                         wil.id_kab_kota === '3402' ? 0.26 : // Bantul
                         wil.id_kab_kota === '3471' ? 0.18 : // Kota Yogya
                         wil.id_kab_kota === '3401' ? 0.11 : 0.07; // Kulon Progo / Gunungkidul

        // Dynamic slight jitter
        const jitter = Math.sin(pIdx * 1.3 + wIdx * 0.9) * 0.06;
        const inVol = Number((prof.baseIn * regScale * weekFactor * (1 + jitter)).toFixed(2));
        const outVol = Number((prof.baseOut * regScale * weekFactor * (1 - jitter * 0.4)).toFixed(2));
        const stokAkhir = Number((inVol * 0.3 + (wIdx * 1.5)).toFixed(2));

        // Price calculations
        const priceDisp = (wIdx - 2) * 90 + Math.sin(pIdx + wIdx) * 120;
        const hargaBeli = Math.round(prof.priceBeli * (1 + (pIdx - 10) * 0.008) + priceDisp);
        const hargaJual = Math.round(hargaBeli * (1 + prof.marginPct / 100));

        // Associated respondents for this regency
        const respList = respondents.filter(r => r.kab === wil.nama_kab_kota);
        const primaryPB = respList.find(r => r.tipe === 'pedagang_besar') || respondents.find(r => r.tipe === 'pedagang_besar');
        const primaryPR = respList.find(r => r.tipe === 'produsen');

        const idLaporan = `LAP-${reportCounter++}`;

        // Masuk row (Pedagang Besar)
        laporan_ringkasan.push({
          id_laporan: idLaporan,
          id_periode: kal.id_periode,
          periode_mulai: kal.tgl_mulai,
          label_periode: kal.label_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          tipe_responden: 'pedagang_besar',
          id_responden: primaryPB.id,
          nama_responden: primaryPB.nama,
          jenis_aliran: 'vol_masuk_ton',
          volume_ton: inVol,
          vol_masuk_ton: inVol,
          vol_keluar_ton: 0,
          stok_akhir_ton: stokAkhir,
          harga_beli: hargaBeli,
          harga_jual: hargaJual,
          is_deleted: false,
          satuan: 'Ton'
        });

        // Keluar row (Pedagang Besar)
        laporan_ringkasan.push({
          id_laporan: idLaporan,
          id_periode: kal.id_periode,
          periode_mulai: kal.tgl_mulai,
          label_periode: kal.label_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          tipe_responden: 'pedagang_besar',
          id_responden: primaryPB.id,
          nama_responden: primaryPB.nama,
          jenis_aliran: 'vol_keluar_ton',
          volume_ton: outVol,
          vol_masuk_ton: 0,
          vol_keluar_ton: outVol,
          stok_akhir_ton: stokAkhir,
          harga_beli: hargaBeli,
          harga_jual: hargaJual,
          is_deleted: false,
          satuan: 'Ton'
        });

        // If regency has a Producer (Produsen), also generate Producer stream
        if (primaryPR) {
          const idLaporanPR = `LAP-${reportCounter++}`;
          const prInVol = Number((inVol * 0.45).toFixed(2));
          const prOutVol = Number((outVol * 0.42).toFixed(2));

          laporan_ringkasan.push({
            id_laporan: idLaporanPR,
            id_periode: kal.id_periode,
            periode_mulai: kal.tgl_mulai,
            label_periode: kal.label_periode,
            id_komoditas: kom.id_komoditas,
            komoditas: kom.nama_komoditas,
            id_kab_kota: wil.id_kab_kota,
            kab_kota: wil.nama_kab_kota,
            tipe_responden: 'produsen',
            id_responden: primaryPR.id,
            nama_responden: primaryPR.nama,
            jenis_aliran: 'vol_masuk_ton',
            volume_ton: prInVol,
            vol_masuk_ton: prInVol,
            vol_keluar_ton: 0,
            stok_akhir_ton: Number((stokAkhir * 0.4).toFixed(2)),
            harga_beli: Math.round(hargaBeli * 0.96),
            harga_jual: hargaBeli,
            is_deleted: false,
            satuan: 'Ton'
          });

          laporan_ringkasan.push({
            id_laporan: idLaporanPR,
            id_periode: kal.id_periode,
            periode_mulai: kal.tgl_mulai,
            label_periode: kal.label_periode,
            id_komoditas: kom.id_komoditas,
            komoditas: kom.nama_komoditas,
            id_kab_kota: wil.id_kab_kota,
            kab_kota: wil.nama_kab_kota,
            tipe_responden: 'produsen',
            id_responden: primaryPR.id,
            nama_responden: primaryPR.nama,
            jenis_aliran: 'vol_keluar_ton',
            volume_ton: prOutVol,
            vol_masuk_ton: 0,
            vol_keluar_ton: prOutVol,
            stok_akhir_ton: Number((stokAkhir * 0.4).toFixed(2)),
            harga_beli: Math.round(hargaBeli * 0.96),
            harga_jual: hargaBeli,
            is_deleted: false,
            satuan: 'Ton'
          });
        }

        // Arus Masuk origin breakdown
        const extShare = prof.extDep / 100;
        const volExt1 = Number((inVol * extShare * 0.72).toFixed(2));
        const volExt2 = Number((inVol * extShare * 0.28).toFixed(2));
        const volLokal = Number((inVol * (1 - extShare)).toFixed(2));

        arus_masuk.push({
          id_arus_masuk: `IN-${flowInCounter++}`,
          id_laporan: idLaporan,
          id_periode: kal.id_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          daerah_asal: daerahAsalList[0].nama, // Luar DIY Lainnya
          volume_ton: volExt1,
          jenis_pemasok: 'Distributor Luar DIY',
          luar_diy: true
        });

        if (volExt2 > 0) {
          arus_masuk.push({
            id_arus_masuk: `IN-${flowInCounter++}`,
            id_laporan: idLaporan,
            id_periode: kal.id_periode,
            id_komoditas: kom.id_komoditas,
            komoditas: kom.nama_komoditas,
            id_kab_kota: wil.id_kab_kota,
            kab_kota: wil.nama_kab_kota,
            daerah_asal: daerahAsalList[1 + (wIdx % 3)].nama, // Klaten / Solo / Purworejo
            volume_ton: volExt2,
            jenis_pemasok: 'Pemasok Jawa Tengah',
            luar_diy: true
          });
        }

        if (volLokal > 0) {
          arus_masuk.push({
            id_arus_masuk: `IN-${flowInCounter++}`,
            id_laporan: idLaporan,
            id_periode: kal.id_periode,
            id_komoditas: kom.id_komoditas,
            komoditas: kom.nama_komoditas,
            id_kab_kota: wil.id_kab_kota,
            kab_kota: wil.nama_kab_kota,
            daerah_asal: 'Lokal DIY (Internal)',
            volume_ton: volLokal,
            jenis_pemasok: 'Produsen Lokal DIY',
            luar_diy: false
          });
        }

        // Arus Keluar destination breakdown
        const isReexport = (kom.id_komoditas === 'KOM_01' || kom.id_komoditas === 'KOM_07') && (wIdx === 1 || wIdx === 0);
        const reExportShare = isReexport ? 0.20 : 0.06;
        const volLokalJual = Number((outVol * (1 - reExportShare)).toFixed(2));
        const volReExport = Number((outVol * reExportShare).toFixed(2));

        arus_keluar.push({
          id_arus_keluar: `OUT-${flowOutCounter++}`,
          id_laporan: idLaporan,
          id_periode: kal.id_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          daerah_tujuan: daerahTujuanList[wIdx % 4].nama,
          volume_ton: volLokalJual,
          jenis_pembeli: 'Pasar Konsumen DIY',
          keluar_diy: false
        });

        if (volReExport > 0) {
          arus_keluar.push({
            id_arus_keluar: `OUT-${flowOutCounter++}`,
            id_laporan: idLaporan,
            id_periode: kal.id_periode,
            id_komoditas: kom.id_komoditas,
            komoditas: kom.nama_komoditas,
            id_kab_kota: wil.id_kab_kota,
            kab_kota: wil.nama_kab_kota,
            daerah_tujuan: daerahTujuanList[4 + (wIdx % 2)].nama, // Purworejo / Klaten
            volume_ton: volReExport,
            jenis_pembeli: 'Grosir Re-ekspor',
            keluar_diy: true
          });
        }
      });
    });
  });

  // Seed Respondent List for Tab 2
  respondents.forEach((r, idx) => {
    raw_respondents.push({
      id_responden: r.id,
      nama_responden: r.nama,
      tipe_responden: r.tipe === 'pedagang_besar' ? 'Pedagang Besar' : 'Produsen',
      kabupaten: r.kab,
      komoditas_utama: REF_KOMODITAS[idx % REF_KOMODITAS.length].nama_komoditas,
      status_laporan: idx % 8 === 0 ? 'Tertunda Review' : 'Terverifikasi Lengkap',
      volume_mingguan: (Math.random() * 40 + 20).toFixed(1) + ' Ton',
      latitude: r.lat,
      longitude: r.lng,
      alamat: r.alamat,
      kapasitas_gudang: r.kapasitas_gudang,
      terakhir_update: '19 Sep 2026 20:00'
    });
  });

  // Seed Data Quality Issues for Tab 5
  data_quality_issues.push(
    { periode: '2026-W38', nama_responden: 'Bolodewo Parming', komoditas: 'Bawang Putih', kab_kota: 'Kab. Bantul', jenis_isu: 'Anomali Satuan', detail: 'Input 50 Karung belum dikonversi', status: 'Pending Review' },
    { periode: '2026-W38', nama_responden: 'PB Beras Gajah Mungkur', komoditas: 'Beras Medium I', kab_kota: 'Kab. Sleman', jenis_isu: 'Harga Kosong', detail: 'Harga beli tercatat Rp 0 (Konsinyasi)', status: 'Telah Diverifikasi' },
    { periode: '2026-W37', nama_responden: 'Toko Menik Beras', komoditas: 'Cabai Rawit Merah', kab_kota: 'Kab. Gunungkidul', jenis_isu: 'Wilayah Non-Standar', detail: 'Nama desa tidak terpetakan di master', status: 'Telah Diperbaiki' },
    { periode: '2026-W36', nama_responden: 'UD Sri Rahayu', komoditas: 'Minyak Goreng Curah', kab_kota: 'Kota Yogyakarta', jenis_isu: 'Anomali Volume', detail: 'Lonjakan volume > 200% dibanding W35', status: 'Telah Diverifikasi' },
    { periode: '2026-W35', nama_responden: 'UD Suryanta Pangan', komoditas: 'Daging Ayam Ras', kab_kota: 'Kab. Sleman', jenis_isu: 'Periode Kosong', detail: 'ID periode kosong saat sinkronisasi web app', status: 'Telah Diperbaiki' }
  );

  return {
    REF_WILAYAH,
    REF_KOMODITAS,
    REF_KALENDER,
    REF_SATUAN,
    REF_KLASTER_RESPONDEN,
    laporan_ringkasan,
    arus_masuk,
    arus_keluar,
    respondents: raw_respondents,
    quality_issues: data_quality_issues
  };
}
