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
  { id_komoditas: 'KOM_01', nama_komoditas: 'Beras Medium I', nama_singkat: 'Beras Medium I', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 13500 },
  { id_komoditas: 'KOM_02', nama_komoditas: 'Beras Medium II', nama_singkat: 'Beras Medium II', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 13000 },
  { id_komoditas: 'KOM_03', nama_komoditas: 'Beras Super I', nama_singkat: 'Beras Super I', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 15500 },
  { id_komoditas: 'KOM_04', nama_komoditas: 'Beras Super II', nama_singkat: 'Beras Super II', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 15000 },
  { id_komoditas: 'KOM_05', nama_komoditas: 'Beras Bawah I', nama_singkat: 'Beras Bawah I', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 12200 },
  { id_komoditas: 'KOM_06', nama_komoditas: 'Beras Bawah II', nama_singkat: 'Beras Bawah II', kelompok: 'Beras & Padi-padian', satuan_dasar: 'Ton', target_harga: 11800 },
  { id_komoditas: 'KOM_07', nama_komoditas: 'Bawang Merah', nama_singkat: 'Bawang Merah', kelompok: 'Hortikultura & Sayuran', satuan_dasar: 'Ton', target_harga: 28000 },
  { id_komoditas: 'KOM_08', nama_komoditas: 'Bawang Putih', nama_singkat: 'Bawang Putih', kelompok: 'Hortikultura & Sayuran', satuan_dasar: 'Ton', target_harga: 35000 },
  { id_komoditas: 'KOM_09', nama_komoditas: 'Cabai Merah Keriting', nama_singkat: 'Cabai Merah Keriting', kelompok: 'Hortikultura & Sayuran', satuan_dasar: 'Ton', target_harga: 32000 },
  { id_komoditas: 'KOM_10', nama_komoditas: 'Cabai Rawit Merah', nama_singkat: 'Cabai Rawit Merah', kelompok: 'Hortikultura & Sayuran', satuan_dasar: 'Ton', target_harga: 42000 },
  { id_komoditas: 'KOM_11', nama_komoditas: 'Daging Ayam Ras', nama_singkat: 'Daging Ayam Ras', kelompok: 'Peternakan & Daging', satuan_dasar: 'Ton', target_harga: 35000 },
  { id_komoditas: 'KOM_12', nama_komoditas: 'Telur Ayam Ras', nama_singkat: 'Telur Ayam Ras', kelompok: 'Peternakan & Daging', satuan_dasar: 'Ton', target_harga: 27500 },
  { id_komoditas: 'KOM_13', nama_komoditas: 'Daging Sapi', nama_singkat: 'Daging Sapi', kelompok: 'Peternakan & Daging', satuan_dasar: 'Ton', target_harga: 130000 },
  // Minyak goreng: satuan_dasar = 'Liter' karena komoditas cair — tidak dikonversi ke Ton
  { id_komoditas: 'KOM_14', nama_komoditas: 'Minyak Goreng Curah', nama_singkat: 'Minyak Goreng Curah', kelompok: 'Minyak & Olahan', satuan_dasar: 'Liter', target_harga: 15800 },
  { id_komoditas: 'KOM_15', nama_komoditas: 'Minyak Goreng Kemasan', nama_singkat: 'Minyak Goreng Kemasan', kelompok: 'Minyak & Olahan', satuan_dasar: 'Liter', target_harga: 17500 },
  { id_komoditas: 'KOM_16', nama_komoditas: 'Gula Pasir', nama_singkat: 'Gula Pasir', kelompok: 'Bahan Pokok Lain', satuan_dasar: 'Ton', target_harga: 17200 },
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
    { id: '8c1e4429-231a-4d7a-a551-789f2a014901', nama: 'Kelompok Tani Sleman Mandiri', kab: 'Kab. Sleman', tipe: 'produsen', lat: -7.6800, lng: 110.3700, alamat: 'Sentra Produksi Pangan Pakem, Sleman', kapasitas_gudang: '95 Ton' },
    { id: '3d9f2b18-9944-42f1-bc82-990e1f7a8b32', nama: 'Sentra Pangan Mergangsan', kab: 'Kota Yogyakarta', tipe: 'produsen', lat: -7.8180, lng: 110.3720, alamat: 'Mergangsan, Kota Yogyakarta', kapasitas_gudang: '45 Ton' },
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
  // Commodity baseline volume & price profiles calibrated to exact Power BI benchmark dataset
  // AUDIT FIX (21 Sep 2026):
  // - extDep Bawang Merah dikoreksi dari 97% ke 75% sesuai data BPS DIY
  //   (DIY masih punya sentra produksi Bantul & Kulon Progo, produksi lokal ~20-30%)
  const commodityProfile = {
    'KOM_01': { baseIn: 48,  baseOut: 34,  priceBeli: 13553, priceJual: 14393, marginPct: 4.0, extDep: 95.8, reExp: 29.4 }, // Beras Medium I
    'KOM_02': { baseIn: 38,  baseOut: 33,  priceBeli: 13150, priceJual: 13780, marginPct: 4.8, extDep: 94.0, reExp: 20.0 }, // Beras Medium II
    'KOM_03': { baseIn: 20,  baseOut: 20,  priceBeli: 15300, priceJual: 16100, marginPct: 5.2, extDep: 92.0, reExp: 15.0 }, // Beras Super I
    'KOM_04': { baseIn: 18,  baseOut: 18,  priceBeli: 14900, priceJual: 15650, marginPct: 5.0, extDep: 90.0, reExp: 14.0 }, // Beras Super II
    'KOM_05': { baseIn: 15,  baseOut: 14,  priceBeli: 12100, priceJual: 12600, marginPct: 4.1, extDep: 88.0, reExp: 10.0 }, // Beras Bawah I
    'KOM_06': { baseIn: 12,  baseOut: 11,  priceBeli: 11700, priceJual: 12150, marginPct: 3.8, extDep: 85.0, reExp: 8.0 },  // Beras Bawah II
    'KOM_07': { baseIn: 144, baseOut: 128, priceBeli: 26800, priceJual: 29200, marginPct: 8.9, extDep: 75.0, reExp: 25.0 }, // Bawang Merah (KOREKSI: 75% luar DIY, 25% lokal Bantul+Kulon Progo)
    'KOM_08': { baseIn: 122, baseOut: 102, priceBeli: 33800, priceJual: 36500, marginPct: 8.0, extDep: 98.0, reExp: 22.0 }, // Bawang Putih (hampir 100% impor, DIY tidak punya sentra produksi)
    'KOM_09': { baseIn: 24,  baseOut: 22,  priceBeli: 30000, priceJual: 32500, marginPct: 8.3, extDep: 85.0, reExp: 12.0 }, // Cabai Merah Keriting
    'KOM_10': { baseIn: 20,  baseOut: 19,  priceBeli: 39500, priceJual: 43000, marginPct: 8.8, extDep: 90.0, reExp: 10.0 }, // Cabai Rawit Merah
    'KOM_11': { baseIn: 45,  baseOut: 42,  priceBeli: 31500, priceJual: 33800, marginPct: 7.3, extDep: 45.0, reExp: 15.0 }, // Daging Ayam Ras
    'KOM_12': { baseIn: 32,  baseOut: 30,  priceBeli: 26000, priceJual: 27800, marginPct: 6.9, extDep: 68.0, reExp: 12.0 }, // Telur Ayam Ras
    'KOM_13': { baseIn: 15,  baseOut: 14,  priceBeli: 124000, priceJual: 131000, marginPct: 5.6, extDep: 58.0, reExp: 8.0 }, // Daging Sapi
    'KOM_14': { baseIn: 17,  baseOut: 15,  priceBeli: 15200, priceJual: 16150, marginPct: 6.2, extDep: 92.0, reExp: 18.0 }, // Minyak Goreng Curah
    'KOM_15': { baseIn: 18,  baseOut: 16,  priceBeli: 17000, priceJual: 18200, marginPct: 7.0, extDep: 90.0, reExp: 16.0 }, // Minyak Goreng Kemasan
    'KOM_16': { baseIn: 17,  baseOut: 16,  priceBeli: 16800, priceJual: 17800, marginPct: 5.9, extDep: 88.0, reExp: 14.0 }, // Gula Pasir
  };

  // Generate data per period and commodity and regency
  REF_KALENDER.forEach((kal, pIdx) => {
    // Controlled subtle trend progression
    const weekFactor = 1 + (pIdx) * 0.015;

    REF_KOMODITAS.forEach((kom) => {
      const prof = commodityProfile[kom.id_komoditas] || { baseIn: 40, baseOut: 35, priceBeli: 20000, priceJual: 21200, marginPct: 6, extDep: 85, reExp: 20 };

      REF_WILAYAH.forEach((wil, wIdx) => {
        // Regency baseline allocation matching DIY administrative distribution
        const regScale = wil.id_kab_kota === '3404' ? 0.38 : // Sleman (highest volume: 18 Ton)
                         wil.id_kab_kota === '3402' ? 0.25 : // Bantul (12 Ton)
                         wil.id_kab_kota === '3471' ? 0.19 : // Kota Yogya (9 Ton)
                         wil.id_kab_kota === '3401' ? 0.12 : // Kulon Progo (6 Ton)
                         0.06;                               // Gunungkidul (3 Ton)

        // Jitter for natural weekly fluctuation (W23 baseline pinned to exact benchmark)
        const jitter = pIdx === 0 ? 0 : Math.sin(pIdx * 0.8 + wIdx * 1.1) * 0.04;
        const inVol = Number((prof.baseIn * regScale * weekFactor * (1 + jitter)).toFixed(2));
        const outVol = Number((prof.baseOut * regScale * weekFactor * (1 - jitter * 0.5)).toFixed(2));

        // Satuan dasar komoditas ini (Ton untuk solid, Liter untuk cair seperti minyak goreng)
        const satuanDasar = kom.satuan_dasar || 'Ton';
        const volFieldIn  = satuanDasar === 'Liter' ? 'volume_liter' : 'volume_ton';
        const volFieldOut = satuanDasar === 'Liter' ? 'volume_liter' : 'volume_ton';

        // Split baseline volume: Pedagang Besar (70%) and Produsen (30%)
        const inVolPB = Number((inVol * 0.70).toFixed(2));
        const outVolPB = Number((outVol * 0.70).toFixed(2));
        const inVolProd = Number((inVol - inVolPB).toFixed(2));
        const outVolProd = Number((outVol - outVolPB).toFixed(2));

        // Conservation law: In = Out + Susut + Stok Akhir
        const susutRatePB = 0.015;
        const susutPB = Number(Math.max(0, Math.min(inVolPB * susutRatePB, inVolPB - outVolPB)).toFixed(2));
        const stokAkhirPB = Number(Math.max(0, inVolPB - outVolPB - susutPB).toFixed(2));

        const susutRateProd = 0.02;
        const susutProd = Number(Math.max(0, Math.min(inVolProd * susutRateProd, inVolProd - outVolProd)).toFixed(2));
        const stokAkhirProd = Number(Math.max(0, inVolProd - outVolProd - susutProd).toFixed(2));

        // Price calculations with realistic PB vs Produsen differentiation
        const priceDisp = pIdx === 0 ? 0 : (wIdx - 2) * 60 + Math.sin(pIdx + wIdx) * 80;
        const hargaBeliTarget = Math.round((prof.priceBeli || 13553) * (1 + pIdx * 0.004) + priceDisp);
        const hargaJualTarget = prof.priceJual ? Math.round(prof.priceJual * (1 + pIdx * 0.004) + priceDisp) : Math.round(hargaBeliTarget * (1 + prof.marginPct / 100));

        // Calibrated so aggregate VWAP matches benchmark
        const hargaBeliPB = Math.round(hargaBeliTarget * 1.01);
        const hargaBeliProd = Math.round((hargaBeliTarget - 0.70 * hargaBeliPB) / 0.30);
        const hargaJualPB = Math.round(hargaJualTarget * 1.01);
        const hargaJualProd = Math.round((hargaJualTarget - 0.70 * hargaJualPB) / 0.30);

        // Associated respondents for this regency
        const respList = respondents.filter(r => r.kab === wil.nama_kab_kota);
        const primaryPB = respList.find(r => r.tipe === 'pedagang_besar') || respondents.find(r => r.tipe === 'pedagang_besar');
        const primaryProd = respList.find(r => r.tipe === 'produsen') || respondents.find(r => r.tipe === 'produsen');

        const idLaporanPB = `LAP-${reportCounter++}`;
        const idLaporanProd = `LAP-${reportCounter++}`;

        // Masuk row (Pedagang Besar) — PK unik: id_laporan + '_in'
        laporan_ringkasan.push({
          id_laporan: `${idLaporanPB}_in`,
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
          volume_ton: satuanDasar === 'Ton' ? inVolPB : 0,
          volume_liter: satuanDasar === 'Liter' ? inVolPB : 0,
          [volFieldIn]: inVolPB,
          stok_akhir_ton: satuanDasar === 'Ton' ? stokAkhirPB : 0,
          stok_akhir_liter: satuanDasar === 'Liter' ? stokAkhirPB : 0,
          susut_ton: satuanDasar === 'Ton' ? susutPB : 0,
          susut_liter: satuanDasar === 'Liter' ? susutPB : 0,
          harga_beli: hargaBeliPB,
          harga_jual: hargaJualPB,
          is_deleted: false,
          satuan: satuanDasar,
          satuan_dasar: satuanDasar,
        });

        // Keluar row (Pedagang Besar) — PK unik: id_laporan + '_out'
        // AUDIT FIX (BUG-1): Baris _out tidak membawa stok_akhir/susut.
        // Stok & susut hanya relevan di baris _in (masuk). Menaruh stok/susut di baris _out
        // adalah inkonsistensi semantik — meski filter jenis_aliran='vol_masuk_ton' mencegah
        // double-count, data pada baris _out tidak seharusnya memuat nilai ini.
        laporan_ringkasan.push({
          id_laporan: `${idLaporanPB}_out`,
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
          volume_ton: satuanDasar === 'Ton' ? outVolPB : 0,
          volume_liter: satuanDasar === 'Liter' ? outVolPB : 0,
          [volFieldOut]: outVolPB,
          stok_akhir_ton: 0,    // _out rows tidak membawa stok akhir
          stok_akhir_liter: 0,  // _out rows tidak membawa stok akhir
          susut_ton: 0,         // _out rows tidak membawa susut
          susut_liter: 0,       // _out rows tidak membawa susut
          harga_beli: hargaBeliPB,
          harga_jual: hargaJualPB,
          is_deleted: false,
          satuan: satuanDasar,
          satuan_dasar: satuanDasar,
        });

        // Arus Masuk origin breakdown (PB)
        const extShare = (prof.extDep || 95.8) / 100;
        const volExt1 = Number((inVolPB * extShare * 0.95).toFixed(2));
        const volExt2 = Number((inVolPB * extShare * 0.05).toFixed(2));
        const volLokal = Number((inVolPB * (1 - extShare)).toFixed(2));

        arus_masuk.push({
          id_arus_masuk: `IN-${flowInCounter++}`,
          id_laporan: idLaporanPB,
          id_periode: kal.id_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          daerah_asal: 'Luar DIY Lainnya',
          volume_ton: satuanDasar === 'Ton' ? volExt1 : 0,
          volume_liter: satuanDasar === 'Liter' ? volExt1 : 0,
          satuan_dasar: satuanDasar, // AUDIT FIX: satuan_dasar ditambahkan agar calculatePctLuarDiy() unit-aware
          jenis_pemasok: 'Distributor Luar DIY',
          luar_diy: true
        });

        if (volExt2 > 0) {
          arus_masuk.push({
            id_arus_masuk: `IN-${flowInCounter++}`,
            id_laporan: idLaporanPB,
            id_periode: kal.id_periode,
            id_komoditas: kom.id_komoditas,
            komoditas: kom.nama_komoditas,
            id_kab_kota: wil.id_kab_kota,
            kab_kota: wil.nama_kab_kota,
            daerah_asal: 'Solo/Sukoharjo (Jateng)',
            volume_ton: satuanDasar === 'Ton' ? volExt2 : 0,
            volume_liter: satuanDasar === 'Liter' ? volExt2 : 0,
            satuan_dasar: satuanDasar,
            jenis_pemasok: 'Grosir Jawa Tengah',
            luar_diy: true
          });
        }

        if (volLokal > 0) {
          arus_masuk.push({
            id_arus_masuk: `IN-${flowInCounter++}`,
            id_laporan: idLaporanPB,
            id_periode: kal.id_periode,
            id_komoditas: kom.id_komoditas,
            komoditas: kom.nama_komoditas,
            id_kab_kota: wil.id_kab_kota,
            kab_kota: wil.nama_kab_kota,
            daerah_asal: 'Lokal DIY (Internal)',
            volume_ton: satuanDasar === 'Ton' ? volLokal : 0,
            volume_liter: satuanDasar === 'Liter' ? volLokal : 0,
            satuan_dasar: satuanDasar,
            jenis_pemasok: 'Produsen Lokal DIY',
            luar_diy: false
          });
        }

        // Arus Keluar destination breakdown (PB)
        const reExportShare = (prof.reExp || 29.4) / 100;
        const volLokalJual = Number((outVolPB * (1 - reExportShare)).toFixed(2));
        const volReExport = Number((outVolPB * reExportShare).toFixed(2));

        const destOptions = [
          'Kab. Sleman',
          'Lainnya (DIY)',
          'Kab. Bantul',
          'Kota Yogyakarta',
          'Kab. Kulon Progo'
        ];

        arus_keluar.push({
          id_arus_keluar: `OUT-${flowOutCounter++}`,
          id_laporan: idLaporanPB,
          id_periode: kal.id_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          daerah_tujuan: destOptions[wIdx % destOptions.length],
          volume_ton: volLokalJual,
          jenis_pembeli: 'Pasar Konsumen DIY',
          keluar_diy: false
        });

        if (volReExport > 0) {
          arus_keluar.push({
            id_arus_keluar: `OUT-${flowOutCounter++}`,
            id_laporan: idLaporanPB,
            id_periode: kal.id_periode,
            id_komoditas: kom.id_komoditas,
            komoditas: kom.nama_komoditas,
            id_kab_kota: wil.id_kab_kota,
            kab_kota: wil.nama_kab_kota,
            daerah_tujuan: 'Purworejo (Jateng)',
            volume_ton: volReExport,
            jenis_pembeli: 'Distributor Antar-Provinsi',
            keluar_diy: true
          });
        }

        // ==========================================
        // 2. DATA PRODUSEN (Petani/Penggilingan/Sentra Produksi)
        // ==========================================
        // Masuk row (Produsen)
        laporan_ringkasan.push({
          id_laporan: `${idLaporanProd}_in`,
          id_periode: kal.id_periode,
          periode_mulai: kal.tgl_mulai,
          label_periode: kal.label_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          tipe_responden: 'produsen',
          id_responden: primaryProd.id,
          nama_responden: primaryProd.nama,
          jenis_aliran: 'vol_masuk_ton',
          volume_ton: satuanDasar === 'Ton' ? inVolProd : 0,
          volume_liter: satuanDasar === 'Liter' ? inVolProd : 0,
          [volFieldIn]: inVolProd,
          stok_akhir_ton: satuanDasar === 'Ton' ? stokAkhirProd : 0,
          stok_akhir_liter: satuanDasar === 'Liter' ? stokAkhirProd : 0,
          susut_ton: satuanDasar === 'Ton' ? susutProd : 0,
          susut_liter: satuanDasar === 'Liter' ? susutProd : 0,
          harga_beli: hargaBeliProd,
          harga_jual: hargaJualProd,
          is_deleted: false,
          satuan: satuanDasar,
          satuan_dasar: satuanDasar,
        });

        // Keluar row (Produsen)
        // AUDIT FIX (BUG-1): Baris _out tidak membawa stok_akhir/susut (sama seperti PB di atas).
        laporan_ringkasan.push({
          id_laporan: `${idLaporanProd}_out`,
          id_periode: kal.id_periode,
          periode_mulai: kal.tgl_mulai,
          label_periode: kal.label_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          tipe_responden: 'produsen',
          id_responden: primaryProd.id,
          nama_responden: primaryProd.nama,
          jenis_aliran: 'vol_keluar_ton',
          volume_ton: satuanDasar === 'Ton' ? outVolProd : 0,
          volume_liter: satuanDasar === 'Liter' ? outVolProd : 0,
          [volFieldOut]: outVolProd,
          stok_akhir_ton: 0,    // _out rows tidak membawa stok akhir
          stok_akhir_liter: 0,  // _out rows tidak membawa stok akhir
          susut_ton: 0,         // _out rows tidak membawa susut
          susut_liter: 0,       // _out rows tidak membawa susut
          harga_beli: hargaBeliProd,
          harga_jual: hargaJualProd,
          is_deleted: false,
          satuan: satuanDasar,
          satuan_dasar: satuanDasar,
        });

        // Arus Masuk (Produsen) - Mayoritas dari panen/budidaya Lokal DIY
        arus_masuk.push({
          id_arus_masuk: `IN-${flowInCounter++}`,
          id_laporan: idLaporanProd,
          id_periode: kal.id_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          daerah_asal: 'Lokal DIY (Internal)',
          volume_ton: satuanDasar === 'Ton' ? Number((inVolProd * 0.90).toFixed(2)) : 0,
          volume_liter: satuanDasar === 'Liter' ? Number((inVolProd * 0.90).toFixed(2)) : 0,
          satuan_dasar: satuanDasar,
          jenis_pemasok: 'Sentra Pertanian / Budidaya Lokal',
          luar_diy: false
        });

        arus_masuk.push({
          id_arus_masuk: `IN-${flowInCounter++}`,
          id_laporan: idLaporanProd,
          id_periode: kal.id_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          daerah_asal: 'Solo/Sukoharjo (Jateng)',
          volume_ton: satuanDasar === 'Ton' ? Number((inVolProd * 0.10).toFixed(2)) : 0,
          volume_liter: satuanDasar === 'Liter' ? Number((inVolProd * 0.10).toFixed(2)) : 0,
          satuan_dasar: satuanDasar,
          jenis_pemasok: 'Pemasok Sarana Produksi Luar DIY',
          luar_diy: true
        });

        // Arus Keluar (Produsen) - Dijual ke pedagang grosir / pasar
        arus_keluar.push({
          id_arus_keluar: `OUT-${flowOutCounter++}`,
          id_laporan: idLaporanProd,
          id_periode: kal.id_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          daerah_tujuan: destOptions[wIdx % destOptions.length],
          volume_ton: Number((outVolProd * 0.85).toFixed(2)),
          jenis_pembeli: 'Pedagang Grosir & Pengepul DIY',
          keluar_diy: false
        });

        arus_keluar.push({
          id_arus_keluar: `OUT-${flowOutCounter++}`,
          id_laporan: idLaporanProd,
          id_periode: kal.id_periode,
          id_komoditas: kom.id_komoditas,
          komoditas: kom.nama_komoditas,
          id_kab_kota: wil.id_kab_kota,
          kab_kota: wil.nama_kab_kota,
          daerah_tujuan: 'Purworejo (Jateng)',
          volume_ton: Number((outVolProd * 0.15).toFixed(2)),
          jenis_pembeli: 'Pedagang Luar DIY',
          keluar_diy: true
        });
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
