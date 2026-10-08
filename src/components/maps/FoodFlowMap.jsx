// Interactive Leaflet Geospatial Food Flow Map & Respondent Pinpoint Map
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboardStore } from '../../store/useDashboardStore';
import {
  calculateGeospatialFlows,
  calculateRespondentLocations
} from '../../calculations';
import { GEO_NODES, findGeoNode } from '../../data/seedData';
import {
  MapPin,
  ArrowRight,
  TrendingUp,
  Layers,
  Building2,
  Tractor,
  RotateCcw,
  Boxes,
  Compass,
  Lock,
  Unlock,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Warehouse,
  Scale
} from 'lucide-react';
import { PasswordModal } from '../common/PasswordModal';

// High-availability, 100% Free Tile Layers (No API Key Required, No Watermark)
const TILE_LAYERS = {
  esri_street: {
    name: 'Peta Wilayah Detail (ESRI Street)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap'
  },
  osm: {
    name: 'OpenStreetMap (OSM Standard)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution: '&copy; OpenStreetMap contributors'
  },
  esri_light: {
    name: 'Peta Terang Minimalis (ESRI Gray)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, NGA, USGS'
  },
  esri_topo: {
    name: 'Topografi & Kontur (ESRI Topo)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, Intermap'
  },
  esri_dark: {
    name: 'Peta Gelap Minimalis (ESRI Dark)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin'
  }
};

