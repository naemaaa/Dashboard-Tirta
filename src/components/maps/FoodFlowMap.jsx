// Interactive Leaflet Geospatial Food Flow Map & Respondent Pinpoint Map
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  calculateGeospatialFlows,
  calculateRespondentLocations
} from '../../calculations';
import { GEO_NODES } from '../../data/seedData';
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
  Boxes,
  Compass
} from 'lucide-react';

// Free & Open Tile Layer options (No API Key, No Watermark)
const TILE_LAYERS = {
  esri_street: {
    name: 'Peta Wilayah Detail (ESRI)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap'
  },
  esri_light: {
    name: 'Peta Terang Minimalis (ESRI Gray)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, NGA, USGS'
  },
  esri_dark: {
    name: 'Peta Gelap (ESRI Dark)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin'
  },
  osm: {
    name: 'OpenStreetMap (OSM)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  esri_topo: {
    name: 'Topografi & Kontur (ESRI Topo)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, Intermap'
  }
};

export function FoodFlowMap({
  dataset,
  selectedPeriode,
  selectedKomoditas,
  selectedWilayah,
  onSelectWilayah
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const flowLayerGroupRef = useRef(null);
  const respondentLayerGroupRef = useRef(null);

  // States
  const [mapMode, setMapMode] = useState('flow'); // 'flow' | 'respondents'
  const [tileStyle, setTileStyle] = useState('esri_street'); // 'esri_street' | 'esri_light' | 'esri_dark' | 'osm' | 'esri_topo'
  const [flowDirection, setFlowDirection] = useState('all'); // 'all', 'inflow', 'outflow'
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [selectedNodeName, setSelectedNodeName] = useState(null);
  const [selectedRespondent, setSelectedRespondent] = useState(null);
  const [respondentFilter, setRespondentFilter] = useState('Semua');

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

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of D.I. Yogyakarta
      const map = L.map(mapContainerRef.current, {
        center: [-7.80, 110.37],
        zoom: 9.5,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Create Layer Groups
      flowLayerGroupRef.current = L.layerGroup().addTo(map);
      respondentLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update Tile Layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const activeTile = TILE_LAYERS[tileStyle] || TILE_LAYERS.light;
    L.tileLayer(activeTile.url, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: activeTile.attribution
    }).addTo(map);

  }, [tileStyle]);

  // Helper to generate curved bezier points for Leaflet polyline
  const generateCurvedPoints = (fromLatLng, toLatLng, curveFactor = 0.15) => {
    const [lat1, lng1] = fromLatLng;
    const [lat2, lng2] = toLatLng;

    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    // Perpendicular offset
    const controlLat = midLat - dLng * curveFactor;
    const controlLng = midLng + dLat * curveFactor;

    const points = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * controlLat + t * t * lat2;
      const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * controlLng + t * t * lng2;
      points.push([lat, lng]);
    }
    return points;
  };

  // 2. Render Layer Elements on Map (Flows vs Respondents)
  useEffect(() => {
    if (!mapInstanceRef.current || !flowLayerGroupRef.current || !respondentLayerGroupRef.current) return;

    const flowGroup = flowLayerGroupRef.current;
    const respGroup = respondentLayerGroupRef.current;

    flowGroup.clearLayers();
    respGroup.clearLayers();

    const maxVol = routes.length > 0 ? Math.max(...routes.map(r => r.volume)) : 1;

    if (mapMode === 'flow') {
      // 2A. Render Flow Arcs
      routes.forEach((route, idx) => {
        const fromNode = GEO_NODES[route.from] || GEO_NODES['Luar DIY Lainnya'];
        const toNode = GEO_NODES[route.to] || GEO_NODES['Kab. Sleman'];

        const points = generateCurvedPoints([fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng], (idx % 2 === 0 ? 0.18 : -0.14));
        const strokeWidth = Math.max(2.5, Math.min(8.5, (route.volume / (maxVol || 1)) * 8));
        const isSelected = activeRouteId === route.id;
        const color = route.type === 'inflow' ? '#059669' : '#2563EB';

        // Outer glow path for active
        if (isSelected) {
          L.polyline(points, {
            color: '#F59E0B',
            weight: strokeWidth + 4,
            opacity: 0.9,
            lineCap: 'round'
          }).addTo(flowGroup);
        }

        const polyline = L.polyline(points, {
          color: color,
          weight: strokeWidth,
          opacity: isSelected ? 1 : 0.85,
          dashArray: isSelected ? undefined : '6, 8',
          lineCap: 'round'
        }).addTo(flowGroup);

        // Bind interactive Popup
        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
            <div style="font-weight: bold; color: ${color}; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">
              ${route.type === 'inflow' ? '🟢 Pasokan Masuk' : '🔵 Distribusi Keluar'}
            </div>
            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">
              ${route.from} &rarr; ${route.to}
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
              <div><strong>Komoditas:</strong> ${route.commodity}</div>
              <div><strong>Volume:</strong> ${route.volume.toLocaleString('id-ID')} Ton</div>
              <div><strong>Pelaku:</strong> ${route.partnerType}</div>
            </div>
          </div>
        `;
        polyline.bindPopup(popupContent);

        polyline.on('mouseover', () => setActiveRouteId(route.id));
        polyline.on('mouseout', () => setActiveRouteId(null));
      });

      // 2B. Render Regional Hub Nodes
      nodeStats.forEach((node) => {
        const isDIY = node.type.startsWith('diy');
        const isSelected = selectedNodeName === node.name;
        const totalVol = (node.totalIn || 0) + (node.totalOut || 0);

        const radius = isDIY ? Math.max(10, Math.min(22, 10 + totalVol * 0.02)) : 8;

        const circleMarker = L.circleMarker([node.lat, node.lng], {
          radius: radius,
          fillColor: isDIY ? (isSelected ? '#F59E0B' : '#0284C7') : '#10B981',
          color: '#FFFFFF',
          weight: isSelected ? 3 : 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(flowGroup);

        const nodePopup = `
          <div style="font-family: inherit; font-size: 12px; min-width: 160px;">
            <div style="font-weight: bold; color: #0f172a; font-size: 13px; margin-bottom: 2px;">
              ${node.name}
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
              ${node.sentra ? `Sentra: ${node.sentra}` : 'Hub Wilayah DIY'}
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 4px;">
              <div><strong>Total Masuk:</strong> ${node.totalIn.toFixed(1)} Ton</div>
              <div><strong>Total Keluar:</strong> ${node.totalOut.toFixed(1)} Ton</div>
            </div>
          </div>
        `;
        circleMarker.bindPopup(nodePopup);

        circleMarker.on('click', () => {
          if (selectedNodeName === node.name) {
            setSelectedNodeName(null);
            if (onSelectWilayah) onSelectWilayah('Semua Wilayah DIY');
          } else {
            setSelectedNodeName(node.name);
            if (onSelectWilayah && isDIY) onSelectWilayah(node.name);
          }
        });
      });

    } else {
      // 2C. Render Respondent Pinpoint Markers
      respondentLocations.forEach((resp) => {
        const isPB = resp.tipe_responden.includes('Pedagang');
        const isSelected = selectedRespondent?.id_responden === resp.id_responden;

        const customIcon = L.divIcon({
          className: 'custom-resp-pin',
          html: `
            <div style="
              width: ${isSelected ? '32px' : '26px'};
              height: ${isSelected ? '32px' : '26px'};
              background: ${isPB ? '#2563EB' : '#059669'};
              border: 2px solid #FFFFFF;
              border-radius: 50%;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
              font-weight: bold;
              transition: all 0.2s ease;
            ">
              ${isPB ? '🏢' : '🌾'}
            </div>
          `,
          iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
          iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13]
        });

        const marker = L.marker([resp.lat, resp.lng], { icon: customIcon }).addTo(respGroup);

        const respPopup = `
          <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
            <div style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 4px; background: ${isPB ? '#DBEAFE; color: #1E40AF;' : '#D1FAE5; color: #065F46;'}">
              ${resp.tipe_responden}
            </div>
            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">
              ${resp.nama_responden}
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
              📍 ${resp.alamat || resp.kabupaten}
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; font-size: 11px;">
              <div><strong>Komoditas Utama:</strong> ${resp.komoditas_utama}</div>
              <div><strong>Kapasitas Gudang:</strong> ${resp.kapasitas_gudang || '100 Ton'}</div>
              <div><strong>Vol. Rata-rata:</strong> ${resp.volume_mingguan}</div>
            </div>
          </div>
        `;
        marker.bindPopup(respPopup);

        marker.on('click', () => setSelectedRespondent(resp));
      });
    }

  }, [mapMode, routes, nodeStats, respondentLocations, activeRouteId, selectedNodeName, selectedRespondent]);

  // Reset map view to center
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-7.80, 110.37], 9.5);
    }
    setSelectedNodeName(null);
    setActiveRouteId(null);
    setSelectedRespondent(null);
    if (onSelectWilayah) onSelectWilayah('Semua Wilayah DIY');
  };

  return (
    <div className="clean-card bg-white overflow-hidden border border-slate-200/80 shadow-xs">
      
      {/* 1. Header & Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {mapMode === 'flow' ? 'Peta Spasial Aliran Pangan (From-To Flow Map)' : 'Peta Sebaran Titik Responden (Pinpoint Facility Map)'}
              </h3>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                Leaflet GIS
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {mapMode === 'flow'
                ? `Visualisasi geografis rute pasokan komoditas ${selectedKomoditas} di D.I. Yogyakarta & sentra Jawa`
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
                Semua
              </button>
              <button
                onClick={() => setFlowDirection('inflow')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${flowDirection === 'inflow' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🟢 Masuk
              </button>
              <button
                onClick={() => setFlowDirection('outflow')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer ${flowDirection === 'outflow' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🔵 Keluar
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

          {/* Map Tile Style Switcher */}
          <select
            value={tileStyle}
            onChange={(e) => setTileStyle(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer"
          >
            <option value="esri_street">Peta Wilayah Detail (ESRI)</option>
            <option value="esri_light">Peta Terang Minimalis</option>
            <option value="esri_dark">Peta Gelap</option>
            <option value="osm">OpenStreetMap (OSM)</option>
            <option value="esri_topo">Topografi & Kontur</option>
          </select>

          {/* Reset Map View Button */}
          <button
            onClick={handleResetView}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Reset Posisi Peta ke DIY"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Map Viewport */}
      <div className="relative w-full h-[580px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>

        {/* Overlay Legend */}
        <div className="absolute top-3 left-3 z-1000 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-slate-800 text-xs shadow-lg max-w-[220px]">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Keterangan Aliran</span>
          </div>
          {mapMode === 'flow' ? (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-emerald-600 rounded"></span>
                <span>Arus Masuk (Sentra &rarr; DIY)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-blue-600 rounded"></span>
                <span>Arus Keluar / Distribusi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 border border-white"></span>
                <span>Simpul Hub DIY (5 Kab/Kota)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">🏢</span>
                <span>Pedagang Besar (PB)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">🌾</span>
                <span>Produsen / Gapoktan</span>
              </div>
            </div>
          )}
          {selectedNodeName && (
            <div className="text-[10px] text-amber-700 font-bold pt-1.5 mt-1 border-t border-slate-200">
              Fokus: {selectedNodeName}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Summary Panel (Top Routes / Facilities) */}
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
