/**
 * ============================================================================
 * MODUL KALKULASI MATRIKS ALIRAN & BUTTERFLY CHART
 * PRD Dashboard Komoditas DIY v1.0 - Section 6.3 & Section 7.2
 * Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta
 * ============================================================================
 */

import { REF_KOMODITAS, REF_WILAYAH } from '../data/seedData';

// Helper matching functions
const matchPeriode = (rowPeriode, targetPeriode) => {
  if (!targetPeriode || targetPeriode === 'Semua' || targetPeriode === 'All') return true;
  return rowPeriode === targetPeriode;
};

const matchKomoditas = (rowKomoditas, targetKomoditas) => {
  if (!targetKomoditas || targetKomoditas === 'Semua' || targetKomoditas === 'All') return true;
  if (!rowKomoditas) return false;
  const n1 = rowKomoditas.toString().toLowerCase().replace(/\s*\(ton\)|\s*\(kg\)/g, '').trim();
  const n2 = targetKomoditas.toString().toLowerCase().replace(/\s*\(ton\)|\s*\(kg\)/g, '').trim();
  return n1 === n2 || rowKomoditas === targetKomoditas;
};

const matchWilayah = (rowWilayah, targetWilayah) => {
  if (!targetWilayah || targetWilayah === 'Semua Wilayah DIY' || targetWilayah === 'All' || targetWilayah === 'Semua') return true;
  if (!rowWilayah) return false;
  const n1 = rowWilayah.toString().toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim();
  const n2 = targetWilayah.toString().toLowerCase().replace(/^(kab\.|kota)\s*/g, '').trim();
  return n1 === n2 || rowWilayah === targetWilayah;
};

/**
 * 1. Matriks Neraca Arus per Komoditas x Wilayah (Tab 1 Panel B)
 */
export function calculateMatrixNeracaTab1(rawRingkasan = [], selectedPeriode, selectedKlaster = 'semua') {
  return REF_KOMODITAS.map(kom => {
    const row = {
      id_komoditas: kom.id_komoditas,
      nama_komoditas: kom.nama_singkat || kom.nama_komoditas.replace(' (Ton)', ''),
      full_name: kom.nama_komoditas,
      total_neraca: 0,
      wilayah: {}
    };

    let totalMasuk = 0;
    let totalKeluar = 0;

    REF_WILAYAH.forEach(wil => {
      const matches = rawRingkasan.filter(r =>
        !r.is_deleted &&
        matchPeriode(r.id_periode, selectedPeriode) &&
        matchKomoditas(r.komoditas, kom.nama_komoditas) &&
        matchWilayah(r.kab_kota, wil.nama_kab_kota) &&
        (selectedKlaster === 'semua' || r.tipe_responden === selectedKlaster)
      );

      const vIn = matches
        .filter(r => r.jenis_aliran === 'vol_masuk_ton')
        .reduce((sum, r) => sum + (Number(r.volume_ton) || 0), 0);

      const vOut = matches
        .filter(r => r.jenis_aliran === 'vol_keluar_ton')
        .reduce((sum, r) => sum + (Number(r.volume_ton) || 0), 0);

      const net = vIn - vOut;
      row.wilayah[wil.nama_kab_kota] = Number(net.toFixed(2));
      totalMasuk += vIn;
      totalKeluar += vOut;
    });

    row.total_neraca = Number((totalMasuk - totalKeluar).toFixed(2));
    return row;
  });
}

/**
 * 2. Butterfly Mirrored Chart Data (Tab 1 Panel G & Tab 2 Panel C)
 */
