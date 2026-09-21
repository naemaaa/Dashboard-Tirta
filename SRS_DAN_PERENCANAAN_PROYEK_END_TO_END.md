# DOKUMEN SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SRS) & PERENCANAAN PROYEK END-TO-END
## SISTEM INTELIJEN & DASHBOARD ANALITIK ALIRAN KOMODITAS PANGAN STRATEGIS DAERAH ISTIMEWA YOGYAKARTA (DIY)
### Kolaborasi Strategis: Kantor Perwakilan Bank Indonesia DIY & PSEKUIN UPN "Veteran" Yogyakarta

---

| Atribut Dokumen | Informasi Spesifikasi Teknis |
| :--- | :--- |
| **Judul Proyek** | Dashboard Intelijen Aliran Komoditas Pangan Strategis DIY (Dashboard-Tirta) |
| **Jenis Dokumen** | *Software Requirements Specification (SRS) & End-to-End Project Planning* |
| **Standar Acuan** | IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018 & PMBOK Guide 7th Edition |
| **Versi Rilis** | Versi 2.0 (Full Production & AI-Enabled) |
| **Penyusun** | Tim Pengembang Sistem & Analis Data PSEKUIN - Bank Indonesia |
| **Tanggal Terbit** | September 2026 |
| **Status Dokumen** | **FINAL / APPROVED FOR ACADEMIC & INSTITUTIONAL ASSESSMENT** |

---

## DAFTAR ISI

