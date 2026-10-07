// Tab8Metadata.jsx
// Informasi Metadata, Metodologi Kajian, Spesifikasi Komoditas, & QC System
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta · Dashboard TIRTA 2026

import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Building2,
  PieChart,
  ShieldCheck,
  Scale,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Cpu,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

export function Tab8Metadata() {
  const [activeSection, setActiveSection] = useState('responden');
  const [searchCommodity, setSearchCommodity] = useState('');
  const [selectedKlasterTable, setSelectedKlasterTable] = useState('pedagang_besar');

  // Master Respondent Counts from Kajian Report
  const produsenData = [
    { komoditas: 'Beras', bantul: 0, gunungkidul: 1, yogyakarta: 0, kulonprogo: 1, sleman: 3, total: 5 },
    { komoditas: 'Daging Sapi', bantul: 0, gunungkidul: 0, yogyakarta: 0, kulonprogo: 1, sleman: 2, total: 3 },
    { komoditas: 'Daging Ayam Ras', bantul: 1, gunungkidul: 1, yogyakarta: 0, kulonprogo: 0, sleman: 2, total: 4 },
    { komoditas: 'Telur Ayam Ras', bantul: 1, gunungkidul: 3, yogyakarta: 0, kulonprogo: 1, sleman: 0, total: 5 },
    { komoditas: 'Bawang Merah', bantul: 1, gunungkidul: 1, yogyakarta: 0, kulonprogo: 0, sleman: 1, total: 3 },
    { komoditas: 'Bawang Putih', bantul: 0, gunungkidul: 0, yogyakarta: 0, kulonprogo: 0, sleman: 0, total: 0 },
    { komoditas: 'Cabai Merah Besar', bantul: 0, gunungkidul: 0, yogyakarta: 0, kulonprogo: 0, sleman: 0, total: 0 },
    { komoditas: 'Cabai Merah Keriting', bantul: 1, gunungkidul: 0, yogyakarta: 0, kulonprogo: 0, sleman: 2, total: 3 },
    { komoditas: 'Cabai Rawit Hijau', bantul: 0, gunungkidul: 0, yogyakarta: 0, kulonprogo: 0, sleman: 0, total: 0 },
    { komoditas: 'Cabai Rawit Merah', bantul: 1, gunungkidul: 1, yogyakarta: 0, kulonprogo: 0, sleman: 0, total: 2 },
    { komoditas: 'Minyak Goreng', bantul: 0, gunungkidul: 1, yogyakarta: 0, kulonprogo: 0, sleman: 0, total: 1 },
    { komoditas: 'Gula Pasir', bantul: 1, gunungkidul: 1, yogyakarta: 0, kulonprogo: 0, sleman: 1, total: 3 },
  ];

  const pedagangBesarData = [
    { komoditas: 'Beras', bantul: 3, gunungkidul: 3, yogyakarta: 4, kulonprogo: 1, sleman: 3, total: 14 },
    { komoditas: 'Daging Sapi', bantul: 2, gunungkidul: 3, yogyakarta: 3, kulonprogo: 2, sleman: 3, total: 13 },
    { komoditas: 'Daging Ayam Ras', bantul: 3, gunungkidul: 3, yogyakarta: 3, kulonprogo: 3, sleman: 3, total: 15 },
    { komoditas: 'Telur Ayam Ras', bantul: 3, gunungkidul: 3, yogyakarta: 3, kulonprogo: 2, sleman: 3, total: 14 },
    { komoditas: 'Bawang Merah', bantul: 3, gunungkidul: 3, yogyakarta: 3, kulonprogo: 2, sleman: 3, total: 14 },
    { komoditas: 'Bawang Putih', bantul: 3, gunungkidul: 3, yogyakarta: 2, kulonprogo: 2, sleman: 3, total: 13 },
    { komoditas: 'Cabai Merah Besar', bantul: 2, gunungkidul: 3, yogyakarta: 1, kulonprogo: 0, sleman: 3, total: 9 },
    { komoditas: 'Cabai Merah Keriting', bantul: 3, gunungkidul: 3, yogyakarta: 3, kulonprogo: 3, sleman: 3, total: 15 },
    { komoditas: 'Cabai Rawit Hijau', bantul: 3, gunungkidul: 3, yogyakarta: 2, kulonprogo: 2, sleman: 3, total: 13 },
    { komoditas: 'Cabai Rawit Merah', bantul: 3, gunungkidul: 3, yogyakarta: 1, kulonprogo: 1, sleman: 3, total: 11 },
    { komoditas: 'Minyak Goreng', bantul: 3, gunungkidul: 3, yogyakarta: 1, kulonprogo: 2, sleman: 3, total: 12 },
    { komoditas: 'Gula Pasir', bantul: 3, gunungkidul: 3, yogyakarta: 3, kulonprogo: 3, sleman: 3, total: 15 },
  ];

  const komoditasSpecs = [
    {
      id: 1,
      nama: 'Beras',
      spesifikasi: '6 Jenis varian terbanyak dikonsumsi: 2 Kualitas Bawah (Bawah I & II), 2 Kualitas Medium (Medium I & II), dan 2 Kualitas Premium/Super (Super I & II).',
      satuan: 'kg / ton',
      pemasokUtama: 'Produsen & Pengepul Lokal/Regional (Sleman, Klaten, Sragen)',
      karakteristik: 'Kebutuhan utama rumah tangga; segmen Medium I & II paling dominan dalam volume transaksi.'
    },
    {
      id: 2,
      nama: 'Bawang Merah',
      spesifikasi: 'Bawang merah lokal kualitas sedang (segar).',
      satuan: 'kg / ton',
      pemasokUtama: 'Bima (NTB), Brebes, Nganjuk, Demak',
      karakteristik: 'Ketergantungan pasokan luar DIY tinggi (88.9%). Memiliki aktivitas transit/redistribusi besar.'
    },
    {
      id: 3,
      nama: 'Bawang Putih',
      spesifikasi: 'Bawang putih bonggol kualitas sedang.',
      satuan: 'kg / ton',
      pemasokUtama: 'Importir / Distributor Utama via Semarang & Surabaya',
      karakteristik: 'Ketergantungan luar DIY tertinggi (99.4%) dengan konsentrasi simpul asal sangat tinggi (HHI tinggi).'
    },
    {
      id: 4,
      nama: 'Cabai Merah (Besar & Keriting)',
      spesifikasi: 'Cabai merah besar & cabai merah keriting kualitas segar.',
      satuan: 'kg / ton',
      pemasokUtama: 'Produsen Lokal Sleman/Bantul & Pengepul Magelang/Banyuwangi',
      karakteristik: 'Pergerakan harga sangat volatil, daya simpan pendek, rentan gangguan cuaca dan musim.'
    },
    {
      id: 5,
      nama: 'Cabai Rawit (Merah & Hijau)',
      spesifikasi: 'Cabai rawit merah & cabai rawit hijau kualitas segar.',
      satuan: 'kg / ton',
      pemasokUtama: 'Pengepul & Pasar Induk (Sleman, Kediri, Blitar)',
      karakteristik: 'Didominasi saluran pengepul (55.4%); sensitivitas pasokan tinggi terhadap harga eceran.'
    },
    {
      id: 6,
      nama: 'Daging Sapi',
      spesifikasi: 'Daging sapi segar jenis has luar (sirloin) dan has dalam (tenderloin).',
      satuan: 'kg / ton',
      pemasokUtama: 'Peternak Lokal, RPH, & Distributor Daging Beku/Segar',
      karakteristik: 'Didominasi produsen/RPH langsung (92.9%); pergerakan arus relatif berimbang.'
    },
    {
      id: 7,
      nama: 'Daging Ayam Ras',
      spesifikasi: 'Daging ayam ras karkas/potongan segar.',
      satuan: 'kg / ekor / ton',
      pemasokUtama: 'Peternak Kemitraan & RPU Bantul/Sleman',
      karakteristik: 'Ditopang produksi lokal DIY (88% internal DIY); perputaran barang sangat cepat harian.'
    },
    {
      id: 8,
      nama: 'Telur Ayam Ras',
      spesifikasi: 'Telur ayam ras segar grade konsumsi.',
      satuan: 'kg / ton',
      pemasokUtama: 'Peternak Layer Sleman & Kulon Progo, Pasokan Blitar',
      karakteristik: 'Didominasi produsen langsung (97.9%); Sleman menjadi simpul pasokan terbesar.'
    },
    {
      id: 9,
      nama: 'Gula Pasir',
      spesifikasi: 'Gula pasir curah/kuning lokal dan gula pasir kemasan premium.',
      satuan: 'kg / ton',
      pemasokUtama: 'Pabrikan / Distributor Resmi via Surabaya & Central Java',
      karakteristik: 'Ketergantungan luar DIY tinggi (80.1%); rantai pasok terstruktur via distributor/agen.'
    },
    {
      id: 10,
      nama: 'Minyak Goreng',
      spesifikasi: 'Minyak goreng curah & kemasan premium/MinyaKita sesuai klasifikasi.',
      satuan: 'liter / ton (Konversi khusus)',
      pemasokUtama: 'Distributor Resmi Pabrikan (Semarang, Surabaya, D.I.Y)',
      karakteristik: 'Faktor konversi densitas khusus diperhitungkan; rantai pasok didominasi distributor & grosir.'
    }
  ];

  const filteredSpecs = komoditasSpecs.filter(c =>
    c.nama.toLowerCase().includes(searchCommodity.toLowerCase()) ||
    c.spesifikasi.toLowerCase().includes(searchCommodity.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Banner (Institutional Style) */}
      <div className="bg-gradient-to-r from-[#0A2E5C] via-[#0D3E77] to-[#1E74C7] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-[#C89B3C] text-[#0A2E5C] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
              Dokumen Referensi Resmi
            </span>
            <span className="bg-white/10 text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20">
              Kajian Aliran Komoditas DIY 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Metadata, Metodologi Kajian, & QC System
          </h1>
          <p className="text-sm text-[#DCEAFA] leading-relaxed max-w-3xl">
            Landasan metodologis, struktur kerangka sampel 185 responden panel, spesifikasi operasional 10 komoditas strategis, formulasi EWS, serta protokol pengendalian mutu data sebagai acuan analisis Pengendalian Inflasi Daerah (TPID DIY).
          </p>
        </div>
      </div>

      {/* 2. Key Metadata Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC] shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#F2F7FD] text-[#0D3E77] flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#1E74C7]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#101828]">185</div>
              <div className="text-xs font-semibold text-[#667085]">Total Responden Panel</div>
            </div>
          </div>
          <div className="text-[11px] text-[#475467] font-medium pt-2 border-t border-[#F2F4F7]">
            27 Produsen + 158 Pedagang Besar
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC] shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#166534] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-[#12B76A]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#101828]">10</div>
              <div className="text-xs font-semibold text-[#667085]">Komoditas Pangan</div>
            </div>
          </div>
          <div className="text-[11px] text-[#475467] font-medium pt-2 border-t border-[#F2F4F7]">
            Volatile & Administered Foods
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC] shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFFAEB] text-[#B54708] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-[#F79009]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#101828]">5</div>
              <div className="text-xs font-semibold text-[#667085]">Kabupaten / Kota</div>
            </div>
          </div>
          <div className="text-[11px] text-[#475467] font-medium pt-2 border-t border-[#F2F4F7]">
            Cakupan Intra & Ekstra DIY
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC] shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#F4F3FF] text-[#5925DC] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#7A5AF8]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#101828]">100%</div>
              <div className="text-xs font-semibold text-[#667085]">Quality Control Gate</div>
            </div>
          </div>
          <div className="text-[11px] text-[#475467] font-medium pt-2 border-t border-[#F2F4F7]">
            Validasi Stok & Witnessing Acak
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs within Metadata */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E7EC] pb-2">
        <button
          onClick={() => setActiveSection('responden')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'responden'
              ? 'bg-[#0D3E77] text-white shadow-xs'
              : 'bg-white text-[#475467] hover:bg-[#F9FAFB] border border-[#E4E7EC]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Cakupan Responden & Sampel</span>
        </button>

        <button
          onClick={() => setActiveSection('komoditas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'komoditas'
              ? 'bg-[#0D3E77] text-white shadow-xs'
              : 'bg-white text-[#475467] hover:bg-[#F9FAFB] border border-[#E4E7EC]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>2. Spesifikasi 10 Komoditas</span>
        </button>

        <button
          onClick={() => setActiveSection('metode')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'metode'
              ? 'bg-[#0D3E77] text-white shadow-xs'
              : 'bg-white text-[#475467] hover:bg-[#F9FAFB] border border-[#E4E7EC]'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>3. Formula EWS & Neraca Tataniaga</span>
        </button>

        <button
          onClick={() => setActiveSection('qc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'qc'
              ? 'bg-[#0D3E77] text-white shadow-xs'
              : 'bg-white text-[#475467] hover:bg-[#F9FAFB] border border-[#E4E7EC]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>4. Quality Control & Audit Trail</span>
        </button>
      </div>

      {/* SECTION 1: RESPONDEN & STRATEGI SAMPLING */}
      {activeSection === 'responden' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F2F4F7]">
              <div>
                <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1E74C7]" />
                  Distribusi Responden Panel Mingguan DIY (Tahun 2026)
                </h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Rincian sebaran sampel produsen dan pedagang besar di 5 Kabupaten/Kota DIY.
                </p>
              </div>

              {/* Toggle Klaster Table */}
              <div className="flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-xl border border-[#E4E7EC]">
                <button
                  onClick={() => setSelectedKlasterTable('pedagang_besar')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedKlasterTable === 'pedagang_besar'
                      ? 'bg-white text-[#0D3E77] shadow-xs'
                      : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  Pedagang Besar (158 PB)
                </button>
                <button
                  onClick={() => setSelectedKlasterTable('produsen')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedKlasterTable === 'produsen'
                      ? 'bg-white text-[#0D3E77] shadow-xs'
                      : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  Produsen (27 Usaha)
                </button>
              </div>
            </div>

            {/* Table Display */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#344054] font-bold border-b border-[#E4E7EC]">
                    <th className="py-3 px-4">Komoditas Strategis</th>
                    <th className="py-3 px-3 text-center">Bantul</th>
                    <th className="py-3 px-3 text-center">Gunungkidul</th>
                    <th className="py-3 px-3 text-center">Yogyakarta</th>
                    <th className="py-3 px-3 text-center">Kulon Progo</th>
                    <th className="py-3 px-3 text-center">Sleman</th>
                    <th className="py-3 px-4 text-center bg-[#F2F7FD] text-[#0D3E77]">Total Responden</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7] text-[#344054]">
                  {(selectedKlasterTable === 'pedagang_besar' ? pedagangBesarData : produsenData).map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-[#101828]">{row.komoditas}</td>
                      <td className="py-2.5 px-3 text-center">{row.bantul}</td>
                      <td className="py-2.5 px-3 text-center">{row.gunungkidul}</td>
                      <td className="py-2.5 px-3 text-center">{row.yogyakarta}</td>
                      <td className="py-2.5 px-3 text-center">{row.kulonprogo}</td>
                      <td className="py-2.5 px-3 text-center">{row.sleman}</td>
                      <td className="py-2.5 px-4 text-center font-bold bg-[#F8FAFC] text-[#0D3E77]">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#0A2E5C] text-white font-bold">
                    <td className="py-3 px-4">TOTAL RESPONDEN {selectedKlasterTable === 'pedagang_besar' ? 'PB' : 'PRODUSEN'}</td>
                    <td className="py-3 px-3 text-center">{selectedKlasterTable === 'pedagang_besar' ? 34 : 5}</td>
                    <td className="py-3 px-3 text-center">{selectedKlasterTable === 'pedagang_besar' ? 30 : 9}</td>
                    <td className="py-3 px-3 text-center">{selectedKlasterTable === 'pedagang_besar' ? 22 : 0}</td>
                    <td className="py-3 px-3 text-center">{selectedKlasterTable === 'pedagang_besar' ? 36 : 2}</td>
                    <td className="py-3 px-3 text-center">{selectedKlasterTable === 'pedagang_besar' ? 36 : 11}</td>
                    <td className="py-3 px-4 text-center bg-[#C89B3C] text-[#0A2E5C]">
                      {selectedKlasterTable === 'pedagang_besar' ? 158 : 27}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 bg-[#F2F7FD] border border-[#B3D4F2] rounded-xl text-xs text-[#0D3E77] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#1E74C7]" />
                Ketentuan Operasional Sampel (ToR Bank Indonesia KPw DIY)
              </div>
              <p className="text-[#344054] leading-relaxed">
                • <strong>Produsen</strong>: Minimal 3 data kuantitas per komoditas pada sentra produksi utama dengan target cakupan &ge; 80% volume produksi kabupaten/kota.<br />
                • <strong>Pedagang Besar (PB)</strong>: Minimal 3 data kuantitas per komoditas pada masing-masing kabupaten/kota tempat aktivitas komoditas tersedia.
              </p>
            </div>
          </div>

          {/* Sampling Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5 text-[#0D3E77] font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F2F7FD] flex items-center justify-center text-[#1E74C7]">
                  <Scale className="w-4 h-4" />
                </div>
                Certainty Selection (Pelaku Dominan)
              </div>
              <p className="text-xs text-[#475467] leading-relaxed">
                Digunakan untuk pelaku usaha skala besar dan distributor utama yang menguasai mayoritas arus barang. Certainty selection memastikan volume perdagangan utama tercakup penuh (&gt;80% pangsa pasar) sehingga tidak terlewat dalam estimasi agregat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5 text-[#0D3E77] font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-[#12B76A]">
                  <Layers className="w-4 h-4" />
                </div>
                Stratified & Snowball Sampling
              </div>
              <p className="text-xs text-[#475467] leading-relaxed">
                Digunakan untuk pelaku skala menengah dan kecil guna menangkap variasi saluran pemasaran, jaringan lokal, serta keragaman harga beli/jual di simpul-simpul distribusi sekunder di 5 Kabupaten/Kota.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SPESIFIKASI 10 KOMODITAS */}
      {activeSection === 'komoditas' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#101828]">Spesifikasi Operasional 10 Komoditas Strategis</h2>
                <p className="text-xs text-[#667085]">Definisi baku komoditas, pemasok utama, dan satuan pencatatan dalam Kajian TIRTA DIY 2026.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari komoditas..."
                  value={searchCommodity}
                  onChange={(e) => setSearchCommodity(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#0D3E77]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredSpecs.map((item) => (
                <div key={item.id} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E4E7EC] space-y-2 hover:border-[#B3D4F2] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#0D3E77]">{item.nama}</span>
                    <span className="text-[10px] font-bold bg-[#E0E2E5] text-[#344054] px-2 py-0.5 rounded-full uppercase">
                      Satuan: {item.satuan}
                    </span>
                  </div>
                  <p className="text-xs text-[#344054] leading-relaxed">
                    <strong>Spesifikasi:</strong> {item.spesifikasi}
                  </p>
                  <div className="text-[11px] text-[#475467] bg-white p-2.5 rounded-xl border border-[#EAECF0] space-y-1">
                    <div><strong>Sentra / Asal Utama:</strong> {item.pemasokUtama}</div>
                    <div className="text-[#667085]"><strong>Karakteristik Arus:</strong> {item.karakteristik}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FORMULA EWS & NERACA TATANIAGA */}
      {activeSection === 'metode' && (
        <div className="space-y-6">
          {/* Neraca Tataniaga Box */}
          <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#0D3E77]" />
              Kerangka Persamaan Neraca Tataniaga (Supply-Utilization Balance)
            </h2>
            <p className="text-xs text-[#667085]">
              Persamaan akuntansi fisik komoditas mingguan yang menghubungkan sumber pasokan dan penggunaan di wilayah DIY.
            </p>

            <div className="p-5 bg-[#0A2E5C] text-white rounded-2xl font-mono text-xs text-center leading-relaxed shadow-sm overflow-x-auto">
              <span className="text-[#FDB022] font-bold">PRODUKSI</span> + <span className="text-[#38BDF8] font-bold">ARUS MASUK</span> + <span className="text-[#4ADE80] font-bold">STOK AWAL</span> = <span className="text-[#F472B6] font-bold">PENGGUNAAN LOKAL</span> + <span className="text-[#FB923C] font-bold">ARUS KELUAR</span> + <span className="text-[#A78BFA] font-bold">SUSUT</span> + <span className="text-[#4ADE80] font-bold">STOK AKHIR</span> + <span className="text-[#F87171] font-bold">RESIDUAL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F2F7FD] border border-[#B3D4F2] rounded-xl space-y-1.5">
                <div className="font-bold text-[#0D3E77]">Arti & Fungsi Residual Neraca</div>
                <p className="text-[#344054] leading-relaxed">
                  Residual menunjukkan selisih pasokan dan pemanfaatan yang belum terjelaskan (misal: akibat unobserved trade, transaksi terhitung ganda, atau perbedaan konversi). Residual berfungsi sebagai <strong>Quality Gate</strong> akurasi data dashboard.
                </p>
              </div>

              <div className="p-4 bg-[#F0FDF4] border border-[#ABEFC6] rounded-xl space-y-1.5">
                <div className="font-bold text-[#12B76A]">Formula Selisih Neto (Net Flow)</div>
                <p className="text-[#344054] leading-relaxed">
                  <code className="bg-white px-1.5 py-0.5 rounded font-bold text-[#0D3E77]">Net Flow_t = Inflow_t - Outflow_t</code><br />
                  Nilai positif menunjukkan wilayah berfungsi sebagai penerima bersih (net absorber), sedangkan nilai negatif menunjukkan penyalur bersih (net distributor).
                </p>
              </div>
            </div>
          </div>

          {/* Formulasi EWS Alert Levels — BASED ON DATASET EWS (Database 2) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2F4F7] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#F79009]" />
                  Dokumentasi Rumus ALPS & Simulasi (Metodologi EWS)
                </h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Formulasi baku perhitungan indikator ALPS (Approach of Limiting Prices and Supplies), deviasi harga, dan simulasi shock prospektif.
                </p>
              </div>
              <span className="bg-[#0A2E5C] text-white text-[11px] font-mono px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                Model ETS 12-Bulan
              </span>
            </div>

            {/* Official ALPS Formula Table (From Kajian Document) */}
            <div className="overflow-x-auto rounded-2xl border border-[#0D3E77] shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A2E5C] text-white font-bold">
                    <th className="py-3 px-4 w-1/5">Variabel</th>
                    <th className="py-3 px-4 w-2/5">Formula Konsep</th>
                    <th className="py-3 px-3 text-center w-1/6 bg-[#0D3E77]">Contoh Hasil (Formula Aktif)</th>
                    <th className="py-3 px-4 w-1/3">Interpretasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC] bg-white text-[#344054]">
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-bold text-[#101828]">Harga Aktual</td>
                    <td className="py-2.5 px-4">Harga observasi PIHPS</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold bg-[#F2F7FD]">Rp 14.450</td>
                    <td className="py-2.5 px-4 text-[#667085]">Tautan langsung ke database sumber.</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-bold text-[#101828]">Harga Expected</td>
                    <td className="py-2.5 px-4">Forecast exponential smoothing musiman berdasarkan observasi historis sebelum periode t</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold bg-[#F2F7FD]">Rp 14.552</td>
                    <td className="py-2.5 px-4 text-[#667085]">Harga normal/expected berbasis ETS dengan musim 12 bulan.</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-bold text-[#101828]">Residual</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#0D3E77]">Actual - Expected</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-[#D92D20] bg-[#F2F7FD]">-Rp 102</td>
                    <td className="py-2.5 px-4 text-[#667085]">Deviasi harga aktual dari harga normal.</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-bold text-[#101828]">Residual SD</td>
                    <td className="py-2.5 px-4 font-mono">STDEV.S residual historis rolling window</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold bg-[#F2F7FD]">Rp 368</td>
                    <td className="py-2.5 px-4 text-[#667085]">Skala volatilitas/error normal model.</td>
                  </tr>
                  <tr className="bg-[#FFFAEB] hover:bg-[#FEF0C7]">
                    <td className="py-3 px-4 font-black text-[#B54708]">ALPS</td>
                    <td className="py-3 px-4 font-mono font-extrabold text-[#B54708]">Residual / Residual SD</td>
                    <td className="py-3 px-3 text-center font-mono font-black text-[#B54708] bg-[#FEF0C7] text-sm">-0,278</td>
                    <td className="py-3 px-4 font-bold text-[#B54708]">Standardized price deviation.</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-bold text-[#101828]">Status ALPS</td>
                    <td className="py-2.5 px-4">Threshold enam tingkat</td>
                    <td className="py-2.5 px-3 text-center bg-[#F2F7FD]">
                      <span className="bg-[#12B76A] text-white px-2.5 py-0.5 rounded-full font-extrabold text-[11px]">Normal</span>
                    </td>
                    <td className="py-2.5 px-4 text-[#667085]">Sangat Rendah, Rendah, Normal, Waspada, Tinggi, Sangat Tinggi.</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-bold text-[#101828]">Harga Simulasi</td>
                    <td className="py-2.5 px-4 font-mono">Basis × (1+Shock); berantai hingga horizon terpilih</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold bg-[#F2F7FD]">Rp 25.250</td>
                    <td className="py-2.5 px-4 text-[#667085]">Harga prospektif; shock pengguna berlaku pada bulan +1 s.d. +3.</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-4 font-bold text-[#101828]">Expected Future</td>
                    <td className="py-2.5 px-4 font-mono">FORECAST.ETS ke tanggal future hingga 1-12 bulan</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold bg-[#F2F7FD]">Rp 22.537</td>
                    <td className="py-2.5 px-4 text-[#667085]">Baseline harga normal ETS untuk horizon yang dipilih.</td>
                  </tr>
                  <tr className="bg-[#FEF3F2] hover:bg-[#FECDCA]">
                    <td className="py-3 px-4 font-black text-[#B42318]">ALPS Future</td>
                    <td className="py-3 px-4 font-mono font-extrabold text-[#B42318]">(Harga Simulasi - Expected Future) / Residual SD terakhir</td>
                    <td className="py-3 px-3 text-center font-mono font-black text-[#B42318] bg-[#FECDCA] text-sm">1,438</td>
                    <td className="py-3 px-4 font-bold text-[#B42318]">Sinyal risiko prospektif jika shock harga terjadi.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dual Database Architecture Info */}
            <div className="p-4 bg-[#FFFAEB] border border-[#FEDF89] rounded-xl text-xs text-[#344054] space-y-2 mt-4">
              <div className="font-bold text-[#B54708] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#F79009]" />
                Arsitektur Sumber Data: Dual Database
              </div>
              <p className="leading-relaxed">
                Tab EWS menggunakan <strong>Database 2 (Dataset EWS)</strong> yang <strong>terpisah dan independen</strong> dari Database 1 (Arus Komoditas di Tab 1–6). Data EWS memuat % perubahan harga per komoditas pada 3 level pelaku (PB, PE, PROD), status ALPS, serta indeks tekanan harga saat ini dan proyeksi. Filter di Tab EWS <strong>tidak terhubung</strong> dengan filter global dashboard.
              </p>
            </div>

            {/* Data Structure */}
            <div className="p-4 bg-[#F2F7FD] border border-[#B3D4F2] rounded-xl text-xs text-[#344054] space-y-2">
              <div className="font-bold text-[#0D3E77]">Struktur Data EWS per Komoditas</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-[#E4E7EC]">
                  <div className="font-bold text-[#0D3E77]">Heatmap_PB</div>
                  <div className="text-[#667085]">% perubahan harga Pedagang Besar</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E4E7EC]">
                  <div className="font-bold text-[#0D3E77]">Heatmap_PE</div>
                  <div className="text-[#667085]">% perubahan harga Pedagang Eceran</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E4E7EC]">
                  <div className="font-bold text-[#EA580C]">Heatmap_PROD</div>
                  <div className="text-[#667085]">% perubahan harga Produsen</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E4E7EC]">
                  <div className="font-bold text-[#101828]">ALPS Status</div>
                  <div className="text-[#667085]">NORMAL / WATCH / WARNING / CRITICAL</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E4E7EC]">
                  <div className="font-bold text-[#101828]">Current Pressure</div>
                  <div className="text-[#667085]">Tekanan harga saat ini (−0,5 s.d. +0,5)</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E4E7EC]">
                  <div className="font-bold text-[#101828]">Forecast Pressure</div>
                  <div className="text-[#667085]">Proyeksi tekanan harga ke depan</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#667085]">
              Status ALPS ditentukan berdasarkan <strong>% perubahan harga</strong> yang tercatat dalam Dataset EWS pada 3 level pelaku.
            </p>

            {/* ALPS Thresholds — Actual from ewsCalculations.js */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#F0FDF4] border border-[#ABEFC6] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#12B76A]">NORMAL</span>
                  <span className="w-3 h-3 rounded-full bg-[#12B76A]" />
                </div>
                <p className="text-[11px] text-[#344054] leading-relaxed">
                  Perubahan harga<br /><strong>&le; 10%</strong> pada pelaku terpilih
                </p>
              </div>

              <div className="p-3.5 bg-[#FFFAEB] border border-[#FEDF89] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#B54708]">WATCH (Waspada)</span>
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                </div>
                <p className="text-[11px] text-[#344054] leading-relaxed">
                  Perubahan harga<br /><strong>&gt; 10% s.d. 20%</strong>
                </p>
              </div>

              <div className="p-3.5 bg-[#FFF6ED] border border-[#F9DBAF] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#C4320A]">WARNING (Siaga)</span>
                  <span className="w-3 h-3 rounded-full bg-[#F97316]" />
                </div>
                <p className="text-[11px] text-[#344054] leading-relaxed">
                  Perubahan harga<br /><strong>&gt; 20% s.d. 50%</strong>
                </p>
              </div>

              <div className="p-3.5 bg-[#FEF3F2] border border-[#FECDCA] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#B42318]">CRITICAL (Awas)</span>
                  <span className="w-3 h-3 rounded-full bg-[#F04438]" />
                </div>
                <p className="text-[11px] text-[#344054] leading-relaxed">
                  Perubahan harga<br /><strong>&gt; 50%</strong>
                </p>
              </div>
            </div>

            {/* Worst-case aggregation & Dynamic recalculation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F2F7FD] border border-[#B3D4F2] rounded-xl space-y-1.5">
                <div className="font-bold text-[#0D3E77]">Mode "All" — Worst-Case Aggregation</div>
                <p className="text-[#344054] leading-relaxed">
                  Pada mode default (Semua Pelaku), status ALPS <strong>dibaca langsung</strong> dari kolom ALPS di Dataset EWS. Jika tidak tersedia, sistem mengambil <strong>nilai tertinggi (terburuk)</strong> dari Heatmap_PB, Heatmap_PE, dan Heatmap_PROD untuk memastikan risiko tidak terlewat.
                </p>
              </div>

              <div className="p-4 bg-[#F0FDF4] border border-[#ABEFC6] rounded-xl space-y-1.5">
                <div className="font-bold text-[#12B76A]">Rekalkulasi Dinamis per Pelaku</div>
                <p className="text-[#344054] leading-relaxed">
                  Jika pengguna memilih tipe pelaku tertentu (PB / PE / PROD), status ALPS <strong>dihitung ulang otomatis</strong> hanya berdasarkan nilai heatmap pelaku yang dipilih. Contoh: komoditas WATCH pada mode All bisa berubah menjadi NORMAL pada mode PB jika Heatmap_PB-nya &le; 10%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: QUALITY CONTROL & AUDIT TRAIL */}
      {activeSection === 'qc' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#12B76A]" />
              Protokol Pengendalian Mutu Data (10 Rules of Quality Control)
            </h2>
            <p className="text-xs text-[#667085]">
              Standar operasional pengolahan data untuk menjamin integritas, konsistensi, dan keandalan indikator dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: '1. Kelengkapan Variabel', desc: 'Seluruh variabel transaksi wajib terisi penuh atau menggunakan kode missing yang sah.' },
                { title: '2. Validasi Rentang (Range Check)', desc: 'Volume dan harga tidak boleh bernilai negatif; lonjakan ekstrem >50% ditandai otomatis.' },
                { title: '3. Balance Stok Aritmetika', desc: 'Stok Awal + Perolehan - Penjualan - Susut harus mendekati Stok Akhir secara matematis.' },
                { title: '4. Batas Kapasitas Wajar', desc: 'Volume penjualan mingguan tidak boleh melebihi kapasitas gudang/usaha tanpa catatan khusus.' },
                { title: '5. Dokumentasi Konversi Satuan', desc: 'Satuan asli lokal dicatat bersama faktor konversi baku (misal minyak goreng liter-ke-kg).' },
                { title: '6. Master Kode Wilayah', desc: 'Nama kabupaten/kota dan provinsi mengikuti kode referensi BPS/BI secara terstandar.' },
                { title: '7. Anti-Duplikasi Record', desc: 'Sistem menolak duplikasi ID Responden - Komoditas - Minggu.' },
                { title: '8. Back-Check Supervisor', desc: 'Minimal 10% responden dikonfirmasi ulang via telepon/kunjungan oleh supervisor.' },
                { title: '9. Witnessing Acak Lapangan', desc: 'Pengamatan langsung proses wawancara secara acak minimal 1x dalam setahun per kab/kota.' },
                { title: '10. Audit Trail Koreksi Data', desc: 'Setiap perbaikan data memiliki rekam jejak (tanggal, alasan, dan penanggung jawab).' },
              ].map((rule, idx) => (
                <div key={idx} className="p-3.5 bg-[#F9FAFB] rounded-xl border border-[#EAECF0] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-[#101828]">{rule.title}</div>
                    <div className="text-[11px] text-[#667085] leading-relaxed mt-0.5">{rule.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer Information / Citation Box */}
      <div className="bg-[#F2F7FD] border border-[#B3D4F2] p-5 rounded-2xl text-xs text-[#0D3E77] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-bold text-sm text-[#0A2E5C]">Sumber & Referensi Resmi Kajian:</div>
          <div className="text-[#344054] text-[11.5px]">
            Dokumen Laporan Akhir Kajian Arus Perdagangan 10 Komoditas Strategis D.I. Yogyakarta Tahun 2026.<br />
            Kerjasama <strong>Kantor Perwakilan Bank Indonesia Daerah Istimewa Yogyakarta</strong> & <strong>PSEKUIN UPN "Veteran" Yogyakarta</strong>.
          </div>
        </div>
        <div className="shrink-0 bg-white px-3 py-2 rounded-xl border border-[#D0D5DD] text-[11px] font-mono text-[#475467]">
          Versi Metadata: v1.0 (2026)
        </div>
      </div>

    </div>
  );
}

export default Tab8Metadata;