export function FoodFlowMap({
  dataset,
  selectedPeriode,
  selectedKomoditas,
  selectedWilayah,
  onSelectWilayah
}) {
  const { isRespondentUnlocked } = useDashboardStore();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const flowLayerGroupRef = useRef(null);
  const respondentLayerGroupRef = useRef(null);
  const markersRef = useRef(new Map());

  // States
  const [mapMode, setMapMode] = useState('flow'); // 'flow' | 'respondents'
  const [tileStyle, setTileStyle] = useState('esri_street');
  const [flowDirection, setFlowDirection] = useState('all'); // 'all', 'inflow', 'outflow'
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [selectedNodeName, setSelectedNodeName] = useState(null);
  const [selectedRespondent, setSelectedRespondent] = useState(null);
  const [respondentFilter, setRespondentFilter] = useState('Semua');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
        zoom: 10,
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

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const activeTile = TILE_LAYERS[tileStyle] || TILE_LAYERS.esri_street;
    const tileOptions = {
      maxZoom: 19,
      attribution: activeTile.attribution
    };
    if (activeTile.subdomains) {
      tileOptions.subdomains = activeTile.subdomains;
    }

    L.tileLayer(activeTile.url, tileOptions).addTo(map);

    // Invalidate size to guarantee crisp map tile loading
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

  }, [tileStyle]);

  // Helper to generate curved bezier points for Leaflet polyline
  const generateCurvedPoints = (fromLatLng, toLatLng, curveFactor = 0.15) => {
    const [lat1, lng1] = fromLatLng;
    const [lat2, lng2] = toLatLng;

    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

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
    markersRef.current.clear();

    const maxVol = routes.length > 0 ? Math.max(...routes.map(r => r.volume)) : 1;

    const isLiter = selectedKomoditas && selectedKomoditas.toLowerCase().includes('liter');
    const flowUnit = isLiter ? 'Liter' : 'Ton';

    if (mapMode === 'flow') {
      // 2A. Render Flow Arcs
      routes.forEach((route, idx) => {
        const fromNode = findGeoNode(route.from);
        const toNode = findGeoNode(route.to);

        const points = generateCurvedPoints([fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng], (idx % 2 === 0 ? 0.18 : -0.14));
        const strokeWidth = Math.max(3, Math.min(9, (route.volume / (maxVol || 1)) * 9));
        const isSelected = activeRouteId === route.id;
        const color = route.type === 'inflow' ? '#059669' : '#2563EB';

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

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 180px; padding: 2px;">
            <div style="font-weight: bold; color: ${color}; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">
              ${route.type === 'inflow' ? '🟢 Pasokan Masuk' : '🔵 Distribusi Keluar'}
            </div>
            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">
              ${route.from} &rarr; ${route.to}
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 4px; line-height: 1.5;">
              <div><strong>Komoditas:</strong> ${route.commodity}</div>
              <div><strong>Volume:</strong> ${route.volume.toLocaleString('id-ID')} ${flowUnit}</div>
              <div><strong>Pelaku / Mitra:</strong> ${route.partnerType}</div>
            </div>
          </div>
        `;
        polyline.bindPopup(popupContent);

        polyline.on('mouseover', () => setActiveRouteId(route.id));
        polyline.on('mouseout', () => setActiveRouteId(null));
      });

      // 2B. Render Regional Hub Nodes
      nodeStats.forEach((node) => {
        const isDIY = Boolean(node.type && node.type.startsWith('diy'));
        const isSelected = selectedNodeName === node.name;
        const totalVol = (node.totalIn || 0) + (node.totalOut || 0);

        const radius = isDIY ? Math.max(12, Math.min(24, 12 + totalVol * 0.02)) : 10;

        const circleMarker = L.circleMarker([node.lat, node.lng], {
          radius: radius,
          fillColor: isDIY ? (isSelected ? '#F59E0B' : '#0D3E77') : '#10B981',
          color: '#FFFFFF',
          weight: isSelected ? 3.5 : 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(flowGroup);

        const nodePopup = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 160px; padding: 2px;">
            <div style="font-weight: bold; color: #0f172a; font-size: 13px; margin-bottom: 2px;">
              ${node.name}
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
              ${node.sentra ? `Sentra: ${node.sentra}` : 'Hub Wilayah DIY'}
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; line-height: 1.5;">
              <div><strong>Total Masuk:</strong> ${(node.totalIn || 0).toFixed(1)} {flowUnit}</div>
              <div><strong>Total Keluar:</strong> ${(node.totalOut || 0).toFixed(1)} {flowUnit}</div>
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
      respondentLocations.forEach((resp, idx) => {
        const isPB = (resp.tipe_responden || '').toLowerCase().includes('pedagang');
        const isSelected = selectedRespondent?.id_responden === resp.id_responden;
        const displayName = isRespondentUnlocked ? resp.nama_responden : `Responden #${idx + 1}`;
        const displayAddress = isRespondentUnlocked ? resp.alamat : `${resp.kabupaten} (Alamat Tersandi)`;

        const customIcon = L.divIcon({
          className: 'custom-resp-pin',
          html: `
            <div style="
              width: ${isSelected ? '34px' : '28px'};
              height: ${isSelected ? '34px' : '28px'};
              background: ${isPB ? '#1E74C7' : '#12B76A'};
              border: ${isSelected ? '3px solid #F59E0B' : '2px solid #FFFFFF'};
              border-radius: 50%;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
              transition: all 0.2s ease;
              cursor: pointer;
            ">
              ${isPB ? '🏢' : '🌾'}
            </div>
          `,
          iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
          iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14]
        });

        const marker = L.marker([resp.lat, resp.lng], { icon: customIcon }).addTo(respGroup);
        markersRef.current.set(resp.id_responden, marker);

        const respPopup = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 210px; padding: 2px;">
            <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; margin-bottom: 6px; background: ${isPB ? '#DCEAFA; color: #0D3E77;' : '#E6F4ED; color: #027A48;'}">
              ${resp.tipe_responden}
            </div>
            <div style="font-size: 13px; font-weight: bold; color: #101828; margin-bottom: 4px;">
              ${displayName}
            </div>
            <div style="color: #667085; font-size: 11px; margin-bottom: 8px;">
              📍 ${displayAddress}
            </div>
            <div style="border-top: 1px solid #E4E7EC; padding-top: 6px; font-size: 11px; line-height: 1.5;">
              <div><strong>Komoditas Utama:</strong> ${resp.komoditas_utama}</div>
              <div><strong>Kapasitas Gudang:</strong> ${resp.kapasitas_gudang || '100 Ton'}</div>
              <div><strong>Volume Mingguan:</strong> ${resp.volume_mingguan}</div>
            </div>
            <div style="margin-top: 8px; text-align: right;">
              <span style="font-size: 10px; font-weight: bold; color: #1E74C7; cursor: pointer;">
                Klik untuk rincian detail &rarr;
              </span>
            </div>
          </div>
        `;
        marker.bindPopup(respPopup);

        marker.on('click', () => {
          handleSelectRespondent(resp, false);
        });
      });
    }

  }, [mapMode, routes, nodeStats, respondentLocations, activeRouteId, selectedNodeName, selectedRespondent, isRespondentUnlocked]);

  // Handler for selecting a respondent (from map click or facility list click)
  const handleSelectRespondent = (resp, flyTo = true) => {
    setSelectedRespondent(resp);
    setShowDetailModal(true);

    if (flyTo && mapInstanceRef.current && resp?.lat && resp?.lng) {
      mapInstanceRef.current.flyTo([resp.lat, resp.lng], 13.5, {
        animate: true,
        duration: 0.8
      });

      // Open marker popup if exists
      const marker = markersRef.current.get(resp.id_responden);
      if (marker) {
        setTimeout(() => marker.openPopup(), 400);
      }
    }
  };

  // Reset map view to center DIY
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-7.80, 110.37], 10);
    }
    setSelectedNodeName(null);
    setActiveRouteId(null);
    setSelectedRespondent(null);
    setShowDetailModal(false);
    if (onSelectWilayah) onSelectWilayah('Semua Wilayah DIY');
  };

  return (
    <div className="clean-card bg-white overflow-hidden rounded-2xl border border-[#E4E7EC] shadow-2xs">
      
      {/* 1. Header Controls Bar */}
      <div className="p-4 border-b border-[#E4E7EC] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        
        {/* Left: Mode Title & Privacy Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#DCEAFA] text-[#0D3E77] flex items-center justify-center shrink-0 border border-[#B3D4F2]">
            <Compass className="w-4 h-4 text-[#12539E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#101828] uppercase tracking-wider m-0">
                {mapMode === 'flow' ? 'Peta Spasial Aliran Distribusi Komoditas' : 'Peta Sebaran Titik Responden & Sentra'}
              </h3>
              {mapMode === 'respondents' && (
                <button
                  onClick={() => !isRespondentUnlocked && setShowPasswordModal(true)}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                    isRespondentUnlocked
                      ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                      : 'bg-[#FEF0C7] text-[#DC6803] border-[#FDE272] hover:bg-[#FEE4E2]'
                  }`}
                >
                  {isRespondentUnlocked ? <Unlock className="w-3 h-3 text-[#12B76A]" /> : <Lock className="w-3 h-3 text-[#F79009]" />}
                  {isRespondentUnlocked ? 'Identitas Terbuka' : 'Otorisasi PIN (Klik Buka)'}
                </button>
              )}
            </div>
            <p className="text-xs text-[#667085]">
              {mapMode === 'flow' ? 'Visualisasi rute logistik inter-regional & intra-DIY' : 'Pinpoint lokasi pedagang besar & kelompok produsen DIY (Klik titik/kartu untuk rincian detail)'}
            </p>
          </div>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Main Mode Toggle */}
          <div className="inline-flex bg-[#F2F4F7] p-1 rounded-full border border-[#E4E7EC] text-xs">
            <button
              onClick={() => { setMapMode('flow'); setSelectedRespondent(null); setShowDetailModal(false); }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'flow'
                  ? 'bg-white text-[#0D3E77] font-bold shadow-2xs border border-[#D0D5DD]/40'
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
                  ? 'bg-white text-[#0D3E77] font-bold shadow-2xs border border-[#D0D5DD]/40'
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
            <option value="esri_street">Peta Wilayah Detail (ESRI Street)</option>
            <option value="osm">OpenStreetMap (OSM Standard)</option>
            <option value="esri_light">Peta Terang Minimalis (ESRI Gray)</option>
            <option value="esri_topo">Topografi &amp; Kontur (ESRI Topo)</option>
            <option value="esri_dark">Peta Gelap Minimalis (ESRI Dark)</option>
          </select>

          {/* Reset Map View Button */}
          <button
            onClick={handleResetView}
            className="p-2 text-[#667085] hover:text-[#0D3E77] bg-white hover:bg-[#F2F4F7] border border-[#D0D5DD] rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Reset Posisi Peta ke DIY"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Map Viewport */}
      <div className="relative w-full h-[540px] bg-[#F2F7FD] overflow-hidden">
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0 transition-all duration-300"
        ></div>

        {/* Overlay Legend */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E4E7EC] text-[#101828] text-xs shadow-lg max-w-[240px]">
          <div className="flex items-center gap-2 font-bold text-[#101828] border-b border-[#E4E7EC] pb-1.5 mb-2">
            <Layers className="w-4 h-4 text-[#C89B3C]" />
            <span>Keterangan Map</span>
          </div>
          {mapMode === 'flow' ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[#059669] rounded"></span>
                <span className="text-[#344054]">Arus Masuk (Sentra &rarr; DIY)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[#2563EB] rounded"></span>
                <span className="text-[#344054]">Arus Keluar / Distribusi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0D3E77] border-2 border-white shadow-2xs"></span>
                <span className="text-[#344054]">Simpul Hub DIY (5 Kab/Kota)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1E74C7] text-white flex items-center justify-center text-[10px] shadow-2xs">🏢</span>
                <span className="text-[#344054]">Pedagang Besar (PB)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#12B76A] text-white flex items-center justify-center text-[10px] shadow-2xs">🌾</span>
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
              {mapMode === 'flow'
                ? `Rute Aliran Terbesar — Total: ${totalFlowVolume.toLocaleString('id-ID')} ${(selectedKomoditas && selectedKomoditas.toLowerCase().includes('liter')) ? 'Liter' : 'Ton'} (${routes.length} Rute)`
                : `Daftar Fasilitas Responden Terdaftar (${respondentLocations.length} Fasilitas)`
              }
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
              const isLiterRoute = selectedKomoditas && selectedKomoditas.toLowerCase().includes('liter');
              const cardUnit = isLiterRoute ? 'Liter' : 'Ton';
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
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${r.type === 'inflow' ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#DCEAFA] text-[#0D3E77]'}`}>
                      #{i + 1} {r.type === 'inflow' ? 'Masuk' : 'Keluar'}
                    </span>
                    <span className="font-bold font-mono text-[#101828]">{r.volume.toLocaleString('id-ID')} {cardUnit}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#101828] truncate">
                    <span className="truncate">{r.from}</span>
                    <ArrowRight className="w-3 h-3 text-[#667085] shrink-0" />
                    <span className="truncate">{r.to}</span>
                  </div>
                  <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      className={`h-full rounded-full ${r.type === 'inflow' ? 'bg-[#059669]' : 'bg-[#1E74C7]'}`}
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
            {respondentLocations.map((resp, idx) => {
              const isPB = (resp.tipe_responden || '').toLowerCase().includes('pedagang');
              const isSelected = selectedRespondent?.id_responden === resp.id_responden;
              const displayName = isRespondentUnlocked ? resp.nama_responden : `Responden #${idx + 1}`;
              const displayAddress = isRespondentUnlocked ? resp.alamat : `${resp.kabupaten} (Alamat Tersandi)`;

              return (
                <div
                  key={resp.id_responden}
                  onClick={() => handleSelectRespondent(resp, true)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#F2F7FD] border-[#1E74C7] ring-2 ring-[#1E74C7]/20 shadow-xs'
                      : 'bg-[#F9FAFB] border-[#E4E7EC] hover:border-[#D0D5DD] hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${isPB ? 'bg-[#DCEAFA] text-[#0D3E77]' : 'bg-[#ECFDF3] text-[#027A48]'}`}>
                        {isPB ? '🏢 Pedagang Besar' : '🌾 Produsen'}
                      </span>
                      <span className="text-[10px] font-bold text-[#667085]">{resp.kabupaten}</span>
                    </div>

                    <h5 className="text-xs font-bold text-[#101828] truncate">
                      {displayName}
                    </h5>

                    <p className="text-[11px] text-[#667085] truncate mt-0.5">
                      📍 {displayAddress}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#E4E7EC] pt-2 mt-2.5 text-[10.5px]">
                    <span className="text-[#667085] font-medium truncate">
                      Vol: <strong className="text-[#101828]">{resp.volume_mingguan}</strong>
                    </span>
                    <span className="text-[#1E74C7] font-bold flex items-center gap-1 hover:underline">
                      Rincian &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RESPONDENT DETAIL MODAL / DRAWER */}
      {showDetailModal && selectedRespondent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#0A2E5C] text-white p-4 sm:p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-xs ${
                  selectedRespondent.tipe_responden.includes('Pedagang') ? 'bg-[#1E74C7]' : 'bg-[#12B76A]'
                }`}>
                  {selectedRespondent.tipe_responden.includes('Pedagang') ? '🏢' : '🌾'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C89B3C] bg-white/10 px-2 py-0.5 rounded">
                    {selectedRespondent.tipe_responden}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight m-0 mt-0.5">
                    {isRespondentUnlocked ? selectedRespondent.nama_responden : `Responden Tersandi (#${selectedRespondent.id_responden.slice(0, 6)})`}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-[#344054]">
              
              {/* Privacy Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                isRespondentUnlocked
                  ? 'bg-[#ECFDF3] border-[#ABEFC6] text-[#027A48]'
                  : 'bg-[#FEF0C7] border-[#FDE272] text-[#DC6803]'
              }`}>
                <div className="flex items-center gap-2">
                  {isRespondentUnlocked ? <ShieldCheck className="w-4 h-4 text-[#12B76A]" /> : <Lock className="w-4 h-4 text-[#F79009]" />}
                  <span className="font-semibold text-[11px]">
                    {isRespondentUnlocked
                      ? 'Identitas Terbuka (Akses Otorisasi Biasa/Admin)'
                      : 'Identitas Tersandi (Privasi Survei TPID Dijaga)'}
                  </span>
                </div>

                {!isRespondentUnlocked && (
                  <button
                    onClick={() => { setShowDetailModal(false); setShowPasswordModal(true); }}
                    className="px-3 py-1 bg-[#0A2E5C] text-white font-bold text-[10px] rounded-lg shadow-2xs hover:bg-[#071D3D] transition-colors shrink-0 cursor-pointer"
                  >
                    Buka PIN
                  </button>
                )}
              </div>

              {/* Detail Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#F9FAFB] p-3.5 rounded-xl border border-[#E4E7EC]">
                <div>
                  <span className="text-[10px] font-bold text-[#667085] uppercase">Kabupaten / Kota</span>
                  <p className="font-bold text-[#101828] text-xs mt-0.5">{selectedRespondent.kabupaten}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#667085] uppercase">Komoditas Utama</span>
                  <p className="font-bold text-[#101828] text-xs mt-0.5">{selectedRespondent.komoditas_utama}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#667085] uppercase">Kapasitas Gudang</span>
                  <p className="font-bold text-[#101828] text-xs mt-0.5">{selectedRespondent.kapasitas_gudang || '100 Ton'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#667085] uppercase">Volume Mingguan</span>
                  <p className="font-bold text-[#0D3E77] text-xs mt-0.5">{selectedRespondent.volume_mingguan}</p>
                </div>
              </div>

              {/* Address & GPS Coordinates */}
              <div className="space-y-2 bg-white p-3 rounded-xl border border-[#E4E7EC]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#1E74C7] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-[#667085] uppercase">Alamat Presisi</span>
                    <p className="font-medium text-[#101828] text-xs mt-0.5 leading-relaxed">
                      {isRespondentUnlocked ? selectedRespondent.alamat : `${selectedRespondent.kabupaten} (Alamat Lengkap Tersandi)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#E4E7EC] text-[10.5px]">
                  <span className="text-[#667085] font-medium">Koordinat GPS:</span>
                  <span className="font-mono font-bold text-[#101828]">
                    {selectedRespondent.lat.toFixed(4)}, {selectedRespondent.lng.toFixed(4)}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-[#F9FAFB] border-t border-[#E4E7EC] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (mapInstanceRef.current && selectedRespondent.lat && selectedRespondent.lng) {
                    mapInstanceRef.current.flyTo([selectedRespondent.lat, selectedRespondent.lng], 14, { animate: true, duration: 0.8 });
                  }
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 bg-white hover:bg-[#F2F7FD] border border-[#D0D5DD] text-[#0D3E77] font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#1E74C7]" />
                <span>Zoom &amp; Fokus di Peta</span>
              </button>

              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-[#0A2E5C] hover:bg-[#071D3D] text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Password Authorization Modal Triggered Directly from Lock Button */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Otorisasi Peta Sebaran Titik Responden"
        subtitle="Masukkan Kata Sandi / PIN Otorisasi TPID BI DIY untuk membuka titik presisi lokasi responden tersandi."
      />

    </div>
  );
}