export function calculateButterflyData(rawRingkasan = [], selectedPeriode, selectedWilayah = 'Semua Wilayah DIY', selectedKlaster = 'semua') {
  return REF_KOMODITAS.map(kom => {
    const matches = rawRingkasan.filter(r =>
      !r.is_deleted &&
      matchPeriode(r.id_periode, selectedPeriode) &&
      matchKomoditas(r.komoditas, kom.nama_komoditas) &&
      matchWilayah(r.kab_kota, selectedWilayah) &&
      (selectedKlaster === 'semua' || r.tipe_responden === selectedKlaster)
    );

    const vIn = matches
      .filter(r => r.jenis_aliran === 'vol_masuk_ton')
      .reduce((sum, r) => sum + (Number(r.volume_ton) || 0), 0);

    const vOut = matches
      .filter(r => r.jenis_aliran === 'vol_keluar_ton')
      .reduce((sum, r) => sum + (Number(r.volume_ton) || 0), 0);

    const net = vIn - vOut;

    return {
      id_komoditas: kom.id_komoditas,
      komoditas: kom.nama_singkat || kom.nama_komoditas.replace(' (Ton)', ''),
      full_name: kom.nama_komoditas,
      volMasuk: Number(vIn.toFixed(2)),
      volKeluar: Number(vOut.toFixed(2)),
      neraca: Number(net.toFixed(2)),
      status: net > 0.1 ? 'Surplus' : net < -0.1 ? 'Defisit' : 'Seimbang'
    };
  }).sort((a, b) => b.volMasuk - a.volMasuk);
}

/**
 * 3. Grouped Rantai Pasok Matrix (Tab 2 Panel B)
 */
export function calculateTab2GroupedMatrix(rawRingkasan = [], selectedPeriode, tab2Responden = 'Semua') {
  return REF_KOMODITAS.map(kom => {
    const row = {
      komoditas: kom.nama_singkat || kom.nama_komoditas.replace(' (Ton)', ''),
      full_name: kom.nama_komoditas,
      id_komoditas: kom.id_komoditas,
      wilayahData: {},
      totalMasuk: 0,
      totalKeluar: 0,
      totalSelisih: 0
    };

    REF_WILAYAH.forEach(wil => {
      const matches = rawRingkasan.filter(r =>
        !r.is_deleted &&
        matchPeriode(r.id_periode, selectedPeriode) &&
        matchKomoditas(r.komoditas, kom.nama_komoditas) &&
        matchWilayah(r.kab_kota, wil.nama_kab_kota) &&
        (tab2Responden === 'Semua' ||
         (tab2Responden === 'Pedagang Besar' && r.tipe_responden === 'pedagang_besar') ||
         (tab2Responden === 'Produsen' && r.tipe_responden === 'produsen'))
      );

      const vIn = matches.filter(r => r.jenis_aliran === 'vol_masuk_ton').reduce((s, r) => s + (Number(r.volume_ton) || 0), 0);
      const vOut = matches.filter(r => r.jenis_aliran === 'vol_keluar_ton').reduce((s, r) => s + (Number(r.volume_ton) || 0), 0);
      const selisih = vIn - vOut;

      row.wilayahData[wil.nama_kab_kota] = {
        masuk: Number(vIn.toFixed(2)),
        keluar: Number(vOut.toFixed(2)),
        selisih: Number(selisih.toFixed(2))
      };

      row.totalMasuk += vIn;
      row.totalKeluar += vOut;
    });

    row.totalSelisih = Number((row.totalMasuk - row.totalKeluar).toFixed(2));
    row.totalMasuk = Number(row.totalMasuk.toFixed(2));
    row.totalKeluar = Number(row.totalKeluar.toFixed(2));
    return row;
  });
}

/**
 * 4. Dekomposisi Selisih per Wilayah untuk Komoditas Terpilih (Tab 2 Panel E)
 */
