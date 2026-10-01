# DOKUMEN AUDIT SISTEM & DATA ANALISIS END-TO-END
## Dashboard Komoditas Strategis DIY — Bank Indonesia KPw DIY & PSEKUIN UPN Veteran Yogyakarta
**Role**: Lead System Analyst & Senior Data Analyst  
**Tanggal**: 20 September 2026  
**Status**: Critical Review & Actionable Remediation Plan  

---

## 1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)

Setelah melakukan audit menyeluruh terhadap seluruh alur data (*data pipeline*), struktur data, algoritma kalkulasi statistik, *state management*, hingga komponen visualisasi UI, sistem saat ini telah memiliki fondasi arsitektur yang kokoh namun memiliki **sejumlah anomali kritis, inkonsistensi metodologis, bias statistik, dan *hardcoded dummy data*** yang berpotensi menghasilkan angka analitik yang keliru jika digunakan oleh pengambil kebijakan (TPID / Dewan Gubernur Bank Indonesia).

### Skor Kesehatan Sistem (System Health Scorecard)

| Area Evaluasi | Skor (1-10) | Status | Temuan Utama |
| :--- | :---: | :---: | :--- |
| **1. Data Ingestion & ETL (Excel/Network)** | **6.5 / 10** | ⚠️ Perlu Dibenahi | Normalisasi format *wide-to-long* memaksakan satuan Ton dan menolkan Liter; *cache-busting* rentan *stale data*. |
| **2. Data Cleaning & Validation (EDA)** | **5.5 / 10** | 🚨 Kritis | Filter `volume <= 1` membuang data transaksi valid (0.1 - 1 Ton / cabai/bawang 100-1000 kg). |
| **3. Algoritma Kalkulasi & Statistik** | **6.0 / 10** | 🚨 Kritis | Inkonsistensi Volume-Weighted vs Simple Average; "Average of Averages" bias di Tab 3; Modul matriks mengabaikan komoditas cair (Minyak Goreng). |
| **4. Integritas Kualitas Data (SLA Module)** | **3.0 / 10** | 🚨 Fiktif / Dummy | Modul `qualitySlaCalculations.js` menggunakan *hardcoded array dummy* (`[99.2, 98.4...]`), bukan kalkulasi nyata dari record. |
| **5. State Management & Cross-Filtering** | **7.5 / 10** | ⚠️ Fragmentasi | Ada redundansi *state* lokal per tab (`tab2Komoditas`, `tab3Periode`) yang bertabrakan dengan `GlobalFilterBar`. |
| **6. Frontend UI/UX & Component Routing** | **8.5 / 10** | ✅ Bagus | Desain BI Institutional sudah diterapkan, namun `Tab5KualitasData.jsx` dan `HeaderBar.jsx` menjadi *dead code*. |

---

## 2. AUDIT FASE 1: PENGAMBILAN & EKSTRAKSI DATA (INGESTION & ETL)

### 2.1 Bug Unpivot pada `normalizeLaporanRingkasan` (`excelService.js`)
* **Lokasi**: `src/services/excelService.js:127-163`
* **Masalah**:
  Ketika membaca file Excel dengan format *wide* (kolom `vol_masuk` dan `vol_keluar`), fungsi normalisasi selalu menetapkan:
  ```javascript
  jenis_aliran: 'vol_masuk_ton',
  volume_ton: volMasuk,
  volume_liter: 0, // <-- HARDCODED 0!
  ```
* **Dampak**: Jika responden menginput minyak goreng (satuan Liter), nilainya dimasukkan ke `volume_ton` dan `volume_liter` diset 0. Akibatnya komoditas Liter rusak saat masuk ke kalkulasi unit-aware.
* **Rekomendasi Perbaikan**:
  Periksa `satuan_dasar` dari `REF_KOMODITAS`. Jika `satuan_dasar === 'Liter'`, maka isi `volume_liter: volMasuk` dan `volume_ton: 0`, dengan `jenis_aliran: 'vol_masuk_liter'`.

### 2.2 Mekanisme Caching LocalStorage (`CACHE_KEY`) yang Kaku
* **Lokasi**: `src/services/excelService.js:8`
* **Masalah**: Versi cache di-hardcode ke `dashboard_komoditas_diy_data_v7`. Jika ada update struktur master data di server, klien yang pernah membuka dashboard akan tetap membaca cache versi lama dari LocalStorage kecuali cache dibersihkan secara manual.
* **Rekomendasi Perbaikan**: Tambahkan checksum/hash atau versioning otomatis berbasis payload timestamp dari `masterDatabase.json`.

---

## 3. AUDIT FASE 2: PEMBERSIHAN DATA, VALIDASI & EDA (DATA QUALITY & CLEANING)

### 3.1 Over-Aggressive Filtering: Filter `volume <= 1` Membuang Data Valid
* **Lokasi**: `src/services/dataCleaningService.js:237-251`
* **Masalah**:
  ```javascript
  if (normalizedVolume <= 1) {
    report.volume_low_filtered++;
    // is_deleted = true, deletion_reason: "Volume <= 1 (toko tutup / tidak beroperasi)"
  }
  ```
