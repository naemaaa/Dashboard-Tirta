# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Dashboard Komoditas DIY v1.0
### Spesifikasi Teknis Perangkat Lunak, Struktur Folder, & Detail File Arsitektur

---

| Metadata Dokumen | Rincian |
| :--- | :--- |
| **Judul Dokumen** | Software Requirements Specification (SRS) / Spesifikasi Kebutuhan Perangkat Lunak |
| **Nama Sistem** | Dashboard Komoditas DIY (Sistem Intelijen Aliran Komoditas Pangan) |
| **Instansi** | Kantor Perwakilan Bank Indonesia DIY & PSEKUIN UPN "Veteran" Yogyakarta |
| **Versi Rilis** | v1.0 (Produksi) |
| **Tanggal Pembaruan** | September 2026 |
| **Status Dokumen** | **Lengkap & Siap Audit / Review Teknis** |

---

## 1. Pendahuluan & Lingkup Sistem

### 1.1 Deskripsi Umum
Aplikasi **Dashboard Komoditas DIY** adalah platform analitik cerdas berbasis web (*Single Page Application / SPA*) yang dirancang khusus untuk memonitor, menganalisis, dan memvisualisasikan data aliran perdagangan komoditas pangan strategis di wilayah Daerah Istimewa Yogyakarta.

### 1.2 Tujuan Dokumen SRS
Dokumen SRS ini bertujuan memberikan rincian arsitektur teknis secara menyeluruh, termasuk:
1. **Dekomposisi Struktur Direktori & Folder**.
2. **Katalog & Spesifikasi Detail File per File** (fungsi, dependensi, input/output, dan logika).
3. **Alur Data & Interkoneksi Modul** (*Data Pipeline -> State -> Hook -> Calculation Engine -> UI Component*).
4. **Logika Matematis Kalkulasi Murni** (*Pure Functions*).
5. **Standar Penamaan, Konvensi Kode, & Pengujian**.

---

## 2. Struktur Direktori Proyek (Project Folder Structure)

```
Dashboard-Tirta/
├── public/                                  # Static Assets & Icons
│   ├── favicon.svg                          # Web App Favicon (Bank Indonesia Icon)
│   └── icons.svg                            # Sprite Icon Vector
├── src/                                     # Source Code Utama Aplikasi
│   ├── assets/                              # Asset Gambar & Ilustrasi
│   │   ├── hero.png                         # Ilustrasi Banner Header
│   │   ├── react.svg                        # React Vector Asset
│   │   └── vite.svg                         # Vite Vector Asset
│   ├── calculations/                        # Pure Mathematical & DAX Calculation Modules
│   │   ├── coreCalculations.js              # Rumus Dasar DAX (Vol Masuk/Keluar, Neraca, Margin, Delta)
│   │   ├── flowMatrixCalculations.js        # Matriks Komoditas x Wilayah, Butterfly, & Rantai Pasok
│   │   ├── index.js                         # Central Export Barrier untuk Seluruh Kalkulasi
│   │   ├── priceMarginMatrixCalculations.js # Disparitas Harga, Peringkat Margin, & Scatter Plot SPI
│   │   ├── qualitySlaCalculations.js        # Metrik Integritas Data, Audit Anomali, & SLA Wilayah
│   │   └── trendAntarwaktuCalculations.js   # Deret Waktu Multi-Pekan, Delta Wilayah, & Evolusi Pasokan
│   ├── components/                          # Komponen Antarmuka Pengguna (React UI)
│   │   ├── common/                          # Komponen Reusable Global
│   │   │   └── DataModal.jsx                # Modal Upload File Excel & Sinkronisasi Eksternal
│   │   ├── executive/                       # Komponen Intelijen Eksekutif
│   │   │   └── ExecutiveIntelligenceBox.jsx # Kotak Narasi Sintesis AI (Pasokan, Eksternal, Harga)
│   │   ├── layout/                          # Struktur Layout Global
│   │   │   ├── FilterPanel.jsx              # Panel Filter Slicer Global (Legacy/Modular)
│   │   │   ├── HeaderBar.jsx                # Header Branding Bank Indonesia & PSEKUIN
│   │   │   ├── Navbar.jsx                   # Website Navbar Interaktif (Single-line, Status, Refresh)
│   │   │   └── TabNavigator.jsx             # Navigasi Tab Alternatif
│   │   └── tabs/                            # Komponen 5 Halaman / Tab Utama
│   │       ├── Tab1RingkasanUtama.jsx       # Tab 1: Ringkasan Utama & Neraca Perdagangan DIY
│   │       ├── Tab2DetailArus.jsx           # Tab 2: Detail Masuk vs Keluar & Dekomposisi Rantai Pasok
│   │       ├── Tab3HargaMarjin.jsx          # Tab 3: Transmisi Harga Jual-Beli & Marjin Tataniaga
│   │       ├── Tab4TrenAntarwaktu.jsx       # Tab 4: Tren Antarwaktu & Analisis Perubahan Periode
│   │       └── Tab5KualitasData.jsx         # Tab 5: Kualitas Data, Audit Anomali & SLA Monitoring
│   ├── data/                                # Basis Data Master & Dataset Bawaan
│   │   ├── Master Database.xlsx             # File Sumber Excel Master Database
│   │   └── seedData.js                      # Definisi Referensi (REF_*) & Generator Master Data Bawaan
│   ├── hooks/                               # Custom React Hooks
│   │   └── useCalculations.js               # Jembatan State Zustand dengan Modul Kalkulasi Murni
│   ├── services/                            # Layanan Terisolasi (AI & Excel Pipeline)
│   │   ├── aiService.js                     # Generator Sintesis Narasi Analitik AI untuk 5 Tab
│   │   └── excelService.js                  # Pipeline SheetJS, Parser Excel Buffer, & LocalStorage Cache
│   ├── store/                               # Manajemen State Terpusat (Zustand)
│   │   └── useDashboardStore.js             # Global Store State Slicers, Dataset, Tab, & Sinkronisasi
│   ├── App.css                              # Custom CSS Variables & Utilitas Tambahan
│   ├── App.jsx                              # Komponen Root Aplikasi (Penggabung Navbar, Tab, & Footer)
│   ├── index.css                            # Konfigurasi TailwindCSS v4 & Font Typography
│   └── main.jsx                             # Entry Point Aplikasi React DOM
├── index.html                               # Dokumen HTML Root dengan Google Fonts
├── package.json                             # Daftar Dependensi & Script Eksekusi
├── vite.config.js                           # Konfigurasi Vite & Plugin React
└── README.md                                # Panduan Proyek & Instruksi Menjalankan
```