export function calculateTab2Decomposition(rawRingkasan = [], selectedPeriode, targetKomoditas) {
  return REF_WILAYAH.map(wil => {
    const matches = rawRingkasan.filter(r =>
      !r.is_deleted &&
      matchPeriode(r.id_periode, selectedPeriode) &&
      matchKomoditas(r.komoditas, targetKomoditas) &&
      matchWilayah(r.kab_kota, wil.nama_kab_kota)
    );

    const vIn = matches.filter(r => r.jenis_aliran === 'vol_masuk_ton').reduce((s, r) => s + (Number(r.volume_ton) || 0), 0);
    const vOut = matches.filter(r => r.jenis_aliran === 'vol_keluar_ton').reduce((s, r) => s + (Number(r.volume_ton) || 0), 0);
    const net = vIn - vOut;

    return {
      wilayah: wil.label || wil.nama_kab_kota.replace(/^(kab\.|kota)\s*/i, ''),
      full_wilayah: wil.nama_kab_kota,
      masuk: Number(vIn.toFixed(2)),
      keluar: Number(vOut.toFixed(2)),
      selisih: Number(net.toFixed(2)),
      isPositive: net >= 0
    };
  });
}

/**
 * 5. Geospatial Origin-Destination Flow Aggregator (Tab 2 From-To Map)
 */
import { GEO_NODES } from '../data/seedData';

