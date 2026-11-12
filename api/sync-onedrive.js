// Vercel Serverless Function & API Proxy for OneDrive Sync
// Bank Indonesia KPw DIY · PSEKUIN UPN Veteran Yogyakarta

import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { compileWorkbook } from '../src/services/masterCompiler.js';
import { parseAlpsEwsWorkbook, parseEwsWorkbook } from '../src/services/ewsDataParser.js';
import { REF_KOMODITAS, REF_WILAYAH, REF_SATUAN, REF_KLASTER_RESPONDEN } from '../src/data/seedData.js';

/**
 * Master Database: olah Excel di server dengan logika yang SAMA dengan `npm run sync`
 * (scripts/compile_master_database.mjs), lalu kirim JSON. Browser tidak lagi mem-parse Excel master
 * dengan parser terpisah, sehingga angka versi online = versi lokal.
 */
function compileMasterBuffer(buffer) {
  const jsonPath = path.join(process.cwd(), 'public', 'data', 'masterDatabase.json');
  let existing = {};
  try { existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')); } catch { /* tanpa master lama: pakai seed */ }
  const wb = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
  const { dataset } = compileWorkbook(wb, {
    REF_KOMODITAS,
    REF_WILAYAH,
    REF_SATUAN: existing.REF_SATUAN || REF_SATUAN,
    REF_KLASTER_RESPONDEN: existing.REF_KLASTER_RESPONDEN || REF_KLASTER_RESPONDEN,
    respondents: existing.respondents || [],
  });
  return dataset;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbParam = req.query?.db;
  const isEwsAlps = dbParam === 'ews_alps';
  const isEwsHubungan = dbParam === 'ews' || dbParam === 'harga_arus';
  const oneDriveUrl = req.query?.url || 
                      (isEwsAlps
                        ? (process.env.VITE_ONEDRIVE_EWS_URL || 'https://1drv.ms/x/c/91bfd97920eb749f/IQAMDh9u-137Q7cGzN_Lr-Y6AQXyHpEbl1qAq2ow_4yne_k?e=M3kKsn')
                        : isEwsHubungan
                        ? (process.env.VITE_ONEDRIVE_HARGA_ARUS_URL || 'https://1drv.ms/x/c/91bfd97920eb749f/IQCyJrPPrgQnSoxn3iqtZcvYAZu6P0BlyGGmzpyx5rjIlu4?e=QRx7I9')
                        : (process.env.ONEDRIVE_EXCEL_URL || 'https://1drv.ms/x/c/91bfd97920eb749f/IQCdNxmxmw1dQJNhiEWiOvOPAUMNVvmVa5NbtHLSnE2LAoA?e=awmD8v'));

  try {
    // 1. If a direct download URL is configured, attempt fetch
    if (oneDriveUrl && (oneDriveUrl.includes('download') || oneDriveUrl.includes('export') || oneDriveUrl.includes('sharepoint') || oneDriveUrl.includes('1drv.ms'))) {
      const dlUrl = oneDriveUrl.includes('1drv.ms')
        ? (oneDriveUrl.includes('?') ? `${oneDriveUrl}&download=1` : `${oneDriveUrl}?download=1`)
        : oneDriveUrl;
      const response = await fetch(dlUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*'
        }
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        // Verify XLSX magic bytes (PK\x03\x04)
        const bytes = new Uint8Array(buffer.slice(0, 4));
        const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04;

        if (isZip && !isEwsAlps && !isEwsHubungan) {
          const dataset = compileMasterBuffer(buffer);
          if (dataset.laporan_ringkasan.length > 0) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Data-Source', 'onedrive_live_compiled');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.status(200).send(JSON.stringify(dataset));
          }
        } else if (isZip && isEwsAlps) {
          const wb = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
          const dataset = parseAlpsEwsWorkbook(wb);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Data-Source', 'onedrive_ews_alps_live_compiled');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.status(200).send(JSON.stringify(dataset));
        } else if (isZip && isEwsHubungan) {
          const wb = XLSX.read(Buffer.from(buffer), { type: 'buffer' });
          const dataset = parseEwsWorkbook(wb);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Data-Source', 'onedrive_ews_hubungan_live_compiled');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.status(200).send(JSON.stringify(dataset));
        } else if (isZip) {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('X-Data-Source', 'onedrive_live');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.status(200).send(Buffer.from(buffer));
        }
      }
    }

    // 2. Fallback: Return current static JSON dataset (ewsAlpsDatabase.json, ewsDatabase.json, or masterDatabase.json)
    const targetFile = isEwsAlps ? 'ewsAlpsDatabase.json' : isEwsHubungan ? 'ewsDatabase.json' : 'masterDatabase.json';
    const jsonPath = path.join(process.cwd(), 'public', 'data', targetFile);
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Data-Source', isEwsAlps ? 'ews_alps_database_json' : isEwsHubungan ? 'ews_database_json' : 'master_database_json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(jsonContent);
    }

    return res.status(404).json({ error: 'Master database file not found' });
  } catch (error) {
    console.error('[API Proxy] Error fetching dataset:', error);
    return res.status(500).json({ error: 'Failed to sync data', message: error.message });
  }
}