---

## 3. Rincian & Spesifikasi File per File (File-by-File Technical Breakdown)

---

### 3.1 Modul Kalkulasi Murni (`src/calculations/`)

Modul ini **bebas dari dependensi React atau Zustand** (*pure JavaScript functions*), sehingga 100% *unit-testable*, cepat, dan mudah diaudit.

#### 📄 `src/calculations/coreCalculations.js`
- **Tujuan**: Mengonversi rumus DAX Power BI inti menjadi JavaScript murni.
- **Daftar Fungsi yang Diekspor**:
  - `calculateVolumeMasuk(rows)`: Menjumlahkan baris dengan `jenis_aliran === 'vol_masuk_ton'`.
  - `calculateVolumeKeluar(rows)`: Menjumlahkan baris dengan `jenis_aliran === 'vol_keluar_ton'`.
  - `calculateNeracaBersih(volMasuk, volKeluar)`: Menghitung selisih $V_{\text{masuk}} - V_{\text{keluar}}$.
  - `calculateStatusNeraca(neracaBersih)`: Mengembalikan status `'SURPLUS'`, `'DEFISIT'`, atau `'SEIMBANG'`.
  - `calculateAvgHargaBeli(rows)`: Menghitung rata-rata tertimbang (*weighted average*) harga beli distributor.
  - `calculateAvgHargaJual(rows)`: Menghitung rata-rata tertimbang harga jual pedagang besar.
  - `calculateMarginRp(hargaJual, hargaBeli)`: Menghitung selisih harga jual dan beli dalam Rupiah.
  - `calculateMarginPct(marginRp, hargaBeli)`: Menghitung margin keuntungan dalam persentase (%).
  - `getMarginClassification(marginPct)`: Mengelompokkan margin ke kategori `'Rendah'`, `'Sehat'`, atau `'Tinggi'`.
  - `calculatePctLuarDiy(arusMasukRows)`: Menghitung % ketergantungan pasokan asal luar DIY vs lokal.
  - `calculateDeltaPct(currentVal, prevVal)`: Menghitung persentase pertumbuhan antar-pekan (*period-over-period*).

