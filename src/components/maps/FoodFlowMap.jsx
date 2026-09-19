// Interactive Geospatial From-To Food Flow Map & Respondent Pinpoint Map
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useState, useMemo } from 'react';
import {
  calculateGeospatialFlows,
  calculateRespondentLocations
} from '../../calculations';
import {
  MapPin,
  ArrowRight,
  TrendingUp,
  Layers,
  Building2,
  Tractor,
  Maximize2,
  RotateCcw,
  Info,
  CheckCircle2,
  Navigation,
  Activity,
  Boxes
} from 'lucide-react';

export function FoodFlowMap({
  dataset,
  selectedPeriode,
  selectedKomoditas,
  selectedWilayah,
  onSelectWilayah
}) {
  // Map View Mode: 'flow' (From-To Flow Map) vs 'respondents' (Pinpoint Respondent Map)
  const [mapMode, setMapMode] = useState('flow');
  const [flowDirection, setFlowDirection] = useState('all'); // 'all', 'inflow', 'outflow'
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [selectedNodeName, setSelectedNodeName] = useState(null);
  const [selectedRespondent, setSelectedRespondent] = useState(null);
  const [respondentFilter, setRespondentFilter] = useState('Semua'); // 'Semua', 'Pedagang Besar', 'Produsen'

  const rawArusMasuk = dataset?.arus_masuk || [];
  const rawArusKeluar = dataset?.arus_keluar || [];
  const rawRespondents = dataset?.respondents || [];

  // Calculate Geospatial Flow Routes
  const { routes, totalFlowVolume, nodeStats } = useMemo(() => {
    return calculateGeospatialFlows(
      rawArusMasuk,
      rawArusKeluar,
      selectedPeriode,
      selectedKomoditas,
      selectedNodeName || selectedWilayah,
      flowDirection
    );
  }, [rawArusMasuk, rawArusKeluar, selectedPeriode, selectedKomoditas, selectedNodeName, selectedWilayah, flowDirection]);

  // Calculate Pinpoint Respondents
  const respondentLocations = useMemo(() => {
    return calculateRespondentLocations(
      rawRespondents,
      selectedKomoditas,
      selectedNodeName || selectedWilayah,
      respondentFilter
    );
  }, [rawRespondents, selectedKomoditas, selectedNodeName, selectedWilayah, respondentFilter]);

  // Geospatial Projection Helper (Convert [lng, lat] to SVG coordinates [x, y])
  // Bounding box covering Central Java & DIY:
  // Lng: 108.8 to 112.4
  // Lat: -6.7 to -8.3
  const SVG_WIDTH = 920;
  const SVG_HEIGHT = 560;

  const projectCoord = (lng, lat) => {
    const minLng = 108.7;
    const maxLng = 112.5;
    const minLat = -8.35;
    const maxLat = -6.75;

    const x = ((lng - minLng) / (maxLng - minLng)) * (SVG_WIDTH - 80) + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * (SVG_HEIGHT - 80) + 40;
    return [Math.round(x), Math.round(y)];
  };

  // Generate Curved Bezier Path between 2 coordinates with dynamic arc curvature
  const generateArcPath = (fromCoord, toCoord, idx = 0) => {
    const [x1, y1] = projectCoord(fromCoord[0], fromCoord[1]);
    const [x2, y2] = projectCoord(toCoord[0], toCoord[1]);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Compute curvature offset perpendicular to line
    const curveOffset = Math.min(60, Math.max(25, dist * 0.22)) * (idx % 2 === 0 ? 1 : -0.75);
    const mx = (x1 + x2) / 2 - (dy / (dist || 1)) * curveOffset;
    const my = (y1 + y2) / 2 + (dx / (dist || 1)) * curveOffset;

    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  };

  const maxVolume = routes.length > 0 ? Math.max(...routes.map(r => r.volume)) : 1;

  return (
    <div className="clean-card bg-white overflow-hidden border border-slate-200/80 shadow-xs">
      
      {/* 1. Header & Mode Switcher Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Navigation className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {mapMode === 'flow' ? 'Peta Spasial Aliran Pangan (From-To Flow Map)' : 'Peta Sebaran Titik Responden (Pinpoint Facility Map)'}
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Spatial
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {mapMode === 'flow'
                ? `Visualisasi rute pasokan & distribusi komoditas ${selectedKomoditas} di wilayah DIY & sentra luar daerah`
                : `Titik koordinat presisi fasilitas Pedagang Besar (PB) & Produsen di D.I. Yogyakarta`}
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Map Mode Switcher */}
          <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
            <button
              onClick={() => { setMapMode('flow'); setSelectedRespondent(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'flow'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Aliran Pangan (From-To)</span>
            </button>
            <button
              onClick={() => { setMapMode('respondents'); setActiveRouteId(null); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'respondents'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Titik Responden (PB & Produsen)</span>
            </button>
          </div>

          {/* Sub Controls for Flow Map */}
          {mapMode === 'flow' && (
            <div className="inline-flex bg-white p-0.5 rounded-lg border border-slate-300 text-xs">
              <button
                onClick={() => setFlowDirection('all')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${flowDirection === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Semua Arus
              </button>
              <button
                onClick={() => setFlowDirection('inflow')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${flowDirection === 'inflow' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🟢 Pasokan Masuk
              </button>
              <button
                onClick={() => setFlowDirection('outflow')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${flowDirection === 'outflow' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🔵 Distribusi Keluar
              </button>
            </div>
          )}

          {/* Sub Controls for Respondent Map */}
          {mapMode === 'respondents' && (
            <div className="inline-flex bg-white p-0.5 rounded-lg border border-slate-300 text-xs">
              {['Semua', 'Pedagang Besar', 'Produsen'].map((type) => (
                <button
                  key={type}
                  onClick={() => setRespondentFilter(type)}
                  className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                    respondentFilter === type ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {type === 'Pedagang Besar' ? '🏢 PB' : type === 'Produsen' ? '🌾 Produsen' : 'Semua'}
                </button>
              ))}
            </div>
          )}

          {/* Reset Focus */}
          {(selectedNodeName || activeRouteId || selectedRespondent) && (
            <button
              onClick={() => {
                setSelectedNodeName(null);
                setActiveRouteId(null);
                setSelectedRespondent(null);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Reset Pilihan Wilayah"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Map Canvas Area */}
      <div className="relative bg-[#0F172A] w-full min-h-[520px] select-none overflow-hidden">
        
        {/* Subtle Map Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        {/* Region Legend Overlay */}
        <div className="absolute top-3 left-3 z-10 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 text-white text-[11px] space-y-1.5 shadow-lg max-w-[210px]">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 border-b border-slate-700 pb-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Keterangan Peta</span>
          </div>
          {mapMode === 'flow' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Arus Masuk (Sentra $\to$ DIY)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>Arus Keluar / Distribusi</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full border border-amber-300 bg-amber-400/30"></span>
                <span>Simpul Hub DIY (5 Kab/Kota)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-blue-500 border border-white flex items-center justify-center text-[8px] font-bold">PB</span>
                <span>Pedagang Besar ({respondentLocations.filter(r => r.tipe_responden.includes('Pedagang')).length})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] font-bold">PR</span>
                <span>Produsen / Gapoktan ({respondentLocations.filter(r => r.tipe_responden.includes('Produsen')).length})</span>
              </div>
            </div>
          )}
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            {selectedNodeName ? (
              <span className="text-amber-300 font-semibold">Fokus: {selectedNodeName}</span>
            ) : (
              <span>Klik simpul wilayah untuk filter</span>
            )}
          </div>
        </div>

        {/* SVG Vector Flow Rendering */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-[520px] block"
          style={{ filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.4))' }}
        >
          <defs>
            {/* Linear Gradients for Flow Lines */}
            <linearGradient id="grad-inflow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#34D399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="grad-outflow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="1" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background DIY Territory Silhouette Mock */}
          <g className="opacity-20 pointer-events-none">
            {/* Outline Central Java & DIY approximate backdrop */}
            <path
              d="M 120 180 Q 280 120 480 140 T 800 200 Q 860 380 720 460 T 400 480 Q 220 460 140 380 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* DIY Internal Region Highlight */}
            <path
              d="M 400 310 Q 480 290 530 330 T 520 440 Q 450 460 390 410 Z"
              fill="#0284C7"
              fillOpacity="0.15"
              stroke="#38BDF8"
              strokeWidth="1.5"
            />
            <text x="460" y="380" fill="#94A3B8" fontSize="11" fontWeight="bold" opacity="0.6" textAnchor="middle">
              WILAYAH D.I. YOGYAKARTA
            </text>
          </g>

          {/* ================= MODE 1: FLOW ARCS & ANIMATED PARTICLES ================= */}
          {mapMode === 'flow' && (
            <g className="flow-routes-layer">
              {routes.map((route, idx) => {
                const pathD = generateArcPath(route.fromCoords, route.toCoords, idx);
                const isSelected = activeRouteId === route.id;
                const isDimmed = activeRouteId && !isSelected;

                // Scale line thickness: 1.8px to 7.5px based on volume
                const strokeWidth = Math.max(1.8, Math.min(7.5, (route.volume / (maxVolume || 1)) * 7));
                const strokeColor = route.type === 'inflow' ? 'url(#grad-inflow)' : 'url(#grad-outflow)';

                return (
                  <g
                    key={route.id}
                    className="cursor-pointer transition-opacity duration-200"
                    opacity={isDimmed ? 0.2 : 1}
                    onMouseEnter={() => setActiveRouteId(route.id)}
                    onMouseLeave={() => setActiveRouteId(null)}
                  >
                    {/* Background Hit Area */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={strokeWidth + 12}
                    />

                    {/* Static Base Flow Path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      filter={isSelected ? 'url(#glow-effect)' : undefined}
                    />

                    {/* Moving Particle Animation on Flow Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={route.type === 'inflow' ? '#A7F3D0' : '#BAE6FD'}
                      strokeWidth={strokeWidth + 1}
                      strokeLinecap="round"
                      strokeDasharray="6 24"
                      className="animate-flow-dash"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ================= GEOSPATIAL NODES & REGIONAL HUBS ================= */}
          {mapMode === 'flow' && (
            <g className="nodes-layer">
              {nodeStats.map((node) => {
                const [cx, cy] = projectCoord(node.lng, node.lat);
                const isDIY = node.type.startsWith('diy');
                const isSelected = selectedNodeName === node.name;
                const totalVol = (node.totalIn || 0) + (node.totalOut || 0);

                // Radius sized by volume
                const r = isDIY ? Math.max(9, Math.min(18, 9 + totalVol * 0.015)) : 7;

                return (
                  <g
                    key={node.name}
                    className="cursor-pointer group"
                    onClick={() => {
                      if (selectedNodeName === node.name) {
                        setSelectedNodeName(null);
                        if (onSelectWilayah) onSelectWilayah('Semua Wilayah DIY');
                      } else {
                        setSelectedNodeName(node.name);
                        if (onSelectWilayah && isDIY) onSelectWilayah(node.name);
                      }
                    }}
                  >
                    {/* Outer Glow Pulse for DIY Hubs */}
                    {isDIY && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r + 5}
                        fill="#38BDF8"
                        fillOpacity={isSelected ? 0.4 : 0.15}
                        className={isSelected ? 'animate-ping' : ''}
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={isDIY ? (isSelected ? '#F59E0B' : '#0284C7') : '#10B981'}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-transform duration-150 hover:scale-125"
                    />

                    {/* Inner Center Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="#FFFFFF"
                    />

                    {/* Node Label Text */}
                    <text
                      x={cx}
                      y={cy + r + 13}
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="10.5"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow-md"
                    >
                      {node.label || node.name}
                    </text>

                    {/* Node Metric Pill */}
                    {totalVol > 0 && (
                      <text
                        x={cx}
                        y={cy + r + 24}
                        textAnchor="middle"
                        fill={isDIY ? '#7DD3FC' : '#6EE7B7'}
                        fontSize="9"
                        fontWeight="600"
                        className="pointer-events-none drop-shadow"
                      >
                        {totalVol.toFixed(0)} Ton
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* ================= MODE 2: RESPONDENT PINPOINT MARKERS ================= */}
          {mapMode === 'respondents' && (
            <g className="respondents-pin-layer">
              {respondentLocations.map((resp) => {
                const [cx, cy] = projectCoord(resp.lng, resp.lat);
                const isPB = resp.tipe_responden.includes('Pedagang');
                const isSelected = selectedRespondent?.id_responden === resp.id_responden;

                return (
                  <g
                    key={resp.id_responden}
                    className="cursor-pointer group"
                    onClick={() => setSelectedRespondent(resp)}
                  >
                    {/* Pin Outer Ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 16 : 11}
                      fill={isPB ? '#3B82F6' : '#10B981'}
                      fillOpacity={isSelected ? 0.5 : 0.25}
                      className={isSelected ? 'animate-pulse' : ''}
                    />

                    {/* Pin Marker */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 9 : 7}
                      fill={isPB ? '#2563EB' : '#059669'}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      className="transition-transform duration-150 hover:scale-125"
                    />

                    {/* Short Badge on top of pin */}
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                      className="drop-shadow-md pointer-events-none"
                    >
                      {resp.nama_responden}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

        </svg>

        {/* 3. Floating Interactive Tooltip / Detail Card */}
        {mapMode === 'flow' && activeRouteId && (
          <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3.5 rounded-xl shadow-2xl text-white max-w-xs animate-in fade-in zoom-in-95 duration-150">
            {(() => {
              const activeRoute = routes.find(r => r.id === activeRouteId);
              if (!activeRoute) return null;
              const pctOfTotal = totalFlowVolume > 0 ? ((activeRoute.volume / totalFlowVolume) * 100).toFixed(1) : '0';

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${activeRoute.type === 'inflow' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                      {activeRoute.type === 'inflow' ? 'Pasokan Masuk' : 'Distribusi Keluar'}
                    </span>
                    <span className="text-[11px] font-bold text-amber-300">{pctOfTotal}% dari Total</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-slate-300">{activeRoute.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-white">{activeRoute.to}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-800/80 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Volume Pasokan</span>
                      <span className="text-xs font-bold text-white">{activeRoute.volume.toLocaleString('id-ID')} Ton</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Kategori Pelaku</span>
                      <span className="text-[11px] font-medium text-slate-200 truncate block">{activeRoute.partnerType}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 4. Floating Selected Respondent Detail Card */}
        {mapMode === 'respondents' && selectedRespondent && (
          <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl text-white max-w-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-2 border-b border-slate-700 pb-2 mb-2">
              <div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${selectedRespondent.tipe_responden.includes('Pedagang') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {selectedRespondent.tipe_responden}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{selectedRespondent.nama_responden}</h4>
              </div>
              <button
                onClick={() => setSelectedRespondent(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Wilayah / Kabupaten:</span>
                <span className="font-semibold text-white">{selectedRespondent.kabupaten}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Komoditas Utama:</span>
                <span className="font-semibold text-amber-300">{selectedRespondent.komoditas_utama}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kapasitas Gudang:</span>
                <span className="font-semibold text-white">{selectedRespondent.kapasitas_gudang || '100 Ton'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rata-rata Volume Mingguan:</span>
                <span className="font-bold text-emerald-400">{selectedRespondent.volume_mingguan}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                📍 {selectedRespondent.alamat || 'D.I. Yogyakarta'}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Bottom Routes Summary Panel (Top 5 Routes) */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-slate-700" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {mapMode === 'flow' ? `Rute Aliran Terbesar — Total: ${totalFlowVolume.toLocaleString('id-ID')} Ton (${routes.length} Rute)` : `Daftar Fasilitas Responden Terdaftar (${respondentLocations.length} Fasilitas)`}
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Periode: {selectedPeriode} &bull; {selectedKomoditas}
          </span>
        </div>

        {mapMode === 'flow' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {routes.slice(0, 4).map((r, i) => {
              const pct = totalFlowVolume > 0 ? ((r.volume / totalFlowVolume) * 100).toFixed(1) : 0;
              return (
                <div
                  key={r.id}
                  onClick={() => setActiveRouteId(activeRouteId === r.id ? null : r.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    activeRouteId === r.id
                      ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${r.type === 'inflow' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      #{i + 1} {r.type === 'inflow' ? 'Masuk' : 'Keluar'}
                    </span>
                    <span className="font-bold text-slate-700">{r.volume.toLocaleString('id-ID')} Ton</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 truncate">
                    <span className="truncate">{r.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{r.to}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${r.type === 'inflow' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{r.partnerType}</span>
                    <span>{pct}% Pangsa</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {respondentLocations.slice(0, 6).map((resp) => (
              <div
                key={resp.id_responden}
                onClick={() => setSelectedRespondent(resp)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  selectedRespondent?.id_responden === resp.id_responden
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${resp.tipe_responden.includes('Pedagang') ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {resp.tipe_responden}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">{resp.kabupaten}</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 truncate">{resp.nama_responden}</h5>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{resp.alamat}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
