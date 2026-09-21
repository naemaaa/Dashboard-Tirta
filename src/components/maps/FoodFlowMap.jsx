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
    <div className="clean-card bg-white overflow-hidden">
      
      {/* 1. Header Controls Bar */}
      <div className="p-4 border-b border-[#E4E7EC] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        
        {/* Left: Mode Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#DCEAFA] text-[#0D3E77] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-[#12539E]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#101828] uppercase tracking-wider">
              {mapMode === 'flow' ? 'Peta Spasial Aliran Distribusi Komoditas' : 'Peta Sebaran Titik Responden & Sentra'}
            </h3>
            <p className="text-xs text-[#667085]">
              {mapMode === 'flow' ? 'Visualisasi rute logistik inter-regional & intra-DIY' : 'Pinpoint lokasi pedagang besar & kelompok produsen'}
            </p>
          </div>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Main Mode Toggle (§5.11 Segmented Pills) */}
          <div className="inline-flex bg-[#F2F4F7] p-1 rounded-full border border-[#E4E7EC] text-xs">
            <button
              onClick={() => { setMapMode('flow'); setSelectedRespondent(null); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'flow'
                  ? 'bg-white text-[#0D3E77] font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#1E74C7]" />
              <span>1. Aliran Pangan (From-To)</span>
            </button>
            <button
              onClick={() => { setMapMode('respondents'); setActiveRouteId(null); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'respondents'
                  ? 'bg-white text-[#0D3E77] font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#12B76A]" />
              <span>2. Titik Responden</span>
            </button>
          </div>

          {/* Sub Controls for Flow Map */}
          {mapMode === 'flow' && (
            <div className="inline-flex bg-[#F2F4F7] p-1 rounded-full border border-[#E4E7EC] text-xs">
              <button
                onClick={() => setFlowDirection('all')}
                className={`px-3 py-1 rounded-full font-medium cursor-pointer ${flowDirection === 'all' ? 'bg-[#0A2E5C] text-white font-bold' : 'text-[#667085] hover:bg-white/60'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFlowDirection('inflow')}
                className={`px-3 py-1 rounded-full font-medium cursor-pointer ${flowDirection === 'inflow' ? 'bg-[#1E74C7] text-white font-bold' : 'text-[#667085] hover:bg-white/60'}`}
              >
                Masuk
              </button>
              <button
                onClick={() => setFlowDirection('outflow')}
                className={`px-3 py-1 rounded-full font-medium cursor-pointer ${flowDirection === 'outflow' ? 'bg-[#17B6A7] text-white font-bold' : 'text-[#667085] hover:bg-white/60'}`}
              >
                Keluar
              </button>
            </div>
          )}

          {/* Sub Controls for Respondent Map */}
          {mapMode === 'respondents' && (
            <div className="inline-flex bg-[#F2F4F7] p-1 rounded-full border border-[#E4E7EC] text-xs">
              {['Semua', 'Pedagang Besar', 'Produsen'].map((type) => (
                <button
                  key={type}
                  onClick={() => setRespondentFilter(type)}
                  className={`px-3 py-1 rounded-full font-medium cursor-pointer ${
                    respondentFilter === type ? 'bg-[#0A2E5C] text-white font-bold' : 'text-[#667085] hover:bg-white/60'
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
            className="bg-[#F9FAFB] border border-[#E4E7EC] text-[#344054] text-xs rounded-xl px-3 py-1.5 outline-none font-medium cursor-pointer h-[34px]"
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
            className="p-2 text-[#667085] hover:text-[#0D3E77] bg-white hover:bg-[#F2F4F7] border border-[#D0D5DD] rounded-full transition-colors cursor-pointer"
            title="Reset Posisi Peta ke DIY"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Map Viewport */}
      <div className="relative w-full h-[580px] bg-[#F2F7FD]">
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>

        {/* Overlay Legend */}
        <div className="absolute top-3 left-3 z-1000 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E4E7EC] text-[#101828] text-xs shadow-lg max-w-[230px]">
          <div className="flex items-center gap-2 font-bold text-[#101828] border-b border-[#E4E7EC] pb-1.5 mb-2">
            <Layers className="w-4 h-4 text-[#C89B3C]" />
            <span>Keterangan Aliran</span>
          </div>
          {mapMode === 'flow' ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[#1E74C7] rounded"></span>
                <span className="text-[#344054]">Arus Masuk (Sentra &rarr; DIY)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[#17B6A7] rounded"></span>
                <span className="text-[#344054]">Arus Keluar / Distribusi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0A2E5C] border-2 border-white shadow-xs"></span>
                <span className="text-[#344054]">Simpul Hub DIY (5 Kab/Kota)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1E74C7] text-white flex items-center justify-center text-[10px]">🏢</span>
                <span className="text-[#344054]">Pedagang Besar (PB)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#12B76A] text-white flex items-center justify-center text-[10px]">🌾</span>
                <span className="text-[#344054]">Produsen / Gapoktan</span>
              </div>
            </div>
          )}
          {selectedNodeName && (
            <div className="text-[10px] text-[#0D3E77] font-bold pt-2 mt-2 border-t border-[#E4E7EC]">
              Fokus Wilayah: {selectedNodeName}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Summary Panel (Top Routes / Facilities) */}
      <div className="p-5 bg-white border-t border-[#E4E7EC]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#0D3E77]" />
            <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
              {mapMode === 'flow' ? `Rute Aliran Terbesar — Total: ${totalFlowVolume.toLocaleString('id-ID')} Ton (${routes.length} Rute)` : `Daftar Fasilitas Responden Terdaftar (${respondentLocations.length} Fasilitas)`}
            </h4>
          </div>
          <span className="text-xs text-[#667085] font-medium">
            Periode: {selectedPeriode} &bull; {selectedKomoditas}
          </span>
        </div>

        {mapMode === 'flow' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {routes.slice(0, 4).map((r, i) => {
              const pct = totalFlowVolume > 0 ? ((r.volume / totalFlowVolume) * 100).toFixed(1) : 0;
              const rankColor = i === 0 ? 'bg-[#C89B3C]' : i === 1 ? 'bg-[#98A2B3]' : 'bg-[#B3D4F2]';
              return (
                <div
                  key={r.id}
                  onClick={() => setActiveRouteId(activeRouteId === r.id ? null : r.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    activeRouteId === r.id
                      ? 'bg-[#F2F7FD] border-[#1E74C7] ring-1 ring-[#1E74C7]'
                      : 'bg-[#F9FAFB] border-[#E4E7EC] hover:border-[#D0D5DD] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${r.type === 'inflow' ? 'bg-[#DCEAFA] text-[#0D3E77]' : 'bg-[rgba(23,182,167,0.12)] text-[#17B6A7]'}`}>
                      #{i + 1} {r.type === 'inflow' ? 'Masuk' : 'Keluar'}
                    </span>
                    <span className="font-bold font-mono text-[#101828]">{r.volume.toLocaleString('id-ID')} Ton</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#101828] truncate">
                    <span className="truncate">{r.from}</span>
                    <ArrowRight className="w-3 h-3 text-[#667085] shrink-0" />
                    <span className="truncate">{r.to}</span>
                  </div>
                  <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      className={`h-full rounded-full ${r.type === 'inflow' ? 'bg-[#1E74C7]' : 'bg-[#17B6A7]'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#667085] mt-1.5 font-medium">
                    <span>{r.partnerType}</span>
                    <span>{pct}% Pangsa</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {respondentLocations.slice(0, 6).map((resp) => (
              <div
                key={resp.id_responden}
                onClick={() => setSelectedRespondent(resp)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRespondent?.id_responden === resp.id_responden
                    ? 'bg-[#F2F7FD] border-[#1E74C7] ring-1 ring-[#1E74C7]'
                    : 'bg-[#F9FAFB] border-[#E4E7EC] hover:border-[#D0D5DD] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${resp.tipe_responden.includes('Pedagang') ? 'bg-[#DCEAFA] text-[#0D3E77]' : 'bg-[rgba(18,183,106,0.12)] text-[#12B76A]'}`}>
                    {resp.tipe_responden}
                  </span>
                  <span className="text-[10px] font-medium text-[#667085]">{resp.kabupaten}</span>
                </div>
                <h5 className="text-xs font-bold text-[#101828] truncate">{resp.nama_responden}</h5>
                <p className="text-[10px] text-[#667085] truncate mt-0.5">{resp.alamat}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