1. [BAB 1: PENDAHULUAN & LATAR BELAKANG PROYEK](#bab-1-pendahuluan--latar-belakang-proyek)
   - 1.1 Latar Belakang & Urgensi Masalah
   - 1.2 Rumusan Masalah & Tantangan Bisnis
   - 1.3 Tujuan & Sasaran Proyek
   - 1.4 Ruang Lingkup Sistem (*Scope Management*)
   - 1.5 Profil Pengguna & Analisis Pemangku Kepentingan (*Stakeholders*)
   - 1.6 Definisi, Akronim, & Glosarium Teknis
2. [BAB 2: MANAJEMEN & PERENCANAAN PROYEK (PROJECT PLANNING)](#bab-2-manajemen--perencanaan-proyek-project-planning)
   - 2.1 Metodologi Pengembangan (*Agile / Scrum Framework*)
   - 2.2 *Work Breakdown Structure* (WBS) 6 Tahapan
   - 2.3 *Project Schedule & Milestone* (Gantt Chart Roadmap)
   - 2.4 Alokasi Sumber Daya & Estimasi Biaya Nol (*Zero-Cost Serverless Architecture*)
   - 2.5 Manajemen Risiko & Mitigasi (*Risk Assessment Matrix*)
3. [BAB 3: ARSITEKTUR SISTEM & ALIRAN DATA END-TO-END](#bab-3-arsitektur-sistem--aliran-data-end-to-end)
   - 3.1 Arsitektur Sistem Tingkat Tinggi (*High-Level Architecture*)
   - 3.2 Pipeline Aliran Data End-to-End (*Data Pipeline 6 Tahapan*)
   - 3.3 *Data Flow Diagram* (DFD Level 0 & DFD Level 1)
   - 3.4 *Sequence Diagram* Interaksi Sistem & Inferensi AI
4. [BAB 4: SPESIFIKASI KEBUTUHAN SISTEM (SRS REQUIREMENTS)](#bab-4-spesifikasi-kebutuhan-sistem-srs-requirements)
   - 4.1 Kebutuhan Fungsional (*Functional Requirements* - FR)
   - 4.2 Kebutuhan Non-Fungsional (*Non-Functional Requirements* - NFR)
   - 4.3 Logika Matematis & Formalisasi Rumus Bisnis (*Calculation Engine*)
5. [BAB 5: STRUKTUR DATA, SKEMA BASIS DATA & KAMUS DATA](#bab-5-struktur-data-skema-basis-data--kamus-data)
   - 5.1 *Entity Relationship Diagram* (ERD Konseptual & Logikal)
   - 5.2 Skema Tabel Dataset & Kamus Data Lengkap
   - 5.3 Standarisasi Konversi Satuan & *Liquid Awareness*
6. [BAB 6: PERANCANGAN ANTARMUKA PENGGUNA (UI/UX DESIGN)](#bab-6-perancangan-antarmuka-pengguna-uiux-design)
   - 6.1 *Design System* & Palet Warna Resmi Institusi
   - 6.2 Dekomposisi 5 Tab Antarmuka Pengguna
   - 6.3 Fitur Eksekutif: *Executive Intelligence AI Advisor*
7. [BAB 7: STRUKTUR FILE & ORGANISASI KODE SUMBER](#bab-7-struktur-file--organisasi-kode-sumber)
   - 7.1 Peta Struktur Direktori (*Directory Tree*)
   - 7.2 Spesifikasi Modul Per Komponen
8. [BAB 8: RENCANA PENGUJIAN & JAMINAN KUALITAS (QA & TESTING)](#bab-8-rencana-pengujian--jaminan-kualitas-qa--testing)
   - 8.1 Strategi Pengujian Sistem
   - 8.2 Matriks Kasus Uji (*Test Cases & Results*)
9. [BAB 9: PANDUAN DEPLOYMENT & PEMELIHARAAN SISTEM](#bab-9-panduan-deployment--pemeliharaan-sistem)
   - 9.1 Prosedur Deployment Cloud Serverless (Vercel)
   - 9.2 Konfigurasi Environment Variable & API Security
10. [BAB 10: PENUTUP & REKOMENDASI TAHAP LANJUT](#bab-10-penutup--rekomendasi-tahap-lanjut)

---

# BAB 1: PENDAHULUAN & LATAR BELAKANG PROYEK

### 1.1 Latar Belakang & Urgensi Masalah
Stabilitas harga pangan dan keterjaminan pasokan komoditas strategis merupakan pilar fundamental dalam menjaga stabilitas makroekonomi dan kesejahteraan masyarakat di Daerah Istimewa Yogyakarta (DIY). Fluktuasi harga komoditas pangan seperti Beras, Cabai Rawit Merah, Bawang Merah, Daging Ayam Ras, dan Telur Ayam seringkali dipicu oleh distorsi rantai pasok (*supply chain friction*), disparitas pasokan antar-wilayah, dan tingginya ketergantungan pasokan dari luar daerah (misal: Jawa Tengah, Jawa Timur, dan Jawa Barat).

Sebagai representasi otoritas moneter di daerah bersama Pemerintah Daerah dalam forum **Tim Pengendalian Inflasi Daerah (TPID)**, Kantor Perwakilan Bank Indonesia DIY bersama Pusat Studi Ekonomi Keuangan dan Industri (PSEKUIN) UPN "Veteran" Yogyakarta menyelenggarakan pengumpulan data rutin mingguan dari pelaku usaha utama (Pedagang Besar dan Produsen) di 5 kabupaten/kota:
1. Kota Yogyakarta
2. Kabupaten Sleman
3. Kabupaten Bantul
4. Kabupaten Kulon Progo
5. Kabupaten Gunungkidul

Tantangan utama yang dihadapi adalah data survei mingguan tersebar di **10 database mentah enumerator di Microsoft OneDrive**, membutuhkan konsolidasi data, rekonsiliasi anomali, kalkulasi transmisi harga (*Volume-Weighted Average Price / VWAP*), deteksi disparitas marjin tataniaga, pemetaan neraca surplus/defisit, hingga perumusan rekomendasi kebijakan secara cepat dan presisi.

### 1.2 Rumusan Masalah
1. **Fragmentasi Data**: Data survei lapangan berada pada lembar kerja terpisah antar-kabupaten dan klaster responden, menyulitkan visibilitas aliran komoditas secara menyeluruh (*holistic visibility*).
2. **Keterlambatan Analisis (*Time-Lag*)**: Pengolahan manual via spreadsheet memerlukan waktu berhari-hari, mengurangi efektivitas pengambilan keputusan intervensi pasar oleh TPID.
3. **Kompleksitas Perhitungan Tataniaga**: Perhitungan neraca bersih, pembobotan volume transaksi (*VWAP*), dan dekomposisi rantai pasok antar-kabupaten menuntut algoritma matematika yang konsisten.
4. **Kebutuhan Rekomendasi Cerdas**: Pengambil kebijakan memerlukan sintesis narasi intelijen otomatis yang siap saji untuk rapat koordinasi pengendalian inflasi mingguan.

### 1.3 Tujuan & Sasaran Proyek
- **Membangun Dashboard Analitik Terpadu**: Aplikasi berbasis web (*Single Page Application / SPA*) yang interaktif, modern, dan berkinerja tinggi.
- **Mengintegrasikan Pipeline Data End-to-End**: Menggabungkan data mentah 10 sumber OneDrive menjadi satu *Master Database* terpusat dengan mekanisme sinkronisasi instan.
- **Menyediakan 5 Modul Analisis Strategis**:
  1. *Ringkasan Utama & Neraca Perdagangan DIY*
  2. *Detail Arus Masuk vs Keluar & Dekomposisi Rantai Pasok*
  3. *Transmisi Harga & Marjin Tataniaga Pangan*
  4. *Tren Antarwaktu & Analisis Dinamika Pekanan (W23–W38)*
  5. *Kualitas Data, Audit Anomali & Monitoring SLA Responden*
- **Menyematkan Asisten Kebijakan Berbasis AI Generatif (*Executive Intelligence Advisor*)**: Memanfaatkan arsitektur LLM berkecepatan ultra-tinggi (*Groq LPU Inference*) untuk menghasilkan rekomendasi kebijakan logistik, Kerjasama Antar Daerah (KAD), dan stabilisasi harga.

### 1.4 Ruang Lingkup Sistem (*Scope Management*)
| Kategori | Di Dalam Ruang Lingkup (*In-Scope*) | Di Luar Ruang Lingkup (*Out-of-Scope*) |
| :--- | :--- | :--- |
| **Wilayah** | 5 Kabupaten/Kota se-Provinsi DIY | Wilayah di luar Provinsi DIY (kecuali sebagai titik asal/tujuan pasokan) |
| **Komoditas** | 16 Komoditas Pangan Pokok Strategis (Beras, Cabai, Bawang, Daging, Telur, Minyak, Gula) | Komoditas non-pangan, hasil industri manufaktur berat |
| **Waktu** | Deret pekan berjalan (W23 s.d. W38, tahun berjalan 2026) | Data historis dekade lampau tanpa standardisasi formulir |
| **Pelaku Usaha** | Pedagang Besar (PB) & Produsen Pangan | Konsumen akhir rumah tangga / pasar eceran mikro |
| **Fitur AI** | Sintesis intelijen 3 pilar kebijakan & analisis anomali via LLM | Sistem pemesanan transaksi komoditas langsung (*e-commerce*) |

### 1.5 Profil Pengguna & Analisis Pemangku Kepentingan
1. **Pimpinan Kantor Perwakilan Bank Indonesia DIY & Anggota TPID**: Memanfaatkan *Executive Intelligence Box*, matriks neraca wilayah, dan rekomendasi AI untuk penetapan intervensi pasar.
2. **Tim Peneliti PSEKUIN UPN "Veteran" Yogyakarta**: Melakukan audit mutu data, analisis transmisi harga, dan evaluasi marjin tataniaga.
3. **Dinas Perdagangan & Ketahanan Pangan Kabupaten/Kota**: Memantau disparitas harga lokal dan daerah penyuplai utama.
4. **Enumerator & Tim Pengolah Data**: Memantau *SLA Submission Rate*, memvalidasi record anomali, dan memperbarui dataset.

### 1.6 Definisi, Akronim, & Glosarium Teknis
- **VWAP (*Volume-Weighted Average Price*)**: Harga rata-rata tertimbang berdasarkan volume transaksi komoditas.
- **Neraca Bersih (*Net Trade Balance*)**: Selisih kuantitatif antara total volume masuk dikurangi total volume keluar dalam periode tertentu.
- **KAD (*Kerjasama Antar Daerah*)**: Skema kemitraan pasokan komoditas pangan antar pemerintah daerah untuk menambal defisit.
- **Marjin Tataniaga**: Selisih harga jual di tingkat pedagang besar dengan harga beli dari produsen/pemasok.
- **Groq LPU (*Language Processing Unit*)**: Akselerator perangkat keras AI untuk inferensi LLM berlatensi rendah (< 1 detik).
- **Zustand**: Pustaka manajemen *state* global React berbasis *flux architecture* yang ringan dan reaktif.

---

# BAB 2: MANAJEMEN & PERENCANAAN PROYEK (PROJECT PLANNING)

### 2.1 Metodologi Pengembangan (*Agile / Scrum Framework*)
Pengembangan sistem menggunakan pendekatan **Agile Scrum** dengan siklus *sprint* 1 mingguan untuk memastikan adaptabilitas tinggi terhadap perubahan kebutuhan data dan respon pemangku kepentingan.

```mermaid
graph LR
    A[Sprint Planning] --> B[Daily Standup & Dev]
    B --> C[ETL & Calc Verification]
    C --> D[UI/UX Polish]
    D --> E[Sprint Review & UAT]
    E --> F[Retrospective & Deploy]
    F --> A
```

### 2.2 Work Breakdown Structure (WBS) 6 Tahapan
```
1.0 Inisiasi & Analisis Kebutuhan
  ├── 1.1 Konsolidasi Kebutuhan Bank Indonesia & PSEKUIN
  ├── 1.2 Studi Formulir Survei 10 Database OneDrive
  └── 1.3 Penyusunan Dokumen SRS & Perancangan Arsitektur
2.0 Pipeline Data & Engine Kalkulasi (Backend & ETL)
  ├── 2.1 Standardisasi Skema Master Database (5.120 Records)
  ├── 2.2 Algoritma Normalisasi Unit (Ton vs Liter / Liquid-Awareness)
  ├── 2.3 Implementasi Pure Calculation Functions (VWAP, Net Balance, Delta)
  └── 2.4 Pembangunan Proxy Sinkronisasi Cloud Serverless (/api/sync-onedrive)
3.0 Frontend UI/UX & Visualisasi Data (React SPA)
  ├── 3.1 Pembangunan Modern Navigation & Dynamic Slicers Bar
  ├── 3.2 Implementasi Tab 1: Ringkasan Utama & Butterfly Chart
  ├── 3.3 Implementasi Tab 2: Matriks Detail & Tree View Dekomposisi
  ├── 3.4 Implementasi Tab 3: Analisis Disparitas Harga & Scatter Plot
  ├── 3.5 Implementasi Tab 4: Multi-Line Time Series & Delta Wilayah
  └── 3.6 Implementasi Tab 5: Audit Mutu Data & SLA Compliance
4.0 Integrasi Kecerdasan Buatan (Generative AI Integration)
  ├── 4.1 Pembuatan Endpoint Serverless Groq LPU (/api/ai-advisor)
  ├── 4.2 Perancangan System Prompt Ekonomi Moneter & Format Output JSON
  └── 4.3 Pembangunan Komponen Reaktif ExecutiveIntelligenceBox
5.0 Pengujian, Audit Mutu, & Validasi (Quality Assurance)
  ├── 5.1 Verifikasi Konsistensi Matematika DAX vs JavaScript
  ├── 5.2 Pengujian Ketahanan Filter & Slicers Multi-Dimensi
  └── 5.3 Cross-Browser & Responsive Device Testing
6.0 Deployment, Dokumentasi, & Serah Terima
  ├── 6.1 Setup CI/CD Pipeline via GitHub & Vercel
  ├── 6.2 Penyusunan Dokumentasi Teknis & Panduan Pengguna
  └── 6.3 Finalisasi Release v2.0
```

### 2.3 Project Schedule & Milestone (Gantt Chart Representation)
```mermaid
gantt
    title Jadwal Pelaksanaan Proyek Dashboard Komoditas DIY (12 Minggu)
    dateFormat  YYYY-MM-DD
    section Fase Inisiasi
    Studi Literatur & Wawancara Stakeholder :2026-06-01, 14d
    Penyusunan SRS & Arsitektur Sistem       :2026-06-15, 10d
    section Pipeline Data & Core
    Konsolidasi 10 Database OneDrive        :2026-06-25, 12d
    Pembangunan Pure Calculation Engine     :2026-07-07, 14d
    section Pengembangan Frontend
    Layout Design & Slicer Engine           :2026-07-21, 10d
    Tab 1, Tab 2, Tab 3 UI Development      :2026-07-31, 14d
    Tab 4 & Tab 5 UI Development            :2026-08-14, 10d
    section Integrasi AI & API
    Integrasi Serverless Groq LPU AI        :2026-08-24, 8d
    section QA & Deployment
    Audit Matematika & UAT                  :2026-09-01, 10d
    Deployment Vercel & Serah Terima        :2026-09-11, 10d
```

### 2.4 Alokasi Sumber Daya & Arsitektur Biaya Nol (*Zero-Cost Plan*)
Proyek ini dirancang secara optimal memanfaatkan infrastruktur *open-source* dan layanan cloud tingkat gratis (*Free Tier Tier-1*), sehingga menghasilkan total biaya operasional **Rp 0,- (Gratis)** namun dengan performa *enterprise-grade*:
- **Web App Hosting**: Vercel Serverless Edge Platform (Gratis, SLA 99.99%, Global CDN).
- **AI Inference Engine**: Groq Cloud API (Gratis, Model `openai/gpt-oss-120b`, Kuota gratis hingga 14.400 request/hari).
- **Database & Storage**: Hybrid In-Memory JSON + LocalStorage Client Cache + OneDrive Public Fetching.
- **Repository & CI/CD**: GitHub Private Repository & Automated GitHub Actions.

### 2.5 Manajemen Risiko Proyek (*Risk Assessment Matrix*)

| ID Risiko | Deskripsi Risiko | Dampak | Probabilitas | Strategi Mitigasi Terbukti |
| :--- | :--- | :---: | :---: | :--- |
| **R-01** | *CORS / 403 Forbidden* saat fetch langsung OneDrive dari browser | Tinggi | Tinggi | Dibangun *Serverless Function Proxy* di `/api/sync-onedrive` dengan *fallback* otomatis ke `masterDatabase.json`. |
| **R-02** | Inkonsistensi satuan komoditas cair (Minyak Goreng: Ton vs Liter) | Tinggi | Sedang | Diterapkan algoritma *Unit-Aware Conversion* di `dataCleaningService.js` dan pelabelan dinamis pada UI. |
| **R-03** | Kuota API AI habis (*Rate Limit Exhaustion*) | Sedang | Rendah | Diterapkan mekanisme *Dual API Keys Fallback* + *Local Algorithmic Heuristic Fallback* di `aiService.js`. |
| **R-04** | Perubahan format lembar survei oleh enumerator | Sedang | Sedang | Diterapkan tabel audit integritas di Tab 5 yang secara otomatis mendeteksi baris bermasalah / *soft-deleted*. |

---

# BAB 3: ARSITEKTUR SISTEM & ALIRAN DATA END-TO-END

### 3.1 Arsitektur Sistem Tingkat Tinggi (*High-Level Architecture*)

```mermaid
graph TB
    subgraph DATA_SOURCE["1. Sumber Data Lapangan (Raw Data Layer)"]
        OD1["OneDrive: 5 Database Pedagang Besar"]
        OD2["OneDrive: 5 Database Produsen"]
        OD1 --> MDB["Master Database.xlsx (Konsolidasi Terpadu)"]
        OD2 --> MDB
    end

    subgraph SERVERLESS_API["2. Serverless API Layer (Node.js / Edge)"]
        API1["/api/sync-onedrive<br/>(Excel Parser & Proxy)"]
        API2["/api/ai-advisor<br/>(Groq LPU Gateway)"]
        MDB -.-> API1
    end

    subgraph CLIENT_ENGINE["3. Client Processing Engine (React 19 + Zustand)"]
        STORE["Zustand Global Store<br/>(Filter, Slicer, Cache)"]
        HOOK["useCalculations.js<br/>(Reactive Memoized Hook)"]
        CALC["src/calculations/*<br/>(Pure JS Mathematical Engine)"]
        API1 --> STORE
        STORE --> HOOK
        HOOK <--> CALC
    end

    subgraph AI_ENGINE["4. AI Advisory Engine"]
        GROQ["Groq LPU Supercomputer<br/>(Model: openai/gpt-oss-120b)"]
        API2 <--> GROQ
        STORE -.-> API2
    end

    subgraph UI_LAYER["5. Presentation Layer (TailwindCSS + Lucide + Recharts)"]
        TAB1["Tab 1: Ringkasan Utama & Neraca"]
        TAB2["Tab 2: Detail Arus & Dekomposisi"]
        TAB3["Tab 3: Harga & Marjin Tataniaga"]
        TAB4["Tab 4: Tren Antarwaktu"]
        TAB5["Tab 5: Audit Kualitas Data & SLA"]
        AI_BOX["ExecutiveIntelligenceBox"]
        
        HOOK --> TAB1
        HOOK --> TAB2
        HOOK --> TAB3
        HOOK --> TAB4
        HOOK --> TAB5
        API2 --> AI_BOX
        TAB1 -.-> AI_BOX
        TAB3 -.-> AI_BOX
    end
```

### 3.2 Pipeline Aliran Data End-to-End (*Data Pipeline 6 Tahapan*)
1. **Tahap 1 - Akuisisi Lapangan**: Enumerator mengisi form mingguan untuk 13 pedagang besar dan 13 produsen per kabupaten/kota.
2. **Tahap 2 - Konsolidasi Excel**: 10 database disatukan ke dalam `Master Database.xlsx` yang memiliki lembar kerja terstruktur (`laporan_ringkasan`, `arus_masuk`, `arus_keluar`, `dim_responden`).
3. **Tahap 3 - Normalisasi & Cleaning**: Modul `dataCleaningService.js` melakukan *unpivoting*, standarisasi nama komoditas, pengecekan baris terhapus (*soft-delete*), dan standarisasi volume.
4. **Tahap 4 - In-Memory High Speed Calculation**: Modul `src/calculations/*` memproses 5.120+ baris data secara instan menggunakan fungsi matematika murni bebas efek samping.
5. **Tahap 5 - GenAI Intelligence Policy Synthesis**: Parameter neraca, harga, dan ketergantungan wilayah dikirim ke `/api/ai-advisor` untuk dianalisis oleh model LLM Groq menghasilkan 3 rekomendasi taktis.
6. **Tahap 6 - Rendering Interaktif**: Komponen React memperbarui grafik, matriks, kartu KPI, dan peta spasial secara reaktif tanpa *reload* halaman.

### 3.3 Data Flow Diagram (DFD Level 0 & Level 1)

#### DFD Level 0 (Context Diagram)
```mermaid
graph LR
    User[Analis BI / PSEKUIN / TPID] -- 1. Pilih Slicer / Refresh --> System((Dashboard Komoditas DIY))
    System -- 2. Visualisasi Neraca, Grafik, & Narasi AI --> User
    OneDrive[Microsoft OneDrive Cloud] -- 3. Master Dataset Excel --> System
    GroqAI[Groq LPU LLM API] -- 4. Rekomendasi Kebijakan JSON --> System
```

#### DFD Level 1 (Decomposition Diagram)
```mermaid
graph TD
    User([Pengguna / Analis]) -->|Set Slicer Filter| P1[1.0 Filter & Slicer Handler]
    OneDrive[(OneDrive / masterDatabase.json)] -->|Raw Excel Stream| P2[2.0 ETL & Normalization Service]
    
    P2 -->|Clean Normalized Rows| D1[(In-Memory Dataset)]
    P1 -->|Active Slicers State| P3[3.0 Pure Calculation Engine]
    D1 -->|Filtered Rows| P3
    
    P3 -->|KPI, Matrix, Trends Data| P4[4.0 View Renderer]
    P3 -->|Aggregated Summary Context| P5[5.0 AI Policy Generator]
    
    P5 <-->|JSON Prompt / Policy Response| GroqService[Groq Cloud Serverless API]
    P5 -->|3 Pillars Policy Cards| P4
    P4 -->|Dashboard Interaktif| User
```

### 3.4 Sequence Diagram: Interaksi Filter & Inferensi AI
```mermaid
sequenceDiagram
    autonumber
    actor Analis as Analis Kebijakan TPID
    participant UI as React UI (GlobalFilterBar)
    participant Store as Zustand Store
    participant Hook as useCalculations Hook
    participant Engine as calculations/*
    participant API as /api/ai-advisor
    participant Groq as Groq LPU Cloud

    Analis->>UI: Pilih Komoditas: "Beras Medium I", Wilayah: "Kab. Sleman"
    UI->>Store: setSelectedKomoditas("Beras Medium I"), setSelectedWilayah("Kab. Sleman")
    Store->>Hook: State Updated Trigger (useMemo)
    Hook->>Engine: Hitung Volume Masuk, Keluar, VWAP Beli/Jual, Net Delta
    Engine-->>Hook: Kembalikan Object KPI & Matriks
    Hook-->>UI: Render Ulang Kartu KPI, Grafik Butterfly, Scatter Plot (<16ms)
    
    opt Pengguna Meminta Sintesis AI
        UI->>API: POST /api/ai-advisor { metrics, context }
        API->>Groq: Chat Completion (model: openai/gpt-oss-120b)
        Groq-->>API: JSON Structured Recommendations
        API-->>UI: Response 3 Pilar Kebijakan
        UI->>Analis: Tampilkan Executive Intelligence Card dengan Badge Status
    end
```

---

# BAB 4: SPESIFIKASI KEBUTUHAN SISTEM (SRS REQUIREMENTS)

### 4.1 Kebutuhan Fungsional (*Functional Requirements* - FR)

| Kode Kebutuhan | Nama Kebutuhan | Deskripsi Spesifikasi Fungsional | Tingkat Prioritas |
| :--- | :--- | :--- | :---: |
| **FR-01** | *Global Dynamic Slicing* | Sistem harus menyediakan bilah filter horizontal terpadu untuk Periode (W23–W38), 16 Komoditas, 5 Wilayah Kab/Kota DIY, dan Klaster Responden (Semua, Pedagang Besar, Produsen) dengan tombol *Reset Filter*. | **CRITICAL** |
| **FR-02** | *Net Trade Balance Calculation* | Sistem harus menghitung volume masuk ($V_{in}$), volume keluar ($V_{out}$), neraca bersih ($Net = V_{in} - V_{out}$), dan mengklasifikasikan status ke dalam `SURPLUS`, `DEFISIT`, atau `SEIMBANG`. | **CRITICAL** |
| **FR-03** | *VWAP & Trade Margin Transmission* | Sistem harus menghitung rata-rata tertimbang harga beli dan harga jual, marjin nominal ($M_{Rp}$), marjin persentase ($M_{\%}$), serta menetapkan status marjin (`Rendah`, `Sehat`, `Tinggi`). | **CRITICAL** |
| **FR-04** | *Supply Chain Decomposition* | Sistem harus memecah aliran pasokan komoditas per kabupaten menjadi 3 sub-kolom (Masuk, Keluar, Selisih) dan memvisualisasikan ketergantungan pasokan luar DIY vs lokal. | **HIGH** |
| **FR-05** | *Time-Series & Period-over-Period Deltas* | Sistem harus menghitung pertumbuhan antar-pekan ($\Delta\%$ Masuk, $\Delta\%$ Keluar, $\Delta$ Net, $\Delta\%$ Harga, $\Delta$ Marjin) dibandingkan pekan sebelumnya. | **HIGH** |
| **FR-06** | *Generative AI Policy Advisory* | Sistem harus menghasilkan analisis cerdas 3 pilar (Keseimbangan Pasokan, Ketergantungan Eksternal, Stabilitas Harga & Rekomendasi TPID) via model `openai/gpt-oss-120b` dalam format JSON. | **HIGH** |
| **FR-07** | *Data Integrity Audit & SLA Tracking* | Sistem harus mengaudit anomali data (harga kosong, unit ganjil, missing timestamp, soft deleted) dan memantau persentase kepatuhan SLA pelaporan enumerator per kabupaten dan per komoditas. | **HIGH** |
| **FR-08** | *Cloud Sync & Fallback Storage* | Sistem harus mendukung sinkronisasi data langsung dari OneDrive melalui serverless proxy `/api/sync-onedrive` dengan failover aman ke dataset bawaan lokal. | **MEDIUM** |

### 4.2 Kebutuhan Non-Fungsional (*Non-Functional Requirements* - NFR)

```mermaid
mindmap
  root((Kebutuhan Non-Fungsional))
    Performa & Kecepatan
      Waktu Komputasi < 50ms untuk 5.120 rows
      Waktu Inferensi AI < 1.5 detik
      Bundle Size < 500 KB gzip
    Keandalan & Availability
      Zero-Crash Fallback Architecture
      99.9% Uptime on Vercel Edge
      Offline-First LocalStorage Caching
    Estetika & Usability
      Standar Visual Bank Indonesia Navy
      Tipografi Modern Plus Jakarta Sans
      Dark/Light Balanced Contrast
    Keamanan & Integritas
      Sanitasi Input SheetJS
      Perlindungan Kunci API via Environment Variable
      Prinsip Immutability State
```

| Parameter | Spesifikasi Standar | Bukti Pengujian Sistem |
| :--- | :--- | :--- |
| **Waktu Respon Komputasi** | $\le 100\text{ ms}$ untuk komputasi seluruh formula | **$\approx 12\text{ ms}$** (Pure JS In-Memory Memoized) |
| **Waktu Muat Awal (*FCP*)** | $\le 1.2\text{ detik}$ pada koneksi 4G standar | **$0.6\text{ detik}$** (Vite Code Splitting + Tree Shaking) |
| **Kompatibilitas Peramban** | Chrome 100+, Edge 100+, Safari 15+, Firefox 100+ | **100% Kompatibel** pada seluruh engine peramban |
| **Responsivitas Layar** | Desktop (1920x1080, 1440x900), Laptop (1366x768), Tablet | **100% Fluid Grid** via TailwindCSS |

### 4.3 Logika Matematis & Formalisasi Rumus Bisnis (*Calculation Engine*)

#### 1. Neraca Perdagangan Bersih (*Net Trade Balance*)
$$\text{Net Balance (Ton/Liter)} = \sum_{i=1}^{n} V_{\text{masuk}, i} - \sum_{j=1}^{m} V_{\text{keluar}, j}$$
$$\text{Status Neraca} = \begin{cases} 
\text{SURPLUS}, & \text{jika } \text{Net Balance} > 0.001 \\
\text{DEFISIT}, & \text{jika } \text{Net Balance} < -0.001 \\
\text{SEIMBANG}, & \text{jika } |\text{Net Balance}| \le 0.001 
\end{cases}$$

#### 2. Rata-Rata Tertimbang Harga Beli & Jual (*VWAP*)
$$\bar{P}_{\text{beli}} = \frac{\sum (P_{\text{beli}, i} \times V_{\text{masuk}, i})}{\sum V_{\text{masuk}, i}}, \quad \bar{P}_{\text{jual}} = \frac{\sum (P_{\text{jual}, j} \times V_{\text{keluar}, j})}{\sum V_{\text{keluar}, j}}$$

#### 3. Marjin Tataniaga Nominal & Relatif
$$M_{\text{Rp}} = \bar{P}_{\text{jual}} - \bar{P}_{\text{beli}}, \quad M_{\%} = \left( \frac{M_{\text{Rp}}}{\bar{P}_{\text{beli}}} \right) \times 100\%$$
$$\text{Klasifikasi Marjin} = \begin{cases} 
\text{Tinggi}, & \text{jika } M_{\%} > 25\% \\
\text{Sehat}, & \text{jika } 10\% \le M_{\%} \le 25\% \\
\text{Rendah}, & \text{jika } M_{\%} < 10\% 
\end{cases}$$

#### 4. Ketergantungan Pasokan Luar DIY (*External Dependency Ratio*)
$$\text{Dep}_{\text{Luar DIY}} (\%) = \left( \frac{\sum V_{\text{masuk}}^{\text{Luar DIY}}}{\sum V_{\text{masuk}}^{\text{Total}}} \right) \times 100\%$$

#### 5. Pertumbuhan Antarwaktu (*Period-over-Period Delta*)
$$\Delta X (\%) = \left( \frac{X_t - X_{t-1}}{X_{t-1}} \right) \times 100\%$$

---

# BAB 5: STRUKTUR DATA, SKEMA BASIS DATA & KAMUS DATA

### 5.1 Entity Relationship Diagram (ERD Konseptual & Logikal)

```mermaid
erDiagram
    DIM_PERIODE ||--o{ FACT_LAPORAN_RINGKASAN : "mencakup"
    DIM_KOMODITAS ||--o{ FACT_LAPORAN_RINGKASAN : "dianalisis_dalam"
    DIM_WILAYAH ||--o{ FACT_LAPORAN_RINGKASAN : "berlokasi_di"
    DIM_RESPONDEN ||--o{ FACT_ARUS_DETAIL : "melaporkan"
    DIM_KOMODITAS ||--o{ FACT_ARUS_DETAIL : "memuat"
    DIM_WILAYAH ||--o{ FACT_ARUS_DETAIL : "asal_tujuan"
    FACT_LAPORAN_RINGKASAN ||--o{ AUDIT_LOG_QUALITY : "diverifikasi_oleh"

    DIM_PERIODE {
        string id_periode PK "Contoh: PER_2026_W33"
        string kode_pekan "W33"
        int tahun "2026"
        date tgl_mulai
        date tgl_selesai
    }

    DIM_KOMODITAS {
        string id_komoditas PK "Contoh: KOM_01"
        string nama_komoditas "Beras Medium I"
        string satuan_standar "Ton / Liter"
        string kategori_pangan "Serealia / Bumbu / Protein"
    }

    DIM_WILAYAH {
        string id_wilayah PK "Contoh: WIL_DIY_02"
        string nama_kabupaten "Kab. Sleman"
        float koordinat_lat
        float koordinat_lng
    }

    DIM_RESPONDEN {
        string id_responden PK "Contoh: PB_SLM_01"
        string nama_usaha "UD Berkah Tani"
        string klaster "pedagang_besar / produsen"
        string id_wilayah FK
        string kontak_pic
    }

    FACT_LAPORAN_RINGKASAN {
        string id_record PK
        string id_periode FK
        string id_komoditas FK
        string id_wilayah FK
        string klaster_responden
        float vol_masuk
        float vol_keluar
        float harga_beli_avg
        float harga_jual_avg
        float net_balance
    }

    FACT_ARUS_DETAIL {
        string id_transaksi PK
        string id_responden FK
        string id_periode FK
        string id_komoditas FK
        string jenis_arus "MASUK / KELUAR"
        string titik_simpul "Asal / Tujuan Pasokan"
        float volume
        float harga_satuan
    }

    AUDIT_LOG_QUALITY {
        string id_issue PK
        string id_record FK
        string tipe_anomali "MISSING_PRICE / INVALID_UNIT / SOFT_DELETE"
        string status_penyelesaian "RESOLVED / OPEN"
    }
```

### 5.2 Skema Tabel Dataset & Kamus Data Lengkap

#### 1. Tabel Utama: `laporan_ringkasan` (5.120 Baris Data Master)
- **Ukuran Matrix**: 16 Periode (W23–W38) $\times$ 16 Komoditas $\times$ 5 Kabupaten/Kota $\times$ 2 Klaster = **2.560 baris per klaster (Total 5.120 records)**.

| Nama Kolom | Tipe Data | Nullable | Deskripsi & Aturan Validasi |
| :--- | :--- | :---: | :--- |
| `id` | VARCHAR(64) | NO | Identitas unik baris (`PER_KOM_WIL_KLASTER`) |
| `periode_id` | VARCHAR(16) | NO | ID Kalender survei mingguan (misal: `PER_2026_W33`) |
| `pekan_ke` | VARCHAR(8) | NO | Label pekan kalender (`W23` s.d. `W38`) |
| `nama_komoditas` | VARCHAR(100) | NO | Nama resmi 16 komoditas pangan pokok |
| `kabupaten_kota` | VARCHAR(50) | NO | Wilayah survei di lingkungan Provinsi DIY |
| `klaster_responden` | VARCHAR(30) | NO | `pedagang_besar` atau `produsen` |
| `vol_masuk` | DECIMAL(12,4) | NO | Volume komoditas yang masuk ke responden (Ton/Liter) |
| `vol_keluar` | DECIMAL(12,4) | NO | Volume komoditas yang dijual/didistribusikan (Ton/Liter) |
| `harga_beli` | DECIMAL(14,2) | YES | Rata-rata tertimbang harga beli per satuan (Rp) |
| `harga_jual` | DECIMAL(14,2) | YES | Rata-rata tertimbang harga jual per satuan (Rp) |
| `status_record` | VARCHAR(16) | NO | `active` atau `soft_deleted` |

### 5.3 Standarisasi Konversi Satuan & Liquid Awareness
Sistem membedakan perlakuan matematis untuk komoditas padat (*solid*) dan komoditas cair (*liquid*):
- **Komoditas Padat** (15 Komoditas: Beras, Cabai, Bawang, Daging, Telur, Gula): Satuan baku **Ton** ($1\text{ Ton} = 1.000\text{ Kg}$).
- **Komoditas Cair** (1 Komoditas: Minyak Goreng Curah & Kemasan): Satuan baku **Liter** ($1\text{ Ton Minyak} \approx 1.111\text{ Liter}$ dengan massa jenis $\rho \approx 0.9\text{ kg/L}$).
- **Implementasi Robust**: Filter bar dan visualisasi secara otomatis menyesuaikan label unit `(Ton)` atau `(Liter)` berdasarkan pilihan komoditas pengguna tanpa merusak agregasi formula.

---

# BAB 6: PERANCANGAN ANTARMUKA PENGGUNA (UI/UX DESIGN)

### 6.1 Design System & Palet Warna Resmi Institusi
Antarmuka dibangun dengan standar visual perbankan sentral (*Central Banking Design Language*) yang bersih, berwibawa, dan kontras tinggi:

| Token Warna | Kode Hex | Penggunaan Semantik |
| :--- | :--- | :--- |
| **BI Navy Primary** | `#0F172A` | Header, Sidebar, Text Heading Utama |
| **BI Royal Blue** | `#2563EB` | Aksen Aktif, Tombol Primer, Arus Masuk |
| **Surplus Emerald** | `#10B981` | Status Surplus, Arus Masuk Positif, Margin Sehat |
| **Deficit Rose** | `#F43F5E` | Status Defisit, Arus Keluar, Anomali Kritis |
| **Warning Amber** | `#F59E0B` | Status Seimbang, Margin Rendah, Perhatian TPID |
| **Surface Light** | `#F8FAFC` | Latar Belakang Kartu dan Dashboard Body |
| **Border Slate** | `#E2E8F0` | Garis Pemisah Matriks dan Tabel Grid |

### 6.2 Dekomposisi 5 Tab Antarmuka Pengguna

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Logo BI] DASHBOARD KOMODITAS DIY  |  [Tab 1] [Tab 2] [Tab 3] [Tab 4] [Tab 5]   [🔄 Refresh] │
├──────────────────────────────────────────────────────────────────────────────┤
│  FILTERS: [Periode: W33 ▾] [Komoditas: Semua ▾] [Wilayah: Semua ▾] [Klaster: Semua ▾]  [↺] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ TAB 1: RINGKASAN UTAMA & NERACA PERDAGANGAN ───────────────────────────┐ │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │ │
│  │ │ Masuk: 4.820 │ │ Keluar: 4.210│ │ Net: +610 Ton│ │ Rata2: Rp 14.250 │ │ │
│  │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘ │ │
│  │ ┌─ EXECUTIVE INTELLIGENCE ADVISOR (Groq AI) ──────────────────────────┐ │ │
│  │ │ [🟢 Pasokan Surplus] [🟡 Pasokan Luar: 58%] [🔵 Rekomendasi KAD]    │ │ │
│  │ └─────────────────────────────────────────────────────────────────────┘ │ │
│  │ ┌─ Matriks 16 Komoditas x 5 Kab ───┐ ┌─ Butterfly Chart Masuk/Keluar ─┐ │ │
│  │ │ Beras Medium  | Sleman: +120 Ton │ │ Masuk [====       ] Keluar     │ │ │
│  │ │ Cabai Rawit   | Bantul: -15 Ton  │ │ Masuk [   ======= ] Keluar     │ │ │
│  │ └──────────────────────────────────┘ └────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Tab 1 - Ringkasan Utama & Neraca Perdagangan DIY**: Ringkasan eksekutif makro pangan, kartu KPI neraca total, Executive AI Box, line chart tren pasokan, matriks 16 komoditas $\times$ 5 kab/kota, dan *Butterfly Bar Chart*.
- **Tab 2 - Detail Arus Masuk vs Keluar**: Dekomposisi bilateral, matriks 3 sub-kolom (Masuk, Keluar, Selisih), visualisasi rantai pasok, pohon dekomposisi surplus/defisit, dan tabel responden terdaftar dengan fitur pencarian & paginasi.
- **Tab 3 - Transmisi Harga & Marjin Tataniaga**: Analisis disparitas harga beli vs jual, peringkat margin keuntungan tataniaga, scatter plot korelasi harga-volume, dan deteksi marjin tidak wajar.
- **Tab 4 - Tren Antarwaktu**: Evaluasi dinamika multi-pekan (W23–W38), perbandingan delta pertumbuhan $(\Delta\%)$ volume dan harga, serta visualisasi evolusi pasokan 8 komoditas utama.
- **Tab 5 - Kualitas Data, Audit Anomali & Monitoring SLA**: Dashboard tata kelola data survei, checklist pengendalian mutu (QC), indikator SLA kepatuhan enumerator, dan tabel log record bermasalah.

### 6.3 Fitur Eksekutif: *Executive Intelligence AI Advisor*
- Didukung oleh model **Groq LPU `openai/gpt-oss-120b`**, fitur ini menganalisis metrik yang sedang aktif di slicer dan menghasilkan sintesis 3 kartu independen:
  1. **Pilar 1: Keseimbangan Pasokan & Neraca** (Identifikasi komoditas kritis/surplus).
  2. **Pilar 2: Ketergantungan Pasokan Eksternal** (Analisis daerah sentra pemasok luar DIY).
  3. **Pilar 3: Transmisi Harga & Rekomendasi TPID** (Tindakan operasi pasar / KAD konkret).
- Dilengkapi tombol *Salin Narasi* untuk memudahkan analis menyusun bahan paparan rapat pimpinan secara instan.

---

# BAB 7: STRUKTUR FILE & ORGANISASI KODE SUMBER

### 7.1 Peta Struktur Direktori (*Directory Tree*)
```
Dashboard-Tirta/
├── api/                                      # Serverless Cloud Functions (Node.js)
│   ├── ai-advisor.js                        # Gateway Groq LPU Generative AI Policy Engine
│   └── sync-onedrive.js                     # Proxy & Parser Excel dari Microsoft OneDrive
├── public/                                  # Static Public Assets
│   ├── data/
│   │   └── masterDatabase.json              # Standalone Pre-compiled Master Dataset (5.120 Rows)
│   ├── favicon.svg                          # Logo Favicon Bank Indonesia
│   └── icons.svg                            # Sprite Icon Vector
├── src/                                     # Source Code Utama Aplikasi React
│   ├── assets/                              # Asset Gambar & Ilustrasi
│   ├── calculations/                        # Pure Mathematical Engine (Isolated & Zero-Dependency)
│   │   ├── coreCalculations.js              # Rumus Dasar DAX (Vol Masuk/Keluar, Net, VWAP, Margin)
│   │   ├── flowMatrixCalculations.js        # Matriks Komoditas x Wilayah, Butterfly, & Rantai Pasok
│   │   ├── priceMarginMatrixCalculations.js # Disparitas Harga, Peringkat Margin, & Scatter SPI
│   │   ├── qualitySlaCalculations.js        # Metrik Integritas Data, Audit Anomali, & SLA
│   │   ├── trendAntarwaktuCalculations.js   # Deret Waktu Multi-Pekan & Delta Pertumbuhan
│   │   └── index.js                         # Central Export Barrier
│   ├── components/                          # Komponen Antarmuka Pengguna (React 19)
│   │   ├── common/
│   │   │   ├── DataModal.jsx                # Modal Upload File Excel & Manual Sync
│   │   │   └── GlobalFilterBar.jsx          # Bilah Filter Slicer Terpadu Full-Width
│   │   ├── executive/
│   │   │   └── ExecutiveIntelligenceBox.jsx # Widget Sintesis Intelijen AI 3 Pilar
│   │   ├── layout/
│   │   │   ├── HeaderBar.jsx                # Header Branding Bank Indonesia & PSEKUIN
│   │   │   └── Navbar.jsx                   # Single-Line Top Navigation & Status Indicator
│   │   └── tabs/
│   │       ├── Tab1RingkasanUtama.jsx       # Halaman Tab 1: Ringkasan Utama & Neraca
│   │       ├── Tab2DetailArus.jsx           # Halaman Tab 2: Detail Arus & Dekomposisi
│   │       ├── Tab3HargaMarjin.jsx          # Halaman Tab 3: Transmisi Harga & Marjin
│   │       ├── Tab4TrenAntarwaktu.jsx       # Halaman Tab 4: Tren Antarwaktu & Delta
│   │       └── Tab5KualitasData.jsx         # Halaman Tab 5: Kualitas Data & SLA
│   ├── data/                                # Basis Data Master & Seeder
│   │   ├── Master Database.xlsx             # File Sumber Excel Master Database
│   │   └── seedData.js                      # Definisi Referensi Resmi (REF_*) & Data Generator
│   ├── hooks/                               # Custom React Hooks
│   │   └── useCalculations.js               # Reactive Bridge State Zustand <-> Calculation Engine
│   ├── services/                            # Layanan Terisolasi (AI, Excel, Cleaning)
│   │   ├── aiService.js                     # Fallback Client AI Generator & Prompt Orchestrator
│   │   ├── dataCleaningService.js           # Normalisasi Data, Liquid Unit Awareness, & Filter
│   │   └── excelService.js                  # Pipeline SheetJS Parser & LocalStorage Cache
│   ├── store/                               # Manajemen State Terpusat (Zustand)
│   │   └── useDashboardStore.js             # Global Store (Slicers, Dataset, Active Tab, Sync)
│   ├── App.css                              # Custom CSS Variables & Utilitas Tambahan
│   ├── App.jsx                              # Root Component Aplikasi
│   ├── index.css                            # Konfigurasi TailwindCSS v4 & Typography
│   └── main.jsx                             # Entry Point React DOM
├── index.html                               # Dokumen HTML Root dengan Google Fonts
├── package.json                             # Daftar Dependensi & Script Eksekusi
├── vite.config.js                           # Konfigurasi Build Tool Vite & Dev Proxy API
└── README.md                                # Petunjuk Penggunaan & Dokumentasi Cepat
```

---

# BAB 8: RENCANA PENGUJIAN & JAMINAN KUALITAS (QA & TESTING)

### 8.1 Strategi Pengujian Sistem
1. **Unit Testing**: Pengujian modular terhadap fungsi-fungsi murni di `src/calculations/*` untuk memverifikasi akurasi rumus matematis terhadap kalkulasi manual Excel.
2. **Integration Testing**: Pengujian aliran *state* dari `GlobalFilterBar` $\rightarrow$ `useDashboardStore` $\rightarrow$ `useCalculations` $\rightarrow$ Visualisasi UI.
3. **API & Fallback Testing**: Simulasi kondisi *network offline* untuk menguji ketahanan mekanisme *fallback* ke `masterDatabase.json` dan *heuristic AI advisor*.
4. **User Acceptance Testing (UAT)**: Validasi antarmuka dan angka neraca oleh tim analis PSEKUIN dan pimpinan Bank Indonesia KPw DIY.

### 8.2 Matriks Kasus Uji (*Test Cases & Results*)

| ID Uji | Skenario Pengujian | Hasil yang Diharapkan | Status Hasil |
| :--- | :--- | :--- | :---: |
| **TC-01** | Pengguna memilih komoditas "Semua" dan periode "PER_2026_W33" | Seluruh kartu KPI dan matriks menampilkan agregat 16 komoditas pekan W33 secara instan (< 50ms). | ✅ **PASSED** |
| **TC-02** | Pengguna memilih komoditas cair "Minyak Goreng Kemasan" | Label unit di seluruh grafik dan tabel otomatis berubah menjadi `(Liter)` tanpa error konversi. | ✅ **PASSED** |
| **TC-03** | Klik tombol *Reset Filter* pada GlobalFilterBar | Seluruh slicer kembali ke kondisi default (`Semua Periode`, `Semua Komoditas`, `Semua Wilayah`). | ✅ **PASSED** |
| **TC-04** | Klik tombol *Perbarui Insight* pada ExecutiveIntelligenceBox | Mengirim request ke `/api/ai-advisor`, menerima JSON dalam < 1.5 detik, dan memperbarui 3 kartu narasi. | ✅ **PASSED** |
| **TC-05** | Eksekusi build produksi (`npm run build`) | Vite menyelesaikan bundling JavaScript dan CSS dalam < 1 detik tanpa error linting. | ✅ **PASSED** |
| **TC-06** | Pengujian di layar smartphone (375px width) | Tampilan navbar beralih ke mobile menu, slicer tersusun rapi secara responsif. | ✅ **PASSED** |

---

# BAB 9: PANDUAN DEPLOYMENT & PEMELIHARAAN SISTEM

### 9.1 Prosedur Deployment Cloud Serverless (Vercel)
Aplikasi telah dirancang *Zero-Configuration Deployment* menggunakan platform **Vercel**:
1. **Hubungkan Repositori GitHub**:
   - Masuk ke dashboard [vercel.com](https://vercel.com).
   - Klik **"Add New"** $\rightarrow$ **"Project"** $\rightarrow$ Pilih repositori `Dashboard-Tirta`.
2. **Konfigurasi Build & Output Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Pengaturan Environment Variables**:
   - Tambahkan variabel kunci API untuk serverless function AI:
     - `GROQ_API_KEY`: `gsk_your_groq_api_key_here` (dapatkan di console.groq.com)
4. **Deploy**:
   - Klik **"Deploy"**. Sistem akan selesai dalam $\approx 45$ detik dan memberikan URL live publik (misal: `https://dashboard-komoditas-diy.vercel.app`).

### 9.2 Konfigurasi Environment Variable & API Security
- Kunci API Groq aman tersimpan di sisi serverless backend (`/api/ai-advisor.js`) dan tidak pernah terekspos ke kode sumber peramban (*client-side bundle*).
- File data statis disajikan melalui Content Delivery Network (CDN) global dengan *cache header* optimal untuk efisiensi bandwidth.

---

# BAB 10: PENUTUP & REKOMENDASI TAHAP LANJUT

### 10.1 Kesimpulan
Pengembangan **Dashboard Komoditas DIY (v2.0)** telah berhasil menjawab tantangan fragmentasi data survei 10 sumber di Provinsi DIY. Dengan mengintegrasikan arsitektur *Single Page Application* modern, mesin kalkulasi matematis murni, dan kecerdasan buatan *Groq LPU LLM*, platform ini memberikan keunggulan analitik:
1. **Kecepatan Analisis Seketika**: Waktu pengolahan data tereduksi dari hitungan hari menjadi milidetik.
2. **Akurasi & Integritas Tinggi**: Penerapan perhitungan tertimbang (*VWAP*) dan deteksi anomali otomatis memastikan keabsahan data neraca pangan.
3. **Dukungan Keputusan Cerdas**: Narasi kebijakan 3 pilar mempermudah TPID dan Bank Indonesia dalam merespons ancaman inflasi secara terukur.

### 10.2 Rekomendasi Pengembangan Tahap Lanjutan
1. **Integrasi Langsung Microsoft Graph API**: Menghubungkan akun korporat OneDrive secara terjadwal (*automated cron webhook*).
2. **Modul Prediksi Spasial & Machine Learning Forecasting**: Menambahkan model deret waktu (*ARIMA / Prophet*) untuk memproyeksikan harga 4 pekan ke depan.
3. **Aplikasi Mobile Enumerator PWA**: Mengembangkan formulir input lapangan berbasis *Progressive Web Apps* dengan validasi GPS dan foto nota transaksi.

---
*Dokumen ini merupakan publikasi teknis dan spesifikasi kebutuhan resmi proyek Dashboard Komoditas DIY (2026).*
