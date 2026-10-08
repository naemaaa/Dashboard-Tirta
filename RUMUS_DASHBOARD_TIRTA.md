# 🧮 DOKUMEN REVISI FORMULA & LOGIKA ANALISIS DASHBOARD TIRTA
**(Versi Koreksi Metodologi Ekonomi & Panduan Presentasi Eksekutif)**
**Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta**

---

## 📋 DAFTAR PERUBAHAN & LOG REVISI METODOLOGI

> [!NOTE]
> Dokumen ini memuat revisi metodologi analisis data pasar komoditas DIY berdasarkan standar analisis ekonomi makro, statistik pasar, dan pengendalian kualitas data survei.

| No | Komponen | Rumus / Konsep Lama | Rumus / Konsep Baru (Hasil Revisi) | Alasan Koreksi Ekonom |
|---|---|---|---|---|
| 1 | **Neraca Bersih** | `Masuk - Keluar` | `Masuk - Keluar - Susut` (serta evaluasi `Stok Akhir - Stok Awal`) | Memperhitungkan barang yang rusak/busuk dalam perjalanan & perubahan persediaan gudang. |
| 2 | **Status Neraca** | Toleransi absolut `±0,1 Ton` | Ambang relatif `±5%` dari Volume Masuk | Batas absolut 0,1 Ton terlalu kaku untuk komoditas bermassa besar (misal Beras 100 Ton). |
| 3 | **Stok Multi-Minggu** | Rata-rata stok mingguan | Posisi stok pada minggu terakhir terpilih | Stok adalah variabel *stock* (titik waktu), bukan variabel *flow* (aliran). |
| 4 | **Istilah Distribusi** | "Re-ekspor" & "Konsumsi Lokal" | "Pengiriman Antardaerah (ke Luar DIY)" & "Tujuan Dalam DIY" | Istilah Re-ekspor tidak tepat untuk perdagangan antardaerah/domestik non-pabean. |
| 5 | **Perhitungan Marjin** | `VWAP Jual - VWAP Beli` | Rata-rata Marjin per Laporan Tertimbang Volume | Mengurai bias agregasi ganda. Nama diubah jadi **Marjin Kotor Tataniaga**. |
| 6 | **Marjin % vs Markup %**| `(Jual - Beli) / Beli` | `Margin % = (Jual - Beli) / Jual x 100%`<br>`Markup % = (Jual - Beli) / Beli x 100%` | Menghindari rancu antara *Margin* (persen harga jual) dan *Markup* (persen modal beli). |
| 7 | **EWS & Ambang ALPS** | Ambang kaku 50/20/10% | Persentil historis per komoditas (WoW / MoM) | Setiap komoditas memiliki varians harga yang berbeda (misal Cabai vs Beras). |
| 8 | **Status EWS Provinsi**| 1 komoditas Critical = Provinsi Critical | Bobot tertimbang IHK / Komoditas Strategis | Mencegah *false alarm* akibat 1 komoditas minor yang melonjak harganya. |
| 9 | **Volatilitas Harga** | `(Max - Min) / Mean x 100%` | **Koefisien Variasi (CV)** = `(Standar Deviasi / Mean) x 100%` | CV adalah standar statistik resmi untuk mengukur gejolak harga (min. 8 data). |
| 10 | **Toko Tutup** | Menggunakan kode `Volume = 1` | Field status eksplisit (`Aktif` / `Libur-Tutup`) | Mencegah pencemaran data transaksi riil sebesar 1 kg/liter. |

---

## 📄 BAB I: METODOLOGI & BATASAN ANALISIS (WAJIB UNTUK PRESENTASI)

1. **Cakupan Sampel Responden (Bukan Total Populasi DIY)**
   - Semua angka volume, stok, dan aliran barang yang disajikan dalam dashboard ini adalah **hasil pencatatan sampel responden pedagang besar & produsen terdaftar**, bukan total akumulasi populasi agregat seluruh Provinsi DIY.
   - Pada setiap penyajian angka dalam laporan/presentasi, wajib mencantumkan jumlah responden aktif ($n$).