* **Dampak Kritis**:
  Untuk komoditas bernilai tinggi/tonase kecil (seperti Cabai Rawit Merah, Bawang Merah, Bawang Putih), transaksi 0.2 Ton (200 kg) atau 0.5 Ton (500 kg) adalah **transaksi grosir yang sangat valid dan signifikan**. Aturan `volume <= 1 Ton` secara keliru menghapus ratusan data transaksi riil pedagang menengah-kecil!
* **Rekomendasi Perbaikan**:
  Ubah filter *toko tutup / tidak aktif* menjadi `volume <= 0` (atau `volume === 0` dan `is_closed === true`). Jangan gunakan ambang 1 Ton secara *blanket rule*.

### 3.2 Penolakan Satuan yang Kurang Fleksibel (Strict Rejection vs Safe Conversion)
* **Lokasi**: `src/services/dataCleaningService.js:70-115`
* **Masalah**: Input satuan seperti "Dus", "Karton", "Blek" (kaleng minyak), "Ikat" langsung ditolak mentah-mentah (*rejected issue*).
* **Rekomendasi Perbaikan**:
  Tambahkan tabel konversi konvensional perdagangan DIY (misal: 1 Dus Minyak Goreng = 12 Liter; 1 Karung Bawang = 25-50 kg) dengan flag status `Konversi Otomatis Terverifikasi`.

---

## 4. AUDIT FASE 3: METODOLOGI KALKULASI & INTEGRITAS STATISTIK (CALCULATIONS & DAX)

### 4.1 Inkonsistensi: Simple Arithmetic Average vs Volume-Weighted Average Price (VWAP)
* **Lokasi**: `src/calculations/coreCalculations.js:140-158` vs `PRD_SYSTEM_LOGIC.md:109-112`
* **Temuan**:
  - Di **PRD**: Rata-rata harga dirumuskan sebagai **Weighted Average by Volume**:
    $$\overline{P} = \frac{\sum (\text{Harga} \times \text{Volume})}{\sum \text{Volume}}$$
  - Di **Kode JavaScript**:
    ```javascript
    const sum = validRows.reduce((acc, r) => acc + Number(r.harga_beli), 0);
    return Math.round(sum / validRows.length); // Simple unweighted average!
    ```
* **Dampak Analitik**: Pedagang kecil dengan volume 50 kg dan harga anomali Rp 40.000 memiliki bobot pengaruh yang persis sama dengan distributor raksasa dengan volume 50 Ton di harga Rp 13.000. Ini menimbulkan distorsi harga agregat pasar (*distorted price index*).
* **Rekomendasi Perbaikan**: Terapkan rumus VWAP sesuai PRD jika volume tersedia, atau sediakan *toggle* (Harga Rerata Tertimbang Volume vs Rerata Responden).

### 4.2 Bias "Average of Averages" pada Matriks Harga Tab 3
* **Lokasi**: `src/calculations/priceMarginMatrixCalculations.js:66-67`
* **Temuan**:
  `row.avgBeliAll` dihitung dengan menjumlahkan rata-rata dari 5 kabupaten lalu dibagi jumlah kabupaten (`sumBeli / count`).
