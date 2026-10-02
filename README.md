# 🏛️ TIRTA Dashboard — Arsitektur & Panduan Pengembang
**Bank Indonesia KPw DIY · TPID DIY · PSEKUIN UPN Veteran Yogyakarta**

> Versi: 1.0.0 · Desember 2026

---

## 📁 Struktur Proyek

```
Dashboard-Tirta/
│
├── 📄 .env                        ← RAHASIA — Diproteksi .gitignore
├── 📄 .env.example                ← Template .env (aman di-push ke GitHub)
├── 📄 .gitignore                  ← Melindungi .env, dist, file Excel data
│
├── 📁 api/                        ← Vercel Serverless Functions
│   ├── sync-onedrive.js           ← Proxy fetch Excel dari OneDrive (Database 1)
│   └── ai-advisor.js              ← Groq LLM Policy Advisor API
│
├── 📁 public/data/
│   └── masterDatabase.json        ← Static fallback (tidak di-push ke Git)
│
└── 📁 src/
    ├── 📁 config/
    │   └── env.js                 ← ⭐ SINGLE SOURCE OF TRUTH untuk semua env + constants
    │
    ├── 📁 services/
    │   ├── excelService.js        ← Parser Excel, OneDrive fetch, caching localStorage
    │   ├── dataCleaningService.js ← Validasi & pembersihan data mentah
    │   └── aiService.js           ← Groq LLM integration (client-side call)
    │
    ├── 📁 store/
    │   └── useDashboardStore.js   ← Zustand global state (2 database terpisah)
    │
    ├── 📁 calculations/
    │   ├── index.js               ← Re-export semua modul kalkulasi
    │   ├── coreCalculations.js    ← KPI, neraca, margin, matcher utilities
    │   ├── flowMatrixCalculations.js
    │   ├── priceMarginMatrixCalculations.js
    │   ├── trendAntarwaktuCalculations.js
    │   ├── qualitySlaCalculations.js
    │   └── ewsCalculations.js     ← EWS/ALPS risk engine (Tab 7, independen)
    │
    ├── 📁 hooks/
    │   └── useCalculations.js     ← Custom hook: Zustand state → Calculation engine
    │
    ├── 📁 data/
    │   └── seedData.js            ← Reference data (REF_KOMODITAS, REF_KALENDER, dst.)
    │
    ├── 📁 components/
    │   ├── 📁 common/
    │   │   ├── DataModal.jsx      ← Modal 2 database: Master Komoditas + EWS Alert
    │   │   ├── PasswordModal.jsx  ← PIN auth menggunakan SHA-256 dari .env
    │   │   └── GlobalFilterBar.jsx
    │   ├── 📁 layout/
    │   │   ├── Navbar.jsx         ← 7 Tab navigasi
    │   │   └── HeaderBar.jsx
    │   └── 📁 tabs/
    │       ├── Tab1RingkasanUtama.jsx
    │       ├── Tab2DetailArus.jsx
    │       ├── Tab3HargaMarjin.jsx
    │       ├── Tab4TrenAntarwaktu.jsx
    │       ├── Tab5PetaArus.jsx
    │       ├── Tab5KualitasData.jsx   ← Tab 6: Kualitas Data & Audit
    │       └── Tab7EarlyWarningSystem.jsx ← Tab 7: EWS Standalone
    │
    └── App.jsx                    ← Routing tab utama
```

---