2. **Pemisahan Komoditas (Larangan Penjumlahan Lintas Komoditas)**
   - **Dilarang keras menjumlahkan tonase lintas komoditas** (misalnya menjumlahkan 10 Ton Beras + 5 Ton Cabai = 15 Ton).
   - Setiap komoditas dianalisis dan dilaporkan secara **terpisah**. Minyak Goreng dilaporkan dalam satuan **Liter**, sedangkan komoditas lainnya dalam satuan **Ton**.

3. **Perbedaan dengan Data PIHPS / BPS**
   - **PIHPS / BPS**: Mencatat harga eceran di pasar tradisional/modern untuk pemantauan inflasi konsumen.
   - **Dashboard TIRTA**: Mencatat transaksi pasokan grosir di tingkat pedagang besar & produsen untuk memantau ketahanan arus distribusi dan marjin tataniaga pangan.

---

## 📊 BAB II: ATURAN PENGOLAHAN DATA & FILTER

1. **Pembersihan Laporan Batal / Dihapus**
   - Laporan dengan status `is_deleted = TRUE` dikeluarkan total dari seluruh kalkulasi.

2. **Penanganan Toko Tutup / Tidak Beroperasi**
   - Menggunakan penanda status eksplisit (`status_responden = 'Aktif'` atau `'Tutup'`). Laporan responden yang tutup diabaikan dari perhitungan VWAP harga dan marjin.

3. **Pengolahan Multi-Minggu (Multi-Periode)**
   - **Variabel Aliran (*Flow*)**: Pasokan Masuk, Pasokan Keluar, dan Susut dihitung sebagai **Rata-Rata per Minggu** ($\text{Total Volume} / \text{Jumlah Minggu}$).
   - **Variabel Persediaan (*Stock*)**: Stok Akhir menggunakan **posisi angka pada minggu terakhir yang dipilih**.
   - **Rasio, Marjin %, dan VWAP Harga**: Dihitung langsung dari total agregat seluruh periode terpilih, bukan di-rata-rata dari persentase mingguan.

---

## 📈 BAB III: FORMULA ANALISIS PER TAB

### TAB 1: RINGKASAN UTAMA (EXECUTIVE DASHBOARD)

#### 1. Volume Pasokan Masuk Sampel
- **Penjelasan**: Total volume komoditas yang masuk ke sampel pedagang/produsen terpilih dalam 1 minggu.
- **Formula**:
  `Total Pasokan Masuk = Jumlah seluruh volume transaksi masuk dari responden aktif`

#### 2. Volume Pasokan Keluar Sampel
- **Penjelasan**: Total volume komoditas yang dijual/dikirim keluar oleh sampel pedagang/produsen terpilih.
- **Formula**:
  `Total Pasokan Keluar = Jumlah seluruh volume transaksi keluar dari responden aktif`

#### 3. Total Susut / Losses
- **Penjelasan**: Volume barang yang rusak, membusuk, atau menyusut selama penyimpanan dan transportasi.
- **Formula**:
  `Total Susut = Jumlah seluruh volume susut dari responden aktif`

#### 4. Neraca Bersih Pasokan Sampel
- **Penjelasan**: Selisih pasokan masuk setelah dikurangi barang keluar dan penyusutan.
- **Formula**:
  `Neraca Bersih = Total Pasokan Masuk - Total Pasokan Keluar - Total Susut`

#### 5. Status Neraca (Ambang Relatif 5%)
- **Penjelasan Status**:
  - **SURPLUS** = Jika Neraca Bersih > +5% dari Total Pasokan Masuk
  - **DEFISIT** = Jika Neraca Bersih < -5% dari Total Pasokan Masuk
  - **SEIMBANG** = Jika Neraca Bersih berada di antara -5% sampai +5% dari Total Pasokan Masuk
- **Naskah Presentasi**: *"Kriteria surplus/defisit kita ukur secara relatif 5% dari pasokan masuk. Jika barang masuk 100 Ton dan selisihnya di bawah 5 Ton, pasokan dikategorikan Seimbang."*

#### 6. Rasio Pasokan (Masuk vs Keluar)
- **Formula**:
  `Rasio Pasokan = Total Pasokan Masuk / Total Pasokan Keluar`