* **Dampak**: Ini adalah kesalahan statistik klasik (*Simpson's Paradox*). Rata-rata keseluruhan DIY harus dihitung langsung dari seluruh kumpulan baris transaksi aktif DIY, bukan merata-ratakan nilai rata-rata per wilayah.

### 4.3 Bug Ignorance Komoditas Cair pada Modul Matriks Arus
* **Lokasi**: 
  - `src/calculations/flowMatrixCalculations.js:74, 106, 152, 185`
* **Temuan**:
  Pada fungsi `calculateMatrixNeracaTab1`, `calculateButterflyData`, `calculateTab2GroupedMatrix`, dan `calculateTab2Decomposition`, kalkulasi volume membaca:
  ```javascript
  .reduce((sum, r) => sum + (Number(r.volume_ton) || 0), 0)
  ```
  Padahal untuk Minyak Goreng, nilainya berada di `r.volume_liter`!
* **Dampak Kritis**: Pada Tab 1 Matriks Neraca dan Tab 2 Butterfly Chart, komoditas Minyak Goreng Curah & Kemasan akan selalu bernilai **0 atau salah**.
* **Rekomendasi Perbaikan**: Ganti semua pemanggilan langsung `r.volume_ton` dengan helper universal `getRowVolume(r)` dari `coreCalculations.js`.

### 4.4 Data Kualitas Fiktif / Dummy pada `qualitySlaCalculations.js`
* **Lokasi**: `src/calculations/qualitySlaCalculations.js:117, 135`
* **Temuan**:
  ```javascript
  const completenessList = [99.2, 98.4, 96.7, 95.1, 93.8]; // FAKE HARDCODED!
  const completenessList = [99.5, 98.8, 97.2, 96.5, 95.8, ...]; // FAKE HARDCODED!
  ```
* **Dampak**: Monitoring kualitas data dan SLA tidak mencerminkan integritas database yang sebenarnya.
* **Rekomendasi Perbaikan**: Hitung persentase kelengkapan data secara real-time dari array `rawRingkasan` per `kab_kota` dan per `id_komoditas`.

---

## 5. AUDIT FASE 4: STATE MANAGEMENT, FILTERING & CROSS-FILTERING

### 5.1 Redundansi & Fragmentasi State Slicer di Zustand Store
* **Lokasi**: `src/store/useDashboardStore.js:28-46`
* **Temuan**:
  Store masih menyimpan filter terpisah per tab:
  - `tab2Komoditas`, `tab2Kabupaten`, `tab2Responden`
  - `tab3Periode`, `tab3Komoditas`
  - `tab4Komoditas`, `tab4Wilayah`, `tab4Klaster`
  Sementara di UI sekarang sudah menggunakan satu `GlobalFilterBar` universal (`selectedPeriode`, `selectedKomoditas`, `selectedWilayah`, `selectedKlaster`).
* **Dampak**: Memori tidak efisien, kalkulasi `useCalculations` memicu re-render ganda karena mendengarkan 12 parameter state yang sebagian besar sudah *deprecated*.
* **Rekomendasi Perbaikan**: Bersihkan *state* lokal tab tersebut dan pusatkan seluruh slicing ke 4 global slicers.

### 5.2 Inkonsistensi Penanganan Multi-select Periode vs Single Selected Periode
* **Lokasi**: `src/hooks/useCalculations.js:70-83, 273-301`
* **Temuan**:
  Ketika user memilih lebih dari 1 periode (multi-select), beberapa visualisasi (seperti Tab 1 Matriks Neraca dan Tab 3 Matriks Harga) hanya mengambil `lastSelectedPeriode` (periode terakhir yang dicentang), bukan mengagregasikan seluruh periode yang dipilih.
* **Rekomendasi Perbaikan**: Pastikan visualisasi yang mendukung multi-periode melakukan agregasi rata-rata per minggu (*weekly normalized aggregation*), bukan *fallback* diam-diam ke single period.

---

## 6. AUDIT FASE 5: UI/UX & ARSITEKTUR KOMPONEN FRONTEND

### 6.1 Dead Code / Orphan Components
* **Temuan**:
  1. `src/components/layout/HeaderBar.jsx`: Tidak lagi dirender di `App.jsx` (digantikan oleh `Navbar.jsx`), namun masih ada di codebase.
  2. `src/components/tabs/Tab5KualitasData.jsx`: Di `App.jsx`, `tab5` merender `Tab5PetaArus`. Tab 5 Kualitas Data yang sudah dibuat tidak bisa diakses oleh user.
* **Rekomendasi Perbaikan**:
  - Hapus atau satukan `HeaderBar.jsx` dengan `Navbar.jsx`.
  - Tambahkan tab ke-6 untuk *Monitoring & Kualitas Data (SLA)* di navigasi atas jika modul ini ingin dipertahankan untuk tim teknis/data analyst.

### 6.2 Format Angka & Notasi Finansial
* **Temuan**:
  Beberapa label delta harga menampilkan minus seperti `+-Rp 500` atau `-Rp 500`.
* **Rekomendasi Perbaikan**:
  Gunakan standar format perbankan:
  - Positif: `+Rp 500 (+3.8%)` (Hijau)
  - Negatif: `-Rp 500 (-3.8%)` atau `(Rp 500)` (Merah)
  - Netral: `Rp 0 (0.0%)` (Abu-abu)

---

## 7. ACTION PLAN & MATRIX PRIORITAS PERBAIKAN (REMEDIATION ROADMAP)

### Tabel Matriks Prioritas Kerja:

| No | Komponen File | Masalah | Tingkat Urgensi | Solusi Teknis |
| :---: | :--- | :--- | :---: | :--- |
| **1** | `flowMatrixCalculations.js` | Minyak Goreng bernilai 0 di Matriks Tab 1 & Tab 2 | **P0 (Kritis)** | Ganti `r.volume_ton` dengan `getRowVolume(r)`. |
| **2** | `dataCleaningService.js` | Filter `volume <= 1` membuang transaksi valid | **P0 (Kritis)** | Ubah batas filter menjadi `volume <= 0`. |
| **3** | `excelService.js` | Unpivot wide-to-long merusak komoditas Liter | **P0 (Kritis)** | Deteksi `satuan_dasar` saat mapping `vol_masuk`. |
| **4** | `qualitySlaCalculations.js` | Data kelengkapan SLA fiktif/dummy hardcoded | **P1 (Tinggi)** | Hitung kelengkapan real-time dari array transaksi. |
| **5** | `priceMarginMatrixCalculations.js` | Bias "Average of Averages" di harga agregat DIY | **P1 (Tinggi)** | Hitung rata-rata agregat langsung dari raw rows DIY. |
| **6** | `useDashboardStore.js` | Fragmentasi state lokal tab vs GlobalFilterBar | **P1 (Tinggi)** | Hapus `tab2*`, `tab3*`, `tab4*` state redundan. |
| **7** | `App.jsx` & `Navbar.jsx` | Tab 5 Kualitas Data tidak terhubung di UI | **P2 (Sedang)** | Buat opsi menu Tab 6 atau integrasikan ke Modal. |