## 🔄 Alur Data (Flow) — End to End

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER ACTION: Buka Dashboard / Klik "Sinkron Data"                          │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  useDashboardStore   │ ← Zustand Global State
                    │  loadInitialData()   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────────┐
              │ Database 1     │ Database 2           │
              │ (Tab 1–6)      │ (Tab 7 EWS)          │
              ▼                │                      │
    ExcelService               │                      │
    .fetchMasterDatabase()     │                      │
         │                     │                      │
         ├─► /api/sync-onedrive (Vercel)              │
         ├─► /public/data/masterDatabase.json         │
         ├─► localStorage cache                       │
         └─► Seed Data (fallback)                     │
                               │                      │
                               ▼                      │
                   importEwsExcelBuffer() / refreshEwsData()
                   ExcelService.parseEwsExcelBuffer() │
                   → ewsDatabase state                │
                               │                      │
              └────────────────┴──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   useCalculations   │ ← Custom Hook
                    │   (useMemo heavy)   │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────────┐
           │                   │                        │
           ▼                   ▼                        ▼
    calculations/*      ewsCalculations.js      qualitySlaCalculations.js
    (Tab 1–5)          (Tab 7 EWS standalone)   (Tab 6 Kualitas)
           │
           ▼
    Tab Components (UI) → Recharts / Leaflet / HTML Table
```

---

## 🔐 Sistem Keamanan & Kredensial

### Kredensial yang Dikelola di `.env`

| Variabel | Keterangan | Default |
|---|---|---|
| `VITE_ONEDRIVE_MASTER_URL` | URL OneDrive Database 1 (Arus Komoditas) | *(kosong → fallback seed)* |
| `VITE_ONEDRIVE_EWS_URL` | URL OneDrive Database 2 (EWS Alert) | *(kosong → fallback seed)* |
| `VITE_ADMIN_PIN_HASH` | SHA-256 hash PIN Admin | hash `tpid2026` |
| `GROQ_API_KEY` | API Key Groq untuk AI Advisor (server-side only) | *(kosong)* |
| `GROQ_API_KEY_SECONDARY` | API Key Groq cadangan | *(kosong)* |

> **⚠️ PENTING:** File `.env` **TIDAK AKAN** masuk GitHub karena sudah dilindungi `.gitignore`.
> Template aman tersedia di `.env.example` — gunakan itu saat onboarding developer baru.

### Cara Ganti PIN Admin
1. Buka: https://emn178.github.io/online-tools/sha256.html
2. Masukkan PIN baru (huruf kecil semua)
3. Salin hash SHA-256 yang dihasilkan
4. Set di `.env`: `VITE_ADMIN_PIN_HASH=<hash_baru>`
5. Restart dev server (`npm run dev`)

---

## 🗄️ Dua Database Terpisah (Arsitektur Utama)

| Aspek | Database 1 — Arus Komoditas | Database 2 — EWS Alert |
|---|---|---|
| **File Excel** | Master Database Komoditas DIY | Dashboard ALPS EWS DIY PIHPS |
| **Tab yang dipakai** | Tab 1–6 | Tab 7 saja |
| **State Zustand** | `data` | `ewsDatabase` |
| **Cross-filtering** | Ya — filter global berlaku | **TIDAK** — filter independen lokal |
| **Sinkronisasi** | `refreshData()` / `importExcelBuffer()` | `refreshEwsData()` / `importEwsExcelBuffer()` |
| **Fallback** | Seed data `generateMasterDataset()` | Seed data `generateDefaultEwsData()` |

---

## 🚀 Cara Menjalankan Lokal

```bash
# 1. Clone & install
npm install

# 2. Setup environment
cp .env.example .env
# → Isi nilai VITE_ONEDRIVE_MASTER_URL, VITE_ONEDRIVE_EWS_URL, dll.

# 3. Jalankan dev server
npm run dev
# → Dashboard berjalan di http://localhost:5173

# 4. Build production
npm run build
```

---

## 📤 Deploy ke Vercel

```bash
# Set environment variables di Vercel Dashboard:
# GROQ_API_KEY=<key>
# GROQ_API_KEY_SECONDARY=<key>
# ONEDRIVE_EXCEL_URL=<url-master>
#
# VITE_ variables juga perlu di-set di Vercel untuk frontend build:
# VITE_ONEDRIVE_MASTER_URL, VITE_ONEDRIVE_EWS_URL, VITE_ADMIN_PIN_HASH
```

> **Catatan:** Vercel Serverless (`api/*.js`) membaca `process.env.*`.  
> Frontend React membaca `import.meta.env.VITE_*`.

---

## 🧩 Panduan Menambah Komoditas Baru di EWS

Di `ewsCalculations.js`, tambahkan item baru dalam array `ewsCommodities` di fungsi `generateDefaultEwsData()`:
```js
{ id: 'EWS_XX', komoditas: 'Nama Komoditas', heatmap_pb: 0, heatmap_pe: 0, heatmap_prod: 0, alps: 'NORMAL', current_pressure: 0, forecast_pressure: 0 },
```

Atau upload file Excel dengan sheet bernama `ews_heatmap` yang berisi kolom:
`komoditas | Heatmap_PB | Heatmap_PE | Heatmap_PROD | ALPS Komoditas | current_pressure | forecast_pressure`