#### 📄 `src/calculations/flowMatrixCalculations.js`
- **Tujuan**: Menghitung matriks neraca wilayah dan data visualisasi *butterfly*.
- **Daftar Fungsi yang Diekspor**:
  - `calculateMatrixNeracaTab1(rawRingkasan, selectedPeriode, selectedKlaster)`: Menghasilkan tabel neraca 16 komoditas di 5 kabupaten/kota DIY untuk Tab 1 Panel B.
  - `calculateButterflyData(rawRingkasan, selectedPeriode, selectedWilayah, selectedKlaster)`: Menghitung pasangan volume masuk vs keluar bilateral per komoditas untuk *Butterfly Mirrored Bar Chart*.
  - `calculateTab2GroupedMatrix(rawRingkasan, selectedPeriode, tab2Responden)`: Mengagregasikan 3 sub-kolom (Masuk, Keluar, Selisih) per komoditas per kabupaten untuk Tab 2.
  - `calculateTab2Decomposition(rawRingkasan, selectedPeriode, targetKomoditas)`: Menghitung distribusi kontribusi surplus/defisit 5 kabupaten untuk komoditas terpilih.

#### 📄 `src/calculations/priceMarginMatrixCalculations.js`
- **Tujuan**: Menganalisis transmisi harga, disparitas wilayah, dan indikator tataniaga.
- **Daftar Fungsi yang Diekspor**:
  - `calculateTab3PriceMatrix(rawRingkasan, selectedPeriode, selectedWilayah, selectedKlaster)`: Menghasilkan tabel transmisi harga lengkap (Harga Beli, Jual, Margin Rp, Margin %, Status) per komoditas.
  - `calculateTab3MarginRanking(rawRingkasan, selectedPeriode, selectedWilayah, selectedKlaster)`: Peringkat komoditas berdasarkan margin persentase secara menurun (*descending*).
  - `calculateTab3ScatterData(rawRingkasan, selectedPeriode, selectedWilayah)`: Menyiapkan dataset *Scatter Plot* untuk korelasi volume pasokan vs harga rata-rata dan deteksi anomali.
  - `calculateTab3RegionPrices(rawRingkasan, selectedPeriode, selectedKomoditas)`: Menghitung disparitas harga komoditas antar-kabupaten.

#### 📄 `src/calculations/trendAntarwaktuCalculations.js`
- **Tujuan**: Pemrosesan deret waktu historis mingguan (*time series*).
- **Daftar Fungsi yang Diekspor**:
  - `calculateHistoricalTrends(rawRingkasan, selectedKomoditas, selectedWilayah, selectedKlaster)`: Menghasilkan deret waktu W23–W33 untuk grafik tren volume masuk/keluar, neraca, dan harga beli/jual.
  - `calculateTab4RegionalDeltas(rawRingkasan, selectedPeriode, prevPeriodObj, selectedKomoditas)`: Menghitung delta pertumbuhan pasokan dan neraca per kabupaten (Pekan Ini vs Pekan Lalu).
  - `calculateTab4CommodityEvolution(rawRingkasan)`: Menghitung grafik evolusi pasokan multi-garis 8 komoditas utama sepanjang waktu.

#### 📄 `src/calculations/qualitySlaCalculations.js`
- **Tujuan**: Pemeriksaan integritas data dan pemantauan SLA pelaporan responden.
- **Daftar Fungsi yang Diekspor**:
  - `calculateQualityMetrics(rawRingkasan, rawQualityIssues)`: Menghitung 6 indikator kesehatan data (Record Aktif, Soft Deleted, Harga Kosong, Anomali Satuan, Periode Kosong, Wilayah Non-Standar).
  - `calculateQualityByRegion(rawRingkasan)`: Menghitung persentase SLA kelengkapan data per kabupaten/kota (target 100%).
  - `calculateQualityByCommodity(rawRingkasan)`: Menghitung persentase SLA kelengkapan data per jenis komoditas.

#### 📄 `src/calculations/index.js`
- **Tujuan**: *Barrier file* (re-export terpusat) untuk mempermudah impor modul kalkulasi dari hook maupun komponen lain.

---

### 3.2 Lapisan State & Hook Data (`src/store/` & `src/hooks/`)