export function calculateGeospatialFlows(
  arusMasuk = [],
  arusKeluar = [],
  selectedPeriode,
  selectedKomoditas,
  selectedWilayah = 'Semua',
  flowMode = 'all' // 'all', 'inflow', 'outflow'
) {
  const routesMap = new Map();

  const matchPeriodeLocal = (p) => !selectedPeriode || selectedPeriode === 'Semua' || p === selectedPeriode;
  const matchKomLocal = (k) => {
    if (!selectedKomoditas || selectedKomoditas === 'Semua' || selectedKomoditas === 'All') return true;
    const n1 = (k || '').toLowerCase().replace(/\s*\(ton\)|\s*\(kg\)/g, '').trim();
    const n2 = selectedKomoditas.toLowerCase().replace(/\s*\(ton\)|\s*\(kg\)/g, '').trim();
    return n1 === n2 || k === selectedKomoditas;
  };
  const matchWilLocal = (w) => {
    if (!selectedWilayah || selectedWilayah === 'Semua' || selectedWilayah === 'Semua Wilayah DIY') return true;
    return (w || '').toLowerCase().includes(selectedWilayah.toLowerCase().replace(/^(kab\.|kota)\s*/g, ''));
  };

  // 1. Process Arus Masuk (From: daerah_asal -> To: kab_kota DIY)
  if (flowMode === 'all' || flowMode === 'inflow') {
    arusMasuk.forEach(row => {
      if (!matchPeriodeLocal(row.id_periode) || !matchKomLocal(row.komoditas || row.id_komoditas)) return;
      if (selectedWilayah !== 'Semua' && selectedWilayah !== 'Semua Wilayah DIY' && !matchWilLocal(row.kab_kota)) return;

      const fromName = row.daerah_asal || 'Luar DIY Lainnya';
      const toName = row.kab_kota || 'Kab. Sleman';
      const vol = Number(row.volume_ton) || 0;
      if (vol <= 0) return;

      const fromNode = GEO_NODES[fromName] || GEO_NODES['Luar DIY Lainnya'];
      const toNode = GEO_NODES[toName] || GEO_NODES['Kab. Sleman'];

      const key = `${fromName}|${toName}|inflow`;
      if (!routesMap.has(key)) {
        routesMap.set(key, {
          id: key,
          type: 'inflow',
          from: fromName,
          to: toName,
          fromCoords: [fromNode.lng, fromNode.lat],
          toCoords: [toNode.lng, toNode.lat],
          fromLabel: fromNode.label || fromName,
          toLabel: toNode.label || toName,
          volume: 0,
          commodity: row.komoditas,
          isExternal: Boolean(row.luar_diy),
          partnerType: row.jenis_pemasok || 'Pemasok Pangan'
        });
      }
      routesMap.get(key).volume += vol;
    });
  }

  // 2. Process Arus Keluar (From: kab_kota DIY -> To: daerah_tujuan)
  if (flowMode === 'all' || flowMode === 'outflow') {
    arusKeluar.forEach(row => {
      if (!matchPeriodeLocal(row.id_periode) || !matchKomLocal(row.komoditas || row.id_komoditas)) return;
      if (selectedWilayah !== 'Semua' && selectedWilayah !== 'Semua Wilayah DIY' && !matchWilLocal(row.kab_kota)) return;

      const fromName = row.kab_kota || 'Kab. Sleman';
      const toName = row.daerah_tujuan || 'Lainnya (DIY)';
      const vol = Number(row.volume_ton) || 0;
      if (vol <= 0) return;

      const fromNode = GEO_NODES[fromName] || GEO_NODES['Kab. Sleman'];
      const toNode = GEO_NODES[toName] || GEO_NODES['Lainnya (DIY)'];

      const key = `${fromName}|${toName}|outflow`;
      if (!routesMap.has(key)) {
        routesMap.set(key, {
          id: key,
          type: 'outflow',
          from: fromName,
          to: toName,
          fromCoords: [fromNode.lng, fromNode.lat],
          toCoords: [toNode.lng, toNode.lat],
          fromLabel: fromNode.label || fromName,
          toLabel: toNode.label || toName,
          volume: 0,
          commodity: row.komoditas,
          isExternal: Boolean(row.luar_diy || row.keluar_diy),
          partnerType: row.jenis_pembeli || 'Distribusi Pangan'
        });
      }
      routesMap.get(key).volume += vol;
    });
  }

  const routes = Array.from(routesMap.values()).map(r => ({
    ...r,
    volume: Number(r.volume.toFixed(2))
  })).sort((a, b) => b.volume - a.volume);

  const totalFlowVolume = routes.reduce((s, r) => s + r.volume, 0);

  // Aggregate Node Volumes
  const nodeStats = {};
  Object.keys(GEO_NODES).forEach(nodeName => {
    nodeStats[nodeName] = {
      ...GEO_NODES[nodeName],
      totalIn: 0,
      totalOut: 0,
      activeRoutes: 0
    };
  });

  routes.forEach(r => {
    if (nodeStats[r.from]) {
      nodeStats[r.from].totalOut += r.volume;
      nodeStats[r.from].activeRoutes += 1;
    }
    if (nodeStats[r.to]) {
      nodeStats[r.to].totalIn += r.volume;
      nodeStats[r.to].activeRoutes += 1;
    }
  });

  return {
    routes,
    totalFlowVolume: Number(totalFlowVolume.toFixed(2)),
    nodeStats: Object.values(nodeStats).filter(n => n.totalIn > 0 || n.totalOut > 0 || n.type.startsWith('diy'))
  };
}

/**
 * 6. Respondent Pinpoint Location Aggregator (Tab 2 Pinpoint Map)
 */
export function calculateRespondentLocations(respondents = [], targetKomoditas, targetKabupaten, tipeResponden = 'Semua') {
  return respondents.filter(r => {
    if (targetKabupaten && targetKabupaten !== 'Semua' && targetKabupaten !== 'Semua Wilayah DIY' && r.kabupaten !== targetKabupaten) {
      return false;
    }
    if (tipeResponden === 'Pedagang Besar' && !r.tipe_responden.includes('Pedagang')) return false;
    if (tipeResponden === 'Produsen' && !r.tipe_responden.includes('Produsen')) return false;
    return true;
  }).map(r => ({
    ...r,
    lat: r.latitude || (r.kabupaten.includes('Sleman') ? -7.716 : r.kabupaten.includes('Bantul') ? -7.893 : r.kabupaten.includes('Kota') ? -7.797 : -7.828),
    lng: r.longitude || (r.kabupaten.includes('Sleman') ? 110.355 : r.kabupaten.includes('Bantul') ? 110.334 : r.kabupaten.includes('Kota') ? 110.370 : 110.158)
  }));
}