#### 7. Indikator Ketahanan Stok (Cakupan Stok Minggu)
- **Penjelasan**: Mengukur berapa minggu persediaan stok di gudang dapat memenuhi kebutuhan penyaluran rata-rata.
- **Formula**:
  `Cakupan Stok (Minggu) = Stok Akhir Minggu Terakhir / Rata-rata Pasokan Keluar per Minggu`
  *(Pencegahan pembagian nol: Jika Pasokan Keluar = 0, maka Cakupan Stok = 0).*

#### 8. Harga Beli & Harga Jual Rata-Rata (VWAP)
- **Harga Beli Rata-Rata (VWAP Beli)**:
  `Harga Beli VWAP = Total (Harga Beli x Volume) / Total Volume Beli`
- **Harga Jual Rata-Rata (VWAP Jual)**:
  `Harga Jual VWAP = Total (Harga Jual x Volume) / Total Volume Jual`

#### 9. Marjin Kotor Tataniaga (Rp & %)
- **Marjin Kotor Tataniaga (Nominal Rp)**:
  `Marjin Kotor Rp = Total ((Harga Jual per Laporan - Harga Beli per Laporan) x Volume Laporan) / Total Volume`
- **Margin Tataniaga (% dari Harga Jual)**:
  `Persentase Margin (%) = (Marjin Kotor Rp / Harga Jual VWAP) x 100%`
- **Markup Tataniaga (% dari Harga Modal Beli)**:
  `Persentase Markup (%) = (Marjin Kotor Rp / Harga Beli VWAP) x 100%`

#### 10. Klasifikasi Margin Tataniaga
- **Rugi / Negatif** = Margin < 0%
- **Sangat Tipis** = Margin 0% sampai 1%
- **Tipis** = Margin 1,01% sampai 3%
- **Normal** = Margin 3,01% sampai 7%
- **Tinggi** = Margin lebih dari 7%

---

### TAB 2: ARUS PASOKAN & MATRIKS MATRIKS ASAL-TUJUAN

#### 1. Rincian Sumber Pasokan Masuk
- **Pasokan Luar DIY (%)** = `(Volume Masuk dari Luar DIY / Total Pasokan Masuk) x 100%`
- **Pasokan Petani/Produsen DIY (%)** = `(Volume Masuk dari Petani DIY / Total Pasokan Masuk) x 100%`
- **Pasokan Antar-Pedagang Dalam DIY (%)** = `(Volume Masuk dari Pedagang DIY / Total Pasokan Masuk) x 100%`

#### 2. Tujuan Pengiriman Barang Keluar
- **Pengiriman Antardaerah (ke Luar DIY) (%)** = `(Volume Keluar ke Luar DIY / Total Pasokan Keluar) x 100%`
- **Tujuan Dalam DIY (%)** = `(Volume Keluar ke Dalam DIY / Total Pasokan Keluar) x 100%`

#### 3. Matriks Aliran Antardaerah (Asal - Tujuan)
- Menyajikan net aliran bersih antarkabupaten/kota di DIY berdasarkan data pengiriman responden.

---

### TAB 3: HARGA & MARJIN TATANIAGA

#### 1. Disparitas Harga Antar Wilayah (Versi Relatif)
- **Formula Disparitas Relatif (%)**:
  `Disparitas Relatif (%) = ((VWAP Jual Tertinggi Wilayah - VWAP Jual Terendah Wilayah) / VWAP Jual Rata-Rata DIY) x 100%`
  *(Wilayah dengan jumlah sampel responden n < 3 disembunyikan agar tidak menimbulkan bias).*

#### 2. Gejolak / Volatilitas Harga (Koefisien Variasi - CV)
- **Penjelasan**: Standar statistik resmi mengukur variabilitas harga sepanjang waktu (membutuhkan minimal 8 minggu data).
- **Formula**:
  `Koefisien Variasi CV (%) = (Standar Deviasi Harga Jual / Rata-rata Harga Jual) x 100%`

---

### TAB 4: TREN ANTARWAKTU

#### 1. Perubahan Minggu-ke-Minggu (WoW) Matched Sample
- Perbandingan harga mingguan dihitung **hanya pada sampel responden yang sama yang melapor di kedua minggu tersebut** (Matched Sample), dilengkapi dengan informasi jumlah sampel ($n$).