#### 📄 `src/store/useDashboardStore.js`
- **Tujuan**: Store terpusat berbasis **Zustand** untuk menyimpan filter aktif, UI state, dan dataset.
- **State Properties**:
  - `selectedPeriode`: ID periode aktif (`'PER_2026_W33'` atau `'Semua'`).
  - `selectedKomoditas`: Nama komoditas aktif (`'Beras Medium I (Ton)'` atau `'Semua'`).
  - `selectedWilayah`: Wilayah aktif (`'Semua Wilayah DIY'` atau nama kab/kota).
  - `selectedKlaster`: Klaster responden (`'semua'`, `'pedagang_besar'`, `'produsen'`).
  - `activeTab`: ID tab aktif (`'tab1'`, `'tab2'`, `'tab3'`, `'tab4'`, `'tab5'`).
  - `data`: Object master dataset (`laporan_ringkasan`, `arus_masuk`, `arus_keluar`, `respondents`, `quality_issues`, referensi).
  - `lastSyncTime`: Waktu sinkronisasi terakhir (misal: `"15:42 WIB"`).
  - `isLoading`, `error`, `isDataModalOpen`: Status UI.
- **Actions**:
  - `loadInitialData()`: Memuat data dari cache atau dataset bawaan.
  - `refreshData(url?)`: Melakukan pembaruan instan, memperbarui waktu sinkronisasi, dan menghitung ulang seluruh data.
  - `setSelectedPeriode()`, `setSelectedKomoditas()`, `setSelectedWilayah()`, `setSelectedKlaster()`, `resetFilters()`.

#### 📄 `src/hooks/useCalculations.js`
- **Tujuan**: Menghubungkan state dari Zustand Store dengan seluruh modul di `src/calculations/` menggunakan React `useMemo`.
- **Fitur Khusus**:
  - Menyediakan *normalized string matching* (`matchKomoditas` dan `matchWilayah`) yang kebal terhadap variasi penulisan seperti `(Ton)`, spasi, atau prefiks `Kab./Kota`.
  - Mengembalikan seluruh objek KPI, perbandingan delta, matriks visual, dan ranking ke komponen tab secara reaktif.

---

### 3.3 Layanan Terisolasi (`src/services/`)

#### 📄 `src/services/aiService.js`
- **Tujuan**: Generator analisis naratif dan rekomendasi kebijakan otomatis untuk pimpinan TPID dan Bank Indonesia.
- **Fungsi**:
  - `generateTab1ExecutiveInsights(metrics, pasokanStats, topOrigin, topDest, periodLabel)`: Menghasilkan 3 pilar narasi (Keseimbangan Pasokan, Ketergantungan Eksternal, Stabilitas Harga).
  - `generateTab2FlowInsights(metrics, topOrigin, topDest)`: Analisis saluran rantai pasok dan re-ekspor.
  - `generateTab3MarginInsights(metrics, marginRanking)`: Rekomendasi intervensi harga dan efisiensi logistik.
  - `generateTab4TrendInsights(historicalData, deltas)`: Evaluasi dinamika tren mingguan pangan.
  - `generateTab5QualityInsights(qualityMetrics)`: Laporan tata kelola dan audit kepatuhan responden.

#### 📄 `src/services/excelService.js`
- **Tujuan**: Pipeline pengolahan berkas Excel SheetJS dan manajemen cache di `localStorage`.
- **Fungsi**:
  - `getInitialData()`: Membaca cache `localStorage` atau fallback ke `generateMasterDataset()`.
  - `cacheData(data)`: Menyimpan snapshot dataset ke `localStorage`.
  - `normalizeLaporanRingkasan(rawRows)`: Meng-unpivot tabel laporan ringkasan lebar (`vol_masuk` & `vol_keluar`) menjadi format baris ternormalisasi `vol_masuk_ton` dan `vol_keluar_ton`.
  - `parseExcelBuffer(arrayBuffer)`: Membaca seluruh sheet workbook Excel (`profil_pb`, `profil_produsen`, `arus_masuk`, `arus_keluar`, `REF_*`).
  - `exportSampleWorkbook()`: Mengunduh template workbook Excel master.

---

### 3.4 Basis Data Master & Referensi (`src/data/`)

#### 📄 `src/data/seedData.js`
- **Tujuan**: Menyimpan tabel referensi master resmi dan generator dataset terintegrasi.
- **Konstanta yang Diekspor**:
  - `REF_WILAYAH`: 5 kabupaten/kota DIY beserta koordinat spasial.
  - `REF_KOMODITAS`: 16 komoditas pangan strategis (Beras berbagai grade, Bawang Merah, Bawang Putih, Cabai, Daging, Telur, Minyak, Gula).
  - `REF_KALENDER`: Deret pekan `2026-W23` s.d. `2026-W33`.
  - `REF_SATUAN`: Standar konversi satuan ke Ton.
  - `REF_KLASTER_RESPONDEN`: Klaster Pedagang & Grosir vs Produsen.
  - `generateMasterDataset()`: Fungsi pembangkit dataset master lengkap (arus masuk, arus keluar, responden, dan log audit).