#### 2. Perubahan Marjin dalam Poin Persentase (p.p.)
- **Formula**:
  `Perubahan Marjin = Persentase Margin Minggu Ini (%) - Persentase Margin Minggu Lalu (%)`
  *(Satuan hasil adalah **poin persentase (p.p.)**, bukan persen).*

---

### TAB 5: KONTROL KUALITAS DATA SURVEI

#### 1. Response Rate (Tingkat Partisipasi Responden)
- **Formula**:
  `Response Rate (%) = (Jumlah Responden Melapor / Total Responden Terdaftar) x 100%`

#### 2. Kelengkapan Laporan (Completeness Rate)
- **Formula**:
  `Kelengkapan (%) = (Jumlah Laporan Valid dan Lengkap / Total Laporan Diterima) x 100%`
  - **Laporan Valid**: Laporan dari responden aktif yang terisi harga beli > 0, harga jual > 0, dan volume > 0.

#### 3. Standar Kualitas Data (Tanpa Celah)
- **Lengkap / Bagus** = Kelengkapan $\ge 95\%$
- **Perlu Perhatian** = Kelengkapan $80\%$ sampai $< 95\%$
- **Bermasalah** = Kelengkapan $< 80\%$

---

### TAB 7: EARLY WARNING SYSTEM (EWS) & RISK ANALYTICS

#### 1. Algoritma Kerawanan Pangan ALPS (Algorithm for Linking Price & Supply Stress)
- **Basis Evaluasi**: Kenaikan harga berbasis WoW (Minggu-ke-Minggu) atau MoM (Bulan-ke-Bulan).
- **Ambang Batas ALPS per Komoditas (Persentil Historis)**:
  - **🔴 CRITICAL (Sangat Rawan)** = Kenaikan harga $\ge$ Persentil ke-90 Historis Komoditas
  - **🟠 WARNING (Waspada)** = Kenaikan harga $\ge$ Persentil ke-75 Historis Komoditas
  - **🟡 WATCH (Perhatian)** = Kenaikan harga $\ge$ Persentil ke-50 Historis Komoditas
  - **🟢 NORMAL (Aman)** = Kenaikan harga $<$ Persentil ke-50 Historis Komoditas

#### 2. Status EWS Provinsi (Skor Tertimbang Bobot IHK)
- Menghitung **Skor Risiko Provinsi** dengan mengalikan status risiko komoditas terhadap **Bobot Inflasi IHK BPS**:
  `Skor Risiko EWS Provinsi = Jumlah (Skor Risiko Komoditas x Bobot IHK Komoditas)`
- Menghindari status provinsi langsung Critical hanya karena 1 komoditas berdampak kecil.

---

## 🛠️ TABEL PERBANDINGAN KHUSUS TIM DEVELOPER & DATA ANALYST

Bagi tim teknis yang memperbarui sintaks kodingan di dashboard frontend/backend:

| Modul / Fungsi Code | Logika Kode Lama | Rekomendasi Logika Kode Baru |
|---|---|---|
| `calculateNeracaBersih()` | `volMasuk - volKeluar` | `volMasuk - volKeluar - susut` |
| `calculateStatusNeraca()` | `volNet > 0.1 ? 'SURPLUS' : volNet < -0.1 ? 'DEFISIT' : 'SEIMBANG'` | `volNet > (0.05 * volMasuk) ? 'SURPLUS' : volNet < (-0.05 * volMasuk) ? 'DEFISIT' : 'SEIMBANG'` |
| `calculateTotalStokAkhir()` | `AVERAGE(stok)` saat multi-periode | **Ambil stok pada `id_periode` paling akhir** dari array periode terpilih |
| `calculateMarginRp()` | `avgHargaJual - avgHargaBeli` | `SUM((hargaJual - hargaBeli) * volume) / SUM(volume)` |
| `calculateVolatilitas()` | `(max - min) / avg * 100` | **`stdDev / mean * 100`** (Koefisien Variasi CV, min 8 periode) |
| Label "Re-ekspor" | `'Re-ekspor'` | `'Pengiriman Antardaerah'` |
| Label "Konsumsi Lokal" | `'Konsumsi Lokal'` | `'Tujuan Dalam DIY'` |