---

### 3.5 Komponen Antarmuka Pengguna (`src/components/`)

#### 📄 `src/components/layout/Navbar.jsx`
- **Tujuan**: Navbar situs bergaya modern (*Single-Line Header*).
- **Elemen Utama**:
  - Logo Bank Indonesia dan judul Dashboard.
  - 5 tombol navigasi tab interaktif.
  - Badge indikator status aktif (*W33 • Live WIB*).
  - Tombol **`Refresh`** dengan animasi putar saat sinkronisasi.
  - Tombol menu burger untuk perangkat seluler.

#### 📄 `src/components/executive/ExecutiveIntelligenceBox.jsx`
- **Tujuan**: Menampilkan narasi intelijen analitik AI secara profesional dan rapi.
- **Elemen Utama**:
  - Header dengan icon AI synthesis dan tombol aksi *Perbarui Insight* / *Collapse*.
  - 3 kartu ringkasan eksekutif dengan badge status berwarna (*Surplus Pasokan / Ketergantungan Sedang / Marjin Sehat*).
  - Tombol *Salin Narasi* untuk memudahkan pembuatan bahan laporan pimpinan.

#### 📄 `src/components/tabs/Tab1RingkasanUtama.jsx`
- **Tujuan**: Halaman ringkasan eksekutif neraca pangan DIY.
- **Visualisasi & Panel**:
  - Top Slicers Bar (Periode, Komoditas, Kabupaten, Jenis Responden).
  - Highlight card Selisih Volume (Ton).
  - 4 KPI utama volume dan harga.
  - `ExecutiveIntelligenceBox`.
  - Line chart tren pasokan & penjualan.
  - Matriks komoditas $\times$ wilayah.
  - Donut chart komposisi pasokan dan penjualan.
  - Horizontal bar chart Top Sumber Pasokan & Top Tujuan Penjualan.
  - *Butterfly Chart* Arus Masuk vs Keluar.

#### 📄 `src/components/tabs/Tab2DetailArus.jsx`
- **Tujuan**: Analisis dekomposisi rantai pasok dan audit responden.
- **Visualisasi & Panel**:
  - 4 Slicer vertikal pada sidebar kiri.
  - 5 KPI cards aliran dan responden.
  - Matriks per komoditas $\times$ kabupaten (Masuk, Keluar, Selisih).
  - Butterfly comparison bar chart.
  - Bar chart kontribusi selisih arus.
  - Diagram dekomposisi pohon selisih wilayah.
  - Tabel responden dengan fitur *Live Search* dan *Pagination (8 per page)*.

#### 📄 `src/components/tabs/Tab3HargaMarjin.jsx`
- **Tujuan**: Analisis transmisi harga beli vs jual dan efisiensi tataniaga.
- **Visualisasi & Panel**:
  - Slicers header bar terintegrasi.
  - 5 KPI cards harga dan margin tataniaga.
  - AI Executive Insight Box rekomendasi TPID.
  - Tabel transmisi harga per komoditas lengkap dengan badge klasifikasi margin.
  - Peringkat marjin keuntungan komoditas (*horizontal bar chart*).
  - Scatter plot disparitas harga vs volume pasokan.

#### 📄 `src/components/tabs/Tab4TrenAntarwaktu.jsx`
- **Tujuan**: Evaluasi dinamika deret waktu historis mingguan.
- **Visualisasi & Panel**:
  - 4 Slicer vertikal pada sidebar kiri.
  - 5 KPI cards perbandingan delta pekanan ($\Delta\%$ Masuk, $\Delta\%$ Keluar, $\Delta$ Net, $\Delta\%$ Harga, $\Delta$ Margin).
  - Line chart tren volume antarwaktu.
  - Line chart tren harga antarwaktu vs garis referensi TPID.
  - Bar chart pertumbuhan selisih per kabupaten.
  - Multi-line chart evolusi pasokan 8 komoditas utama.
  - Tabel rekapitulasi historis periode ke periode.

#### 📄 `src/components/tabs/Tab5KualitasData.jsx`
- **Tujuan**: Tata kelola data, audit record anomali, dan kepatuhan SLA.
- **Visualisasi & Panel**:
  - 4 Slicer vertikal pada sidebar kiri.
  - 6 KPI cards integritas data (Aktif, Dihapus, Harga Kosong, Anomali Satuan, Periode Kosong, Wilayah Non-Standar).
  - Tabel rekapitulasi jenis isu kualitas data.
  - Bar chart distribusi volume isu.
  - Progress bar SLA kelengkapan data per kabupaten/kota.
  - Progress bar SLA kelengkapan data per jenis komoditas.
  - Tabel audit record bermasalah dengan status badge.
  - Checklist protokol pengendalian mutu data (QC).

#### 📄 `src/components/common/DataModal.jsx`
- **Tujuan**: Modal pendukung untuk opsi unggah berkas Excel manual dan sinkronisasi OneDrive jika diperlukan.

---

### 3.6 File Konfigurasi & Entry Point Root

#### 📄 `src/App.jsx`
- **Tujuan**: Komponen root aplikasi. Menghubungkan Navbar, trigger `loadInitialData()`, banner notifikasi error, rendering tab aktif secara kondisional, footer resmi BI-PSEKUIN, dan DataModal.

#### 📄 `src/main.jsx`
- **Tujuan**: Entry point JavaScript React 19 menggunakan `createRoot()`.

#### 📄 `src/index.css` & `src/App.css`
- **Tujuan**: Konfigurasi TailwindCSS v4, font Google (Plus Jakarta Sans & JetBrains Mono), styling custom scrollbar, dan utility class `clean-card`.

#### 📄 `index.html`
- **Tujuan**: Template HTML root yang memuat tag meta SEO, deskripsi resmi, favicon, serta preconnect font Google.

#### 📄 `package.json` & `vite.config.js`
- **Tujuan**: Konfigurasi build tool Vite, script eksekusi (`npm run dev`, `npm run build`), dan daftar dependensi produksi.

---

## 4. Diagram Aliran Data (Data Flow Architecture)

```
[Master Database / seedData.js]
             │
             ▼
    [ExcelService.js] (Normalisasi & Unpivot)
             │
             ▼
  [useDashboardStore.js] (Zustand Global State + LocalStorage)
             │
             ├──► [Selected Slicers: Periode, Komoditas, Wilayah, Klaster]
             │
             ▼
   [useCalculations.js] (React Hook Reaktif)
             │
   ┌─────────┴────────────────────────────────────────┐
   ▼                                                  ▼
[src/calculations/*]                        [aiService.js]
- coreCalculations.js                       - Narasi Pasokan
- flowMatrixCalculations.js                 - Ketergantungan Eksternal
- priceMarginMatrixCalculations.js          - Stabilitas Harga
- trendAntarwaktuCalculations.js            - Rekomendasi TPID
- qualitySlaCalculations.js                           │
   │                                                  │
   └────────────────────────┬─────────────────────────┘
                            ▼
               [UI Presentation Layer]
          - Tab 1: Ringkasan Utama
          - Tab 2: Detail Masuk vs Keluar
          - Tab 3: Harga & Marjin
          - Tab 4: Tren Antarwaktu
          - Tab 5: Kualitas Data & SLA
```

---

## 5. Ringkasan Pengujian & Kesiapan Produksi

| Aspek Pengujian | Kriteria Keberhasilan | Hasil Uji |
| :--- | :--- | :--- |
| **Penyimpanan Database Bawaan** | Aplikasi langsung menampilkan data tanpa prompt upload file | ✅ **Lulus (100%)** |
| **Respon Tombol Refresh** | Memperbarui stempel waktu sinkronisasi dan merefresh metrik dalam < 500ms | ✅ **Lulus (100%)** |
| **Slicer & Filter Data** | Mendukung opsi `All` dan komoditas baku (`Bawang Putih (Ton)`, dll.) | ✅ **Lulus (100%)** |
| **Modularitas Logika** | Logika kalkulasi terisolasi 100% pada `src/calculations/` | ✅ **Lulus (100%)** |
| **Kompilasi Produksi** | `npm run build` selesai dalam < 1 detik tanpa peringatan error | ✅ **Lulus (797ms)** |

---

*Dokumen Software Requirements Specification (SRS) ini merupakan rujukan arsitektur resmi untuk tim teknis dan evaluator sistem Dashboard Komoditas DIY 2026.*
